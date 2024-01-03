// src\modules\llm_context\services\modelService.js
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import path from "path";
import logger from "../../../../logger.js";
import { getEnterpriseVectorStorePath } from "../util/contextFilePathsUtil.js";
import { loadCustomerVectorStore } from "./customerContextService.js";
import { loadEnterpriseVectorStore } from "./enterpriseContextService.js";

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

    const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const generalVectorStore = await loadEnterpriseVectorStore(
      getEnterpriseVectorStorePath(),
      new OpenAIEmbeddings()
    );

    const customerVectorStore = await loadCustomerVectorStore(customersSid);

    logger.info("Gotten customer vector store");

    // If customer-specific vector store exists, merge it with the general vector store
    if (customerVectorStore) {
      generalVectorStore.merge_from(customerVectorStore);
    }

    // Add context information, like "You are an agent" and title like "Previous Messages:"
    const contextMessage = [
      isAgent ? "You are a customer service agent." : "",
      "Current Message:",
      message,
    ].join(" ");

    const chain = RetrievalQAChain.fromLLM(
      model,
      generalVectorStore.asRetriever()
    );

    const res = await chain.call({
      query: contextMessage,
    });

    return { res };
  } catch (error) {
    throw error;
  }
};

export { respondToMessage };
