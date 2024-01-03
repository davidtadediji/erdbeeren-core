// src\modules\llm_context\services\customerContextService.js
import * as fs from "fs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "langchain/vectorstores/faiss";
import path from 'path';
import logger from "../../../../logger.js";
import {
    getCustomerVectorStorePath
} from "../util/contextFilePathsUtil.js";


const generateCustomerVectorStore = async (customersSid, turn=["Query", "Response"]) => {
  try {
    const CUSTOMER_VECTOR_STORE_PATH = getCustomerVectorStorePath(customersSid);

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

const loadCustomerVectorStore = async (customersSid) => {
  const customerVectorStorePath = getCustomerVectorStorePath(customersSid);

  logger.info("Customer vector store path: " + customerVectorStorePath)

  if (fs.existsSync(customerVectorStorePath)) {
    return await FaissStore.load(
      customerVectorStorePath,
      new OpenAIEmbeddings()
    );
  } else {
    return null;
  }
};

export { generateCustomerVectorStore, loadCustomerVectorStore };

