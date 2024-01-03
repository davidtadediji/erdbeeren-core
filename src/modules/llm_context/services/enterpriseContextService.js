// src\modules\llm_context\services\enterpriseContextService.js
import * as fs from "fs";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "langchain/vectorstores/faiss";
import path from "path"; // Add this line
import logger from "../../../../logger.js";
import { getEnterpriseContextFilePath, getEnterpriseVectorStorePath } from "../util/contextFilePathsUtil.js";

const generateEnterpriseVectorStore = async () => {
  try {
    const CONTEXT_FOLDER_PATH = getEnterpriseContextFilePath();

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

    const ENTERPRISE_VECTOR_STORE_PATH = getEnterpriseVectorStorePath();

    logger.info("Enterprise vector store path: " + ENTERPRISE_VECTOR_STORE_PATH);

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

const loadEnterpriseVectorStore = async (storePath, embeddings) => {
  if (!fs.existsSync(storePath)) {
    await generateEnterpriseVectorStore();
  }

  return await FaissStore.load(storePath, embeddings);
};

export { generateEnterpriseVectorStore, loadEnterpriseVectorStore };

