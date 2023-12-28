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

// Function to generate the vector store
const generateVectorStore = async () => {
  try {
    const CONTEXT_FOLDER_PATH = path.join(currentModuleDir, "..", "context");

    logger.info("Context File Path: " + CONTEXT_FOLDER_PATH);

    const fileNames = fs.readdirSync(CONTEXT_FOLDER_PATH);

    if (fileNames.length === 0) {
      throw new Error("Context folder is empty. No files to process.");
    }

    logger.info("Filenames: " + fileNames)
    const texts = fileNames.map((fileName) => {
      const filePath = path.join(CONTEXT_FOLDER_PATH, fileName);
      return fs.readFileSync(filePath, "utf-8");
    });

    const combinedText = texts.join(" ");

    const VECTOR_STORE_PATH = path.join(
      currentModuleDir,
      "..",
      "index",
      "context.data"
    ); // Adjust the path as needed

    logger.info("Vector store path: " + VECTOR_STORE_PATH);

    await fs.promises.mkdir(path.dirname(VECTOR_STORE_PATH), {
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
    await vectorStore.save(VECTOR_STORE_PATH);

    return vectorStore;
  } catch (error) {
    throw error;
  }
};

// Function to respond to a message using the generated vector store
const respondToMessage = async (message) => {
  try {
    const VECTOR_STORE_PATH = path.join(
      path.dirname(currentModuleDir.replace(/^\/([A-Z]:)/, "$1")),
      "..",
      "index",
      "context.data"
    );

    const model = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let vectorStore;

    if (fs.existsSync(VECTOR_STORE_PATH)) {
      logger.info("Vector exists..");
      vectorStore = await FaissStore.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings()
      );
    } else {
      // Handle the case when the vector store doesn't exist
      logger.error("Vector store not found.");
      return null;
    }

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    const res = await chain.call({
      query: message,
    });

    return { res };
  } catch (error) {
    throw error
  }
};

export { generateVectorStore, respondToMessage };
