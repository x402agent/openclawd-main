
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAgentBio = async (name: string, traits: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, cyberpunk-style bio for a Solana sovereign agent named "${name}" with traits: ${traits.join(', ')}. Max 150 characters.`,
    });
    return response.text || "Autonomous entity registered on the Solana mainnet.";
  } catch (error) {
    console.error("Bio generation failed", error);
    return "Protocol-driven intelligence layer for decentralized liquidity.";
  }
};

export const generateAgentArt = async (prompt: string, style: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A futuristic, high-tech, ${style} aesthetic NFT artwork for a Solana agent. Theme: ${prompt}. Cinematic lighting, 8k resolution, cyberpunk aesthetic.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation failed", error);
    return null;
  }
};
