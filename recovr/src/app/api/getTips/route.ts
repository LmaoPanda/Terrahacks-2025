import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);
    
    const { injury, day, metrics, comments } = body;
    console.log('Extracted data:', { injury, day, metrics, comments });

    if (!process.env.GOOGLE_API_KEY) {
      console.error('GOOGLE_API_KEY not found in environment variables');
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    // Initialize Gemini with API key from environment
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const model = genAI.models.generateContent;

    // Create the prompt for tips and exercises
    const prompt = `You are a helpful assistant for injury recovery tracking.
Given the following information about a user's injury, generate:
1. Two specific tips for recovery (2-3 sentences each)
2. Three recommended exercises they should do

The tips should be personalized based on the following data:
INJURY: ${injury}
DAY: ${day}
PAIN (1-10): ${metrics?.pain}
REDNESS (1-10): ${metrics?.redness}
RANGE OF MOTION (1-10): ${metrics?.rangeOfMotion}
FLEXIBILITY (1-10): ${metrics?.flexibility}
ADDITIONAL COMMENTS: ${comments || "None"}

Return ONLY the raw JSON response in this exact format (no markdown, no code blocks):
{
  "tips": "First tip here. Second tip here.",
  "exercises": ["First exercise with brief description", "Second exercise with brief description", "Third exercise with brief description"]
}`;

    // Generate content
    const result = await model({
      contents: prompt,
      model: 'gemini-2.5-flash'
    });

    if (!result || !result.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('No response from Gemini API');
      throw new Error('No response from Gemini API');
    }

    let text = result.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', text);
    
    // Clean up the response by removing markdown code block formatting
    text = text.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    console.log('Cleaned response:', text);
    
    const response = JSON.parse(text);
    console.log('Parsed response:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating tips:', error);
    return NextResponse.json(
      { error: 'Failed to generate tips' },
      { status: 500 }
    );
  }
}
