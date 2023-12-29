import logger from "../../../../../../logger.js";
import dotenv from "dotenv";
import { generateTextToSpeech } from "./ttsService.js";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;


let controller = null; // Store the AbortController instance

export const generateResponse = async (input) => {
  if (!input) {
    alert("Please enter a word.");
    return;
  }

  // Create a new AbortController instance
  controller = new AbortController();
  const signal = controller.signal;

  const API_URL = "https://api.openai.com/v1/chat/completions";
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `${input}`,
          },
        ],
        max_tokens: 50,
        stream: true,
      }),
      signal,
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    setOutput("");

    setIsGenerating(true);
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim())
        .filter((line) => line !== "" && line !== "[DONE]") // Remove empty lines and "[DONE]"
        .map((line) => JSON.parse(line));
      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;
        // Generate text-to-speech for the new content
        if (content) {
          generateTextToSpeech(content);
        }
      }
    }
  } catch (error) {
    // Handle fetch request errors
    if (signal.aborted) {
      setOutput("Request aborted.");
      logger.error("Request aborted.");
    } else {
      console.error("Error:", error);
      logger.error(error.message);
    }
  } finally {
    controller = null; // Reset the AbortController instance

    setIsGenerating(false);
  }
};
