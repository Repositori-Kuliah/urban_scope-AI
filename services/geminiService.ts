import { GoogleGenAI, Type } from "@google/genai";
import { ReviewResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeCode = async (code: string, language: string): Promise<ReviewResponse> => {
  const model = "gemini-3-pro-preview"; // Use gemini-3-pro-preview for coding tasks

  const prompt = `
    You are a world-class Senior Software Engineer. Review the following ${language} code.
    
    Your task is to:
    1. Provide a concise summary of what the code does.
    2. Identify specific issues (bugs, logic errors, poor practices).
    3. Identify any security concerns (if applicable).
    4. Provide a refactored version of the code that follows best practices, is cleaner, and fixes the issues.

    Code to review:
    \`\`\`${language}
    ${code}
    \`\`\`
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A brief summary of the code functionality." },
          issues: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of bugs, logic errors, or style issues found."
          },
          securityConcerns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of potential security vulnerabilities."
          },
          refactoredCode: { type: Type.STRING, description: "The complete refactored code block." }
        },
        required: ["summary", "issues", "refactoredCode", "securityConcerns"]
      }
    }
  });

  if (!response.text) {
    throw new Error("No response received from Gemini.");
  }

  try {
    return JSON.parse(response.text) as ReviewResponse;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    throw new Error("Failed to parse analysis results.");
  }
};