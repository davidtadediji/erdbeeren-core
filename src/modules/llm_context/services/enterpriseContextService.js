// src\modules\llm_context\services\enterpriseContextService.js
import * as fs from "fs";
// import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// import { FaissStore } from "langchain/vectorstores/faiss";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import path from "path";
import logger from "../../../../logger.js";
import {
  getEnterpriseContextFilePath,
  getEnterpriseVectorStorePath,
} from "../util/contextFilePathsUtil.js";
// import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import {
  JSONLoader,
  JSONLinesLoader,
} from "langchain/document_loaders/fs/json";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const generateEnterpriseVectorStore = async () => {
  logger.info("Generate Enterprise Vector Store Triggered!");
  try {
    const CONTEXT_FOLDER_PATH = getEnterpriseContextFilePath();

    logger.info("Context File Path: " + CONTEXT_FOLDER_PATH);

    const fileNames = fs.readdirSync(CONTEXT_FOLDER_PATH);

    if (fileNames.length === 0) {
      throw new Error("Context folder is empty. No files to process.");
    }

    logger.info("Filenames: " + fileNames);

    let loader;
    try {
      loader = new DirectoryLoader(CONTEXT_FOLDER_PATH, {
        ".json": (path) => new JSONLoader(path, "/texts"),
        ".jsonl": (path) => new JSONLinesLoader(path, "/html"),
        ".txt": (path) => new TextLoader(path),
        ".csv": (path) => new CSVLoader(path, "text"),
        ".docx": (path) => new DocxLoader(path, "text"),
        ".pdf": (path) => new PDFLoader(path, { splitPages: false }, "text"),
      });
    } catch (error) {
      throw new Error(`Error initializing DirectoryLoader: ${error.message}`);
    }
    
    const texts = await loader.load();
    console.log({ texts });

    const combinedText = texts.map(doc => doc.pageContent).join(' ');
   
    console.log({ combinedText });
    const ENTERPRISE_VECTOR_STORE_PATH = getEnterpriseVectorStorePath();

    logger.info(
      "Enterprise vector store path: " + ENTERPRISE_VECTOR_STORE_PATH
    );

    await fs.promises.mkdir(path.dirname(ENTERPRISE_VECTOR_STORE_PATH), {
      recursive: true,
    });

    // const text = combinedText;

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 0,
    });

    const docs = await textSplitter.createDocuments([combinedText]);
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

// generateEnterpriseVectorStore()

const loadEnterpriseVectorStore = async (storePath, embeddings) => {
  logger.info("Load enterprise vector store triggered")
  if (!fs.existsSync(storePath)) {
    return await generateEnterpriseVectorStore();
  }

  const vectorStore = await FaissStore.load(storePath, embeddings);
  
  return vectorStore;
};

export { generateEnterpriseVectorStore, loadEnterpriseVectorStore };
