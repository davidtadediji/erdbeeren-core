import logger from "../../../../../../logger.js";
import dotenv from "dotenv";

dotenv.config();



// Text-to-speech API endpoint
const TEXT_TO_SPEECH_API_ENDPOINT =
  "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}";

// Function to generate text-to-speech
export const generateTextToSpeech = async (text) => {
  const voiceSettings = {
    similarity_boost: 123,
    stability: 123,
    style: 123,
    use_speaker_boost: true,
  };

  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model_id: "<string>", // Replace with the appropriate model ID
      text: text,
      voice_settings: voiceSettings,
    }),
  };

  try {
    const response = await fetch(TEXT_TO_SPEECH_API_ENDPOINT, options);
    const audioData = await response.json();
    // Handle audio data, e.g., play it using the Web Speech API
    playAudio(audioData.audio);
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    logger.error(error.message);
  }
};

// Function to play audio using the Web Speech API
const playAudio = (audio) => {
  const utterance = new SpeechSynthesisUtterance();
  utterance.text = audio; // Assuming audio is a valid text representation of speech
  window.speechSynthesis.speak(utterance);
};