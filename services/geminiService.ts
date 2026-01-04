
import { GoogleGenAI, Type } from "@google/genai";
import { Skin, AppraisalResponse } from "../types";

export const appraiseLuck = async (skins: Skin[]): Promise<AppraisalResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const skinNames = skins.map(s => `${s.name} (${s.rarity})`).join(', ');

  const prompt = `你现在是《和平精英》战术教官。一名特种兵刚刚开启了物资轮盘并获得了以下装备：${skinNames}。
  请以专业且略带严厉的口吻点评他们的运气，给出一个运气评分(0-100)，并针对他们抽到的最稀有装备提供一条实战战术建议。
  请以JSON格式返回。`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            commentary: { type: Type.STRING },
            luckScore: { type: Type.NUMBER },
            tacticalAdvice: { type: Type.STRING },
          },
          required: ["commentary", "luckScore", "tacticalAdvice"],
        },
      },
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr) as AppraisalResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      commentary: "运气不错，特种兵。这套装备能让你在G镇横着走。",
      luckScore: 75,
      tacticalAdvice: "穿上这套皮肤，记得在烟雾弹里低调行事，不要成了活靶子。"
    };
  }
};
