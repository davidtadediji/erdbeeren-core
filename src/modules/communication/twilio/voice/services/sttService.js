// speechToText.js
import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

const request = {
  config: {
    encoding: "MULAW",
    sampleRateHertz: 8000,
    languageCode: "en-GB",
  },
  interimResults: true,
};

export const createRecognizeStream = (gptResponseGenerator) => {
  return client
    .streamingRecognize(request)
    .on("error", console.error)
    .on("data", (data) => {
      const transcript = data.results[0].alternatives[0].transcript;
      console.log(transcript);

      // Call generateResponse function with interim transcription
      if (gptResponseGenerator) {
        gptResponseGenerator(transcript);
      }
    });
};
