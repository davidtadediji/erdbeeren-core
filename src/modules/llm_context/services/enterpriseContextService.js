// src\modules\llm_context\services\enterpriseContextService.js
import * as fs from "fs";
import path from "path"; // for access to file through file path
import { OpenAIEmbeddings } from "@langchain/openai"; // main package for creating embeddings to be stored
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"; // import text splitter
import { FaissStore } from "@langchain/community/vectorstores/faiss"; // import the package for vector storage
import logger from "../../../../logger.js";
// import utilities
import {
  getEnterpriseContextFilePath,
  getEnterpriseVectorStorePath,
} from "../util/contextFilePathsUtil.js";
// import the necessary document loaders
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
    // get the file path of the enterprise's knowledge repository
    const CONTEXT_FOLDER_PATH = getEnterpriseContextFilePath();

    // get a list of the files present to make sure folder is not empty
    const fileNames = fs.readdirSync(CONTEXT_FOLDER_PATH);
    if (fileNames.length === 0) {
      throw new Error("Context folder is empty. No files to process.");
    }
    /* create a sophisticated document loader 
    where for each document in the folder the appropriate document loader will be used. */
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
    // load the documents
    const texts = await loader.load();
    // combine all the texts within the documents
    const combinedText = texts.map((doc) => doc.pageContent).join(" ");
    // get the path were the vector store will be stored through a util function.
    const ENTERPRISE_VECTOR_STORE_PATH = getEnterpriseVectorStorePath();
    // this will create the directory if it does not exist
    await fs.promises.mkdir(path.dirname(ENTERPRISE_VECTOR_STORE_PATH), {
      recursive: true,
    });
    // Initialize a text splitter
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 0,
    });
    // apply on the combined text to create document chunks
    const docs = await textSplitter.createDocuments([combinedText]);
    // After converting the chunks into vector emdeddings, create a vector storage.
    const vectorStore = await FaissStore.fromDocuments(
      docs,
      new OpenAIEmbeddings()
    );
    // save the vector store in the intended file path
    await vectorStore.save(ENTERPRISE_VECTOR_STORE_PATH);

    return vectorStore;
  } catch (error) {
    throw error;
  }
};

// generateEnterpriseVectorStore()

const loadEnterpriseVectorStore = async (storePath, embeddings) => {
  logger.info("Load enterprise vector store triggered");
  if (!fs.existsSync(storePath)) {
    return await generateEnterpriseVectorStore();
  }

  const vectorStore = await FaissStore.load(storePath, embeddings);

  return vectorStore;
};

export { generateEnterpriseVectorStore, loadEnterpriseVectorStore };
