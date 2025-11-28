import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { Scene, ImageResolution, ScriptAnalysisResponse, ArtStyle } from "../types";

// Helper to get a fresh instance (required for API key updates)
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeScript = async (scriptText: string): Promise<Scene[]> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            description: { type: Type.STRING },
            visualPrompt: { type: Type.STRING, description: "A detailed, descriptive prompt suitable for an image generation AI, describing the visual elements, lighting, composition, and mood of the scene." },
          },
          required: ["sceneNumber", "description", "visualPrompt"],
        },
      },
    },
    required: ["scenes"],
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following script and break it down into a sequence of key visual scenes for a storyboard. 
    For each scene, provide a scene number, a brief narrative description, and a highly detailed visual prompt optimized for image generation.
    
    SCRIPT:
    ${scriptText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are an expert film director and cinematographer. Your task is to visualize a script into distinct storyboard panels."
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  try {
    const data = JSON.parse(text) as ScriptAnalysisResponse;
    return data.scenes.map(s => ({ ...s, isGenerating: false }));
  } catch (e) {
    console.error("Failed to parse script analysis", e);
    throw new Error("Failed to parse AI response");
  }
};

export const generateSceneImage = async (prompt: string, resolution: ImageResolution, style: ArtStyle = 'Cinematic'): Promise<string> => {
  const ai = getAI();
  
  const enhancedPrompt = `Render this scene in a ${style} art style. ${prompt}`;

  // gemini-3-pro-image-preview supports 1K, 2K, 4K via imageSize config
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: enhancedPrompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: resolution,
      }
    }
  });

  // Extract image
  // The response might contain text or inlineData. We look for inlineData.
  for (const candidate of response.candidates || []) {
    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  
  throw new Error("No image generated");
};

// Chat Service
let chatSession: Chat | null = null;

export const initChat = () => {
  const ai = getAI();
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are a helpful creative assistant for a storyboard app. You help users refine their scripts, suggest visual ideas, and answer questions about filmmaking.",
    },
  });
};

export const sendMessageStream = async function* (message: string) {
  if (!chatSession) initChat();
  if (!chatSession) throw new Error("Chat session not initialized");

  const result = await chatSession.sendMessageStream({ message });
  for await (const chunk of result) {
    yield chunk.text;
  }
};