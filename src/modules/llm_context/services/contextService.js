// src\modules\llm_context\services\contextService.js
import dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "langchain/vectorstores/faiss";
import logger from "../../../../logger.js";
import * as fs from "fs";
import path from "path";

const currentModuleURL = new URL(import.meta.url);
let currentModuleDir = path.dirname(currentModuleURL.pathname);

logger.info("Context service dir: " + currentModuleDir);

currentModuleDir = currentModuleDir.replace(/^\/([A-Z]:)/, "$1");

const ENTERPRISE_VECTOR_STORE_PATH = path.join(
  currentModuleDir,
  "..",
  "enterprise_index",
  "context.index"
); // Adjust the path as needed

// Function to generate the vector store
const generateEnterpriseVectorStore = async () => {
  try {
    const CONTEXT_FOLDER_PATH = path.join(currentModuleDir, "..", "repository");

    logger.info("Context File Path: " + CONTEXT_FOLDER_PATH);

    const fileNames = fs.readdirSync(CONTEXT_FOLDER_PATH);

    if (fileNames.length === 0) {
      throw new Error("Context folder is empty. No files to process.");
    }

    logger.info("Filenames: " + fileNames);
    const texts = fileNames.map((fileName) => {
      const filePath = path.join(CONTEXT_FOLDER_PATH, fileName);
      return fs.readFileSync(filePath, "utf-8");
    });

    const combinedText = texts.join(" ");

    logger.info("Enterprise ector store path: " + ENTERPRISE_VECTOR_STORE_PATH);

    await fs.promises.mkdir(path.dirname(ENTERPRISE_VECTOR_STORE_PATH), {
      recursive: true,
    });

    const text = combinedText;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
    });

    const docs = await textSplitter.createDocuments([text]);
    const vectorStore = await FaissStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );
    await vectorStore.save(ENTERPRISE_VECTOR_STORE_PATH);

    return vectorStore;
  } catch (error) {
    throw error;
  }
};

// Function to generate the vector store for a specific customer and merge with existing if exists
const generateCustomerVectorStore = async (customersSid, turn) => {
  try {
    const CUSTOMER_VECTOR_STORE_PATH = path.join(
      currentModuleDir,
      "..",
      "customer_index",
      `${customersSid}.index`
    );

    logger.info("Customer Vector Store Path: " + CUSTOMER_VECTOR_STORE_PATH);

    await fs.promises.mkdir(path.dirname(CUSTOMER_VECTOR_STORE_PATH), {
      recursive: true,
    });

    let vectorStore;

    if (fs.existsSync(CUSTOMER_VECTOR_STORE_PATH)) {
      logger.info("Customer Vector Store exists. Loading and merging...");

      vectorStore = await FaissStore.load(
        CUSTOMER_VECTOR_STORE_PATH,
        new OpenAIEmbeddings()
      );

      const text = turn.join(" ");

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });

      const docs = await textSplitter.createDocuments([text]);
      const newVectorStore = await FaissStore.fromDocuments(
        docs,
        new OpenAIEmbeddings()
      );

      // Merge the new vector store with the existing one
      vectorStore.merge_from(newVectorStore);
    } else {
      logger.info("Customer vector store does not exist. Creating new...");

      const text = turn.join(" ");

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });

      const docs = await textSplitter.createDocuments([text]);
      vectorStore = await FaissStore.fromDocuments(
        docs,
        new OpenAIEmbeddings()
      );
    }

    // Save the final vector store
    await vectorStore.save(CUSTOMER_VECTOR_STORE_PATH);

    return vectorStore;
  } catch (error) {
    throw error;
  }
};

const loadEnterpriseVectorStore = async (storePath, embeddings) => {
  if (!fs.existsSync(storePath)) {
    await generateEnterpriseVectorStore();
  }

  return await FaissStore.load(storePath, embeddings);
};

const loadCustomerVectorStore = async (customersSid) => {
  const customerVectorStorePath = path.join(
    currentModuleDir,
    "..",
    "customer_index",
    `${customersSid}.index`
  );

  if (fs.existsSync(customerVectorStorePath)) {
    return await FaissStore.load(
      customerVectorStorePath,
      new OpenAIEmbeddings()
    );
  } else {
    return null;
  }
};

const respondToMessage = async (
  customersSid,
  message,
  isAgent = false
) => {
  try {
    logger.info("OPENAI_API_KEY: " + process.env.OPENAI_API_KEY);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not defined in the environment");
    }
    
    const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const generalVectorStore = await loadEnterpriseVectorStore(
      ENTERPRISE_VECTOR_STORE_PATH,
      new OpenAIEmbeddings()
    );

    const customerVectorStore = await loadCustomerVectorStore(
      customersSid
    );

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

export { generateEnterpriseVectorStore, generateCustomerVectorStore, respondToMessage };
