// src\modules\llm_context\services\modelService.js
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import {
  RunnableBranch,
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import path from "path";
import logger from "../../../../logger.js";
import { getEnterpriseVectorStorePath } from "../util/contextFilePathsUtil.js";
import { loadCustomerVectorStore } from "./customerContextService.js";
import { loadEnterpriseVectorStore } from "./enterpriseContextService.js";
import "cheerio";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import { formatDocumentsAsString } from "langchain/util/document";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import OpenAI from "openai";
import { readConfigFile } from "../../enterprise_config/configurations/detailsConfig.js";
import { determineFollowUp } from "./followUpDeterminer.js";

dotenv.config();

// Retrieve OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;
const config = await readConfigFile();
const company_name = config.name;
const currentModuleURL = new URL(import.meta.url);
let currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("Model Service dir: " + currentModuleDir);

currentModuleDir = currentModuleDir.replace(/^\/([A-Z]:)/, "$1");

// The issue was that I needed to provide some previous messages so that it can follow up.
// Function to generate a response to customer's message
const respondToMessage = async (
  message,
  conversationId,
  isAgent = false,
  previousMessages = []
) => {
  try {
    /*The function takes in the customer's message, their conversation id, previous messages from their conversation,
     isAgent sets the model to behave like customer service agent*/
    logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);
    // check if the openai key is available
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in the environment");
    }

    // load the enterprises vector store created from their company documents
    const generalVectorStore = await loadEnterpriseVectorStore(
      getEnterpriseVectorStorePath(),
      new OpenAIEmbeddings()
    );

    // load the customer's vector store
    const customerVectorStore = await loadCustomerVectorStore(conversationId);

    // merge the customer-specific vector store with the enterprise vector store, if the customer has one
    if (customerVectorStore) {
      logger.info("Gotten customer vector store");
      generalVectorStore.mergeFrom(customerVectorStore);
    }

    // create a retriever for the vector store
    const retriever = generalVectorStore.asRetriever(4);

    // Prepare context information
    const context = isAgent
      ? `You are a customer service agent for ${company_name}`
      : "";
    const target = isAgent ? "customer's" : "user's";

    const SYSTEM_TEMPLATE = `${context} Answer the ${target} questions based on the below context. 
  <context>
  {context}
  </context>
  `;

    // define prompt template to pass the message to the llm, to be used with a document processing chain
    const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_TEMPLATE],
      new MessagesPlaceholder("messages"),
    ]);

    /* define prompt template which generates a search query to query the vector store based on last few messages, 
    important for handing follow up questions*/
    const queryTransformPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("messages"),
      [
        "user",
        "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation. Only respond with the query, nothing else.",
      ],
    ]);

    // initialize LLM
    const chat = new ChatOpenAI({
      model: "gpt-3.5-turbo-1106",
      temperature: 0.2,
      maxTokens: 300,
    });
    logger.info("LLM created!");

    // Create a document processing chain using the specified LLM and prompt for question answering.
    const documentChain = await createStuffDocumentsChain({
      llm: chat,
      prompt: questionAnsweringPrompt,
    });
    logger.info("Document Chain created!");

    //  Create a parser for retrieval input that extracts the content of the last message.
    const parseRetrieverInput = (params) => {
      return params.messages[params.messages.length - 1].content;
    };

    /* The query transforming retriever chain transform queries for more complex retrieval,
    it processes the contents of the query transform prompt using the llm, retrieves documents based on the results. */
    const queryTransformingRetrieverChain = RunnableBranch.from([
      [
        (params) => params.messages.length === 1,
        RunnableSequence.from([parseRetrieverInput, retriever]),
      ],
      queryTransformPrompt
        .pipe(chat)
        .pipe(new StringOutputParser())
        .pipe(retriever),
    ]).withConfig({ runName: "chat_retriever_chain" });

    /* this retriver combines the the query tranforming retriver chain with the document chain,
     allowing retrieval of documents related to the previous conversation turn and use it as context 
     for answering the current message */
    const conversationalRetrievalChain = RunnablePassthrough.assign({
      context: queryTransformingRetrieverChain,
    }).assign({
      answer: documentChain,
    });

    const newMessage = {
      sender: "customer",
      text: message,
      timestamp: new Date()
    };

    previousMessages.push(newMessage);

    console.log(previousMessages)

    const result = await determineFollowUp(previousMessages);

    let messages;

    if (result == 1) {
      console.log("It is not a follow up response");
      messages = [new HumanMessage(message)];
    } else {
      console.log("Seems like a follow up response");
      // Convert the previous messages into a LLM friendly format
      messages = previousMessages.map((msg) => {
        return msg.sender == "agent" || !isNaN(parseInt(msg.sender))
          ? new AIMessage(msg.text)
          : new HumanMessage(msg.text);
      });
    }

    // invoke the conversational retrieval chain with the messages
    const testReply = await conversationalRetrievalChain.invoke({
      messages,
    });

    // extract and return llm response
    const res = testReply.answer;
    logger.info("Generated response: ", res);
    return res;
  } catch (error) {
    throw error;
  }
};

// This did not retrieve documents well, but has good chat history and can respond to follow up questions!
async function respondToMessage4(message, conversationId) {
  // Check if the API key is defined
  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not defined in the environment.");
  }

  const currentModuleURL = new URL(import.meta.url);
  let currentModuleDir = path.dirname(currentModuleURL.pathname);

  const generalVectorStore = await loadEnterpriseVectorStore(
    path.join(currentModuleDir, "vector_store", "enterprise_index"),
    new OpenAIEmbeddings()
  );

  const retriever = generalVectorStore.asRetriever(4);

  const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo-1106",
    temperature: 0,
    apiKey: openaiApiKey,
  });

  const contextualizeQSystemPrompt = `Given a chat history and the latest user question
      which might reference context in the chat history, formulate a standalone question
      which can be understood without the chat history. Do NOT answer the question,
      just reformulate it if needed and otherwise return it as is.`;

  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ["system", contextualizeQSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);
  const contextualizeQChain = contextualizeQPrompt
    .pipe(llm)
    .pipe(new StringOutputParser());

  const qaSystemPrompt = `You are a customer service agent. Answer any of the customer's questions based on the below context. 
    If the context doesn't contain any relevant information to the question, If you don't know the answer, just say that you don't know. keep the answer concise.  
      {context}`;

  const qaPrompt = ChatPromptTemplate.fromMessages([
    ["system", qaSystemPrompt],
    new MessagesPlaceholder("chat_history"),
    ["human", "{question}"],
  ]);

  const contextualizedQuestion = (input) => {
    if ("chat_history" in input) {
      return contextualizeQChain;
    }
    return input.question;
  };

  const ragChain = RunnableSequence.from([
    RunnablePassthrough.assign({
      context: (input) => {
        if ("chat_history" in input) {
          const chain = contextualizedQuestion(input);
          return chain.pipe(retriever).pipe(formatDocumentsAsString);
        }
        return "";
      },
    }),
    qaPrompt,
    llm,
  ]);

  // Connect to Upstash Redis
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // Function to convert chat history to the required format
  const formatChatHistory = (chatHistory) => {
    return chatHistory.map((message) => {
      if (message.role === "human") {
        return new HumanMessage(message.content);
      } else if (message.role === "ai") {
        return new AIMessage(message.content);
      } else {
        throw new Error(`Unknown message role: ${message.role}`);
      }
    });
  };
  // Retrieve chat history from Upstash Redis
  const chatHistoryJSON = await redis.get(conversationId);
  console.log("Retrieved chat history from Redis:", chatHistoryJSON); // Log retrieved data
  const chatHistory = chatHistoryJSON ? chatHistoryJSON : [];
  // const chatHistory = chatHistoryJSON

  // Add the user's message to the chat history
  chatHistory.push({ role: "human", content: message });

  // Format the chat history for the prompt
  const formattedChatHistory = formatChatHistory(chatHistory);

  // Generate AI response
  const aiMsg = await ragChain.invoke({
    question: message,
    chat_history: formattedChatHistory,
  });

  console.log("AIMsg", aiMsg);

  // Add the AI's response to the chat history
  chatHistory.push({ role: "ai", content: aiMsg.content });

  // Store the updated chat history in Upstash Redis
  await redis.set(conversationId, JSON.stringify(chatHistory));

  return aiMsg.content;
}

// This retrieved company documents well, I implemented some sought of customer history with vector stores, since not proper customer history but RAG, handling follow up questions is poor
const respondToMessage3 = async (
  message,
  conversationId,
  isAgent = false,
  previousMessages = []
) => {
  try {
    logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in the environment");
    }

    const generalVectorStore = await loadEnterpriseVectorStore(
      getEnterpriseVectorStorePath(),
      new OpenAIEmbeddings()
    );

    const retriever = generalVectorStore.asRetriever(4);

    const answer = await retriever.invoke("What do I love?");

    logger.info(
      `Answer: ${JSON.stringify(answer[0])}, ${JSON.stringify(
        answer[1]
      )}, ${JSON.stringify(answer[2])},  ${JSON.stringify(answer[3])}`
    );

    const customerVectorStore = await loadCustomerVectorStore(conversationId);

    // Merge customer-specific vector store if available
    if (customerVectorStore) {
      const retriever2 = customerVectorStore.asRetriever(4);

      const answer2 = await retriever2.invoke("What are you?");

      logger.info(
        `Answer: ${JSON.stringify(answer2[0])}, ${JSON.stringify(
          answer2[1]
        )}, ${JSON.stringify(answer2[2])},  ${JSON.stringify(answer2[3])}`
      );

      logger.info("Gotten customer vector store");
      generalVectorStore.mergeFrom(customerVectorStore);
    }

    const retriever3 = generalVectorStore.asRetriever(4);

    const answer3 = await retriever3.invoke("What did I say about roses?");

    logger.info(
      `Answer3: ${JSON.stringify(answer3[0])}, ${JSON.stringify(
        answer3[1]
      )}, ${JSON.stringify(answer3[2])},`
    );

    // Prepare context information
    const context = isAgent ? "You are a customer service agent." : "";

    const SYSTEM_TEMPLATE = `${context} Answer the user's questions based on the below context which is from company documents and some parts are customer conversation history. 
  <context>
  {context}
  </context>
  `;

    const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_TEMPLATE],
      new MessagesPlaceholder("messages"),
    ]);

    const chat = new ChatOpenAI({
      model: "gpt-3.5-turbo-1106",
      temperature: 0.2,
    });

    logger.info("LLM created!");

    const documentChain = await createStuffDocumentsChain({
      llm: chat,
      prompt: questionAnsweringPrompt,
    });

    logger.info("Document Chain created!");

    const parseRetrieverInput = (params) => {
      return params.messages[params.messages.length - 1].content;
    };

    const retrievalChain = RunnablePassthrough.assign({
      context: RunnableSequence.from([parseRetrieverInput, retriever3]),
    }).assign({
      answer: documentChain,
    });

    const reply2 = await retrievalChain.invoke({
      messages: [new HumanMessage(message)],
    });

    logger.info(`Reply 2: ${reply2.answer}`);

    const res = reply2.answer;

    return res;
  } catch (error) {
    throw error;
  }
};

// This had the most potential, retrieval works fine but to combine retrieval with the chat history is an issue
// It is saying undefined cannot have function replace, the local of the bug is in OpenAI files, too deep for my experience level
async function respondToMessage2(message, conversationId) {
  // Initialize the chat prompt template

  const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context. 
  If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":
  
  <context>
  {context}
  </context>
  `;

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    new MessagesPlaceholder("history"),
    new MessagesPlaceholder("message"),
  ]);

  const chat = new ChatOpenAI({
    model: "gpt-3.5-turbo-1106",
    temperature: 0.2,
  });

  logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined in the environment");
  }

  const generalVectorStore = await loadEnterpriseVectorStore(
    getEnterpriseVectorStorePath(),
    new OpenAIEmbeddings()
  );

  const retriever = generalVectorStore.asRetriever(4);

  const answer = await retriever.invoke("What is my secret?");

  logger.info(
    `Answer: ${JSON.stringify(answer[0])}, ${JSON.stringify(
      answer[1]
    )}, ${JSON.stringify(answer[2])},  ${JSON.stringify(answer[3])}`
  );

  const documentChain = await createStuffDocumentsChain({
    llm: chat,
    prompt: prompt,
  });

  const parseRetrieverInput = (params) => {
    if (
      !params.message ||
      !Array.isArray(params.message) ||
      params.message.length === 0
    ) {
      console.error("Invalid or empty message array:", params.message);
      return null; // Or handle appropriately based on your application's logic
    }
    return params.message[params.message.length - 1].content;
  };

  const retrievalChain = RunnablePassthrough.assign({
    context: RunnableSequence.from([parseRetrieverInput, retriever]),
  }).assign({
    answer: documentChain,
  });

  // Wrap the chain with message history handling
  const chainWithHistory = new RunnableWithMessageHistory({
    runnable: documentChain,
    getMessageHistory: (sessionId) =>
      new UpstashRedisChatMessageHistory({
        sessionId,
        config: {
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        },
      }),
    inputMessagesKey: "message",
    historyMessagesKey: "history",
  });

  let result = await chainWithHistory.invoke(
    {
      message,
    },
    {
      configurable: {
        sessionId: conversationId,
      },
    }
  );

  console.log("Result:", result);

  return result.data.content.content;
}

// duplicate of customer_vector_store implementation just in case I missed something
const respondToMessage5 = async (message, conversationId, isAgent = false) => {
  try {
    logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in the environment");
    }

    const generalVectorStore = await loadEnterpriseVectorStore(
      getEnterpriseVectorStorePath(),
      new OpenAIEmbeddings()
    );

    const retriever = generalVectorStore.asRetriever(4);

    const answer = await retriever.invoke("What is my secret?");

    logger.info(
      `Answer: ${JSON.stringify(answer[0])}, ${JSON.stringify(
        answer[1]
      )}, ${JSON.stringify(answer[2])},  ${JSON.stringify(answer[3])}`
    );

    const customerVectorStore = await loadCustomerVectorStore(conversationId);

    // Merge customer-specific vector store if available
    if (customerVectorStore) {
      const retriever2 = customerVectorStore.asRetriever(4);
      const answer2 = await retriever2.invoke("What are you?");
      logger.info(
        `Answer: ${JSON.stringify(answer2[0])}, ${JSON.stringify(
          answer2[1]
        )}, ${JSON.stringify(answer2[2])},  ${JSON.stringify(answer2[3])}`
      );
      logger.info("Gotten customer vector store");
      generalVectorStore.mergeFrom(customerVectorStore);
    }

    const retriever3 = generalVectorStore.asRetriever(4);

    const answer3 = await retriever3.invoke("What did I say about roses?");

    logger.info(
      `Answer3: ${JSON.stringify(answer3[0])}, ${JSON.stringify(
        answer3[1]
      )}, ${JSON.stringify(answer3[2])},`
    );

    // Prepare context information
    const context = isAgent ? "You are a customer service agent." : "";

    const SYSTEM_TEMPLATE = `Answer the user's questions based on the below context. 
  If the context doesn't contain any relevant information to the question, don't make something up and just say "I don't know":
  
  <context>
  {context}
  </context>
  `;

    const questionAnsweringPrompt = ChatPromptTemplate.fromMessages([
      ["system", SYSTEM_TEMPLATE],
      new MessagesPlaceholder("messages"),
    ]);

    const chat = new ChatOpenAI({
      model: "gpt-3.5-turbo-1106",
      temperature: 0.2,
    });

    logger.info("LLM created!");

    const documentChain = await createStuffDocumentsChain({
      llm: chat,
      prompt: questionAnsweringPrompt,
    });

    logger.info("Document Chain created!");

    const parseRetrieverInput = (params) => {
      return params.messages[params.messages.length - 1].content;
    };

    const retrievalChain = RunnablePassthrough.assign({
      context: RunnableSequence.from([parseRetrieverInput, retriever3]),
    }).assign({
      answer: documentChain,
    });

    const reply2 = await retrievalChain.invoke({
      messages: [new HumanMessage(message)],
    });

    logger.info(`Reply 2: ${reply2.answer}`);

    const res = reply2.answer;

    return res;
  } catch (error) {
    throw error;
  }
};

export { respondToMessage };
