import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function callGemini(prompt: string) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        if (!response.text) {
            throw new Error('Empty response from Gemini API');
        }

        return response.text;
    } catch (error: any) {
        console.error('Gemini API Error:', error);

        // Handle specific API errors
        if (error.message?.includes('API_KEY')) {
            throw new Error('Invalid Gemini API key. Please check your API key configuration.');
        }
        if (error.message?.includes('quota')) {
            throw new Error('Gemini API quota exceeded. Please try again later.');
        }
        if (error.message?.includes('safety')) {
            throw new Error('Content was blocked by safety filters. Please try a different description.');
        }
        if (error.message?.includes('not found')) {
            throw new Error('Model not available. Please check your API key has access to Gemini models.');
        }

        throw new Error(`Gemini API Error: ${error.message || 'Unknown error'}`);
    }
}