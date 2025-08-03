import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize Gemini with API key from environment
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

async function generateContent(injuryData) {
  try {
    // Get the generative model (using Flash for faster responses)
    const model = genAI.models;
    
    // Create the prompt with injury data
    const { injury, day, description, metrics, comments } = injuryData;
    const prompt = `You are a helpful assistant for injury recovery tracking.

Given the following information about a user's injury, generate a concise, empathetic, and informative 2-sentence description summarizing their current state. Never mention a numerical for any thing that they say (ex. pain is 7).

INJURY: ${injury}
DAY: ${day}
PAIN (1-10): ${metrics?.pain}
REDNESS (1-10): ${metrics?.redness}
RANGE OF MOTION (1-10): ${metrics?.rangeOfMotion}
FLEXIBILITY (1-10): ${metrics?.flexibility}
ADDITIONAL COMMENTS: ${comments || "None"}

Your response must be exactly 2 sentences.`;

    // Generate content
    const result = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });
    return result.text;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error; // Propagate error to component
  }
}

export async function getGeminiDescription(injuryData) {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(injuryData),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Gemini description');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error fetching Gemini description:', error);
    throw error;
  }
}