
// Gemini API integration for generating a 2-sentence description
// Receives: { injury, day, description, metrics, comments, image }
// Returns: 2-sentence summary from Gemini

// You need to set your Gemini API key in the environment or replace below
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";


export async function getGeminiDescription({ injury, day, description, metrics, comments, image }) {
  const prompt = `You are a helpful assistant for injury recovery tracking.\n\nGiven the following information about a user's injury, generate a concise, empathetic, and informative 2-sentence description summarizing their current state.\n\nINJURY: ${injury}\nDAY: ${day}\nUSER DESCRIPTION: ${description}\nPAIN (1-10): ${metrics?.pain}\nREDNESS (1-10): ${metrics?.redness}\nRANGE OF MOTION (1-10): ${metrics?.rangeOfMotion}\nFLEXIBILITY (1-10): ${metrics?.flexibility}\nADDITIONAL COMMENTS: ${comments || "None"}\n${image ? "An image is also provided, but you may ignore it for now." : ""}\n\nYour response must be exactly 2 sentences.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Gemini API error: " + response.statusText);
  }
  const data = await response.json();
  // Gemini's response is in data.candidates[0].content.parts[0].text
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No description generated.";
}
