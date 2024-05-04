// src\modules\llm_context\services\modelService.js
import { PromptTemplate } from "@langchain/core/prompts"; // Import PromptTemplate
import { RunnableSequence } from "@langchain/core/runnables";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { StructuredOutputParser } from "langchain/output_parsers";
import path from "path";
import logger from "../../../../logger.js";
import { getEnterpriseVectorStorePath } from "../util/contextFilePathsUtil.js";
import { loadCustomerVectorStore } from "./customerContextService.js";
import { loadEnterpriseVectorStore } from "./enterpriseContextService.js";

const currentModuleURL = new URL(import.meta.url);
let currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("Model Service dir: " + currentModuleDir);

currentModuleDir = currentModuleDir.replace(/^\/([A-Z]:)/, "$1");

// Create a PromptTemplate with placeholders for context and message
const respondToMessage = async (message, customersSid, isAgent = false) => {
  try {
    logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in the environment");
    }

    const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const generalVectorStore = await loadEnterpriseVectorStore(
      getEnterpriseVectorStorePath(),
      new OpenAIEmbeddings()
    );

    const customerVectorStore = await loadCustomerVectorStore(customersSid);

    logger.info("Gotten customer vector store");

    // Merge customer-specific vector store if available
    if (customerVectorStore) {
      generalVectorStore.merge_from(customerVectorStore);
    }

    // Prepare context information
    const context = isAgent ? "You are a customer service agent." : "";

    // Create a PromptTemplate with placeholders for context and message
    const promptTemplate = PromptTemplate.fromTemplate(
      `{context}
      Reply to Customer Message: {message}`
    );

    // Format the prompt with placeholders
    const formattedPrompt = await promptTemplate.format({
      context,
      message,
    });

    const chain = RetrievalQAChain.fromLLM(
      model,
      generalVectorStore.asRetriever()
    );

    const res = await chain.call({
      query: formattedPrompt,
    });

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
      new OpenAI({ apiKey: process.env.OPENAI_API_KEY, temperature: 0 }),
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

export { customerProfiling, respondToMessage };
