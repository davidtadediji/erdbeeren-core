// src\modules\llm_context\services\modelService.js
import { PromptTemplate } from "@langchain/core/prompts";
// import { RunnableSequence } from "@langchain/core/runnables";
import { RetrievalQAChain } from "langchain/chains";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import path from "path";
import logger from "../../../../logger.js";
import { getEnterpriseVectorStorePath } from "../util/contextFilePathsUtil.js";
import { loadCustomerVectorStore } from "./customerContextService.js";
import { loadEnterpriseVectorStore } from "./enterpriseContextService.js";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BaseMessage } from "@langchain/core/messages";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";

const currentModuleURL = new URL(import.meta.url);
let currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("Model Service dir: " + currentModuleDir);

currentModuleDir = currentModuleDir.replace(/^\/([A-Z]:)/, "$1");


const respondToMessage = async (message, customersSid, isAgent = false) => {
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

    const customerVectorStore = await loadCustomerVectorStore(customersSid);

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

    return { res };
  } catch (error) {
    throw error;
  }
};

const customerProfiling = async (message) => {
  try {
    logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);

    const parser = StructuredOutputParser.fromNamesAndDescriptions({
      name: "name of the customer",
      location: "location of the customer",
      age: "age of the customer",
    });

    const parameterNames = Object.keys(parser.schema);

    const promptTemplate = PromptTemplate.fromTemplate(
      `Extract the following information from the message (if available):\n{format_instructions}\n{message}\nQuestion:\nWhat are ${parameterNames.join(
        ", "
      )} of the customer having the message?`
    );

    const chain = RunnableSequence.from([
      promptTemplate,
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo-1106",
        temperature: 0,
      }),
      parser,
    ]);

    const response = await chain.invoke({
      message,
      format_instructions: parser.getFormatInstructions(),
    });

    const userInfo = {};

    for (const [key, value] of Object.entries(response)) {
      if (value) {
        userInfo[key] = value;
      }
    }

    return userInfo;
  } catch (error) {
    logger.error("Error during customer profiling: " + error);
    throw error;
  }
};

// Create a PromptTemplate with placeholders for context and message
const respondToMessage2 = async (message, customersSid, isAgent = false) => {
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

    const customerVectorStore = await loadCustomerVectorStore(customersSid);

    const retriever2 = customerVectorStore.asRetriever(4);

    const answer2 = await retriever2.invoke("What are you?");

    logger.info(
      `Answer: ${JSON.stringify(answer2[0])}, ${JSON.stringify(
        answer2[1]
      )}, ${JSON.stringify(answer2[2])},  ${JSON.stringify(answer2[3])}`
    );

    logger.info("Gotten customer vector store");

    // Merge customer-specific vector store if available
    if (customerVectorStore) {
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

    return { res };
  } catch (error) {
    throw error;
  }
};

export { customerProfiling, respondToMessage, respondToMessage2 };
