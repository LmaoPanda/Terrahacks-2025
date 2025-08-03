import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { injury, day, description, metrics, comments } = await request.json();

    // Initialize Gemini with API key from environment
    const genAI = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY
    });

    console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);

    // Create the prompt
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
    const model = genAI.models;
    const result = await model.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    return NextResponse.json({ summary: result.text });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}
