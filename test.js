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
    return null;
  }
}

async function main() {
    const injuryData = {
        injury: 'Tweaked Liver',
        day: '3',
        description: 'Tweaked Liver',
        metrics: {
            pain: 7,
            redness: 5,
            rangeOfMotion: 4,
            flexibility: 3
        },
        comments: 'Mild pain, impact from boxing'
    };

    const response = await generateContent(injuryData);
    if (response) {
        console.log('\nGemini Response:\n', response, '\n');
    }
}

main();