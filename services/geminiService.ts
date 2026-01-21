import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMenuRecommendation = async (
  context: string, 
  weather?: string
): Promise<string[]> => {
  try {
    const prompt = `
      한국 직장인들을 위한 점심 메뉴 5개를 추천해줘.
      상황: ${context || '일반적인 점심'}.
      날씨: ${weather || '보통'}.
      반드시 한국어로 메뉴 이름만 포함된 JSON 배열 형태로 응답해줘. 예: ["김치찌개", "돈가스", "제육볶음"].
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      }
    });

    const text = response.text;
    if (!text) return [];

    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ["김치찌개", "샌드위치", "라멘"]; // Fallback
  }
};