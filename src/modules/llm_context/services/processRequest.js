// src\modules\llm_context\services\processRequest.js
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import { FaissStore } from "langchain/vectorstores/faiss";

import logger from "../../../../logger.js";


// Define the processRequest function without any identifier parameter
const processRequest = async (fileNames, message) => {
  try {
    const texts = [];

    // Adjust the path to match your file structure
    for (const fileName of fileNames) {
      const filePath = `path/to/your/data/${fileName}.txt`;

      // Read data from the local file
      const fileContent = fs.readFileSync(filePath, "utf-8");
      texts.push(fileContent);
    }

    const combinedText = texts.join(" "); // Combine multiple files into one text

    const model = new OpenAI({});
    const VECTOR_STORE_PATH = `path/to/your/vector_store/index/index.data`; // Customize the vector store path

    let vectorStore;

    if (fs.existsSync(VECTOR_STORE_PATH)) {
      console.log("Vector Exists..");
      vectorStore = await FaissStore.load(
        VECTOR_STORE_PATH,
        new OpenAIEmbeddings()
      );
    } else {
      const text = combinedText;

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
      });
      const docs = await textSplitter.createDocuments([text]);
      vectorStore = await FaissStore.fromDocuments(
        docs,
        new OpenAIEmbeddings()
      );
      await vectorStore.save(VECTOR_STORE_PATH);
    }

    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
    const question = message; // Fixed question string or customize it as needed

    const res = await chain.call({
      query: question,
    });

    // Return the response
    return { res };
  } catch (error) {
    // Handle errors and log them
    logger.error("An error occurred:", error);
    return null; // Return null to indicate an error occurred
  }
};

export { processRequest };
