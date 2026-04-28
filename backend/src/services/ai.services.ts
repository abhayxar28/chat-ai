import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { SYSTEM_PROMPT } from "../prompts";

dotenv.config({ quiet: true });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
}); 

interface Message {
  role: string;
  parts: { text: string }[];
}


export async function generateResponse(formattedChatHistory: Message[]){
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: formattedChatHistory,
            config: {
                temperature: 0.7,
                systemInstruction: SYSTEM_PROMPT

            }
        })

        return response.text || "";
    } catch (error) {
        console.error("[AI] generateResponse failed:", error);
        return "I’m having trouble reaching the AI service right now. Please try again in a moment.";
    }
} 

export async function generateVector(content: string) {
  try {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: content,
      config: {
        outputDimensionality: 768,
      },
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding) {
      return [];
    }

    return embedding;
  } catch (error) {
    console.error("[AI] generateVector failed:", error);
    return [];
  }
}