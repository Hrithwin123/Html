/**
 * Smart AI Service with automatic fallback
 * Tries Gemini first, falls back to Ollama when quota exhausted
 */

import { callOllama, isOllamaAvailable } from './ollama';

// Gemini function with configurable model
async function callGeminiDirect(prompt: string): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({});
  
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  // Use model from environment variable, fallback to gemini-1.5-flash
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  
  console.log(`Using Gemini model: ${model}`);
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  
  if (!response.text) {
    throw new Error(`Empty response from Gemini model: ${model}`);
  }
  
  return response.text;
}

/**
 * Smart AI caller that tries Gemini first, falls back to Ollama
 * @param prompt - The prompt to send
 * @param forceOllama - Force using Ollama instead of trying Gemini first
 * @returns Promise with the generated text and the service used
 */
export async function callAI(
  prompt: string, 
  forceOllama: boolean = false
): Promise<{ text: string; service: 'gemini' | 'ollama' }> {
  
  // If forced to use Ollama or no Gemini key, go straight to Ollama
  if (forceOllama || !process.env.GEMINI_API_KEY) {
    console.log('Using Ollama directly');
    const text = await callOllama(prompt);
    return { text, service: 'ollama' };
  }

  // First, try Gemini
  try {
    console.log('Attempting Gemini API call...');
    const text = await callGeminiDirect(prompt);
    console.log('Gemini API call successful');
    return { text, service: 'gemini' };
    
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    
    // Check if it's a quota/rate limit error
    const isQuotaError = error.message?.includes('quota') || 
                       error.message?.includes('rate limit') || 
                       error.message?.includes('429') ||
                       error.message?.includes('RESOURCE_EXHAUSTED') ||
                       error.message?.includes('exceeded') ||
                       error.message?.includes('overloaded') ||
                       error.status === 503;
                       
    const isAPIKeyError = error.message?.includes('API_KEY') || 
                         error.message?.includes('401') ||
                         error.message?.includes('403') ||
                         error.message?.includes('invalid') ||
                         error.message?.includes('unauthorized');

    // For quota/API key errors, try Ollama fallback
    if (isQuotaError || isAPIKeyError) {
      console.log('Gemini quota exhausted or API key issue, falling back to Ollama...');
      
      // Check if Ollama is available
      const ollamaAvailable = await isOllamaAvailable();
      if (!ollamaAvailable) {
        throw new Error('Gemini quota exhausted and Ollama is not available. Please start Ollama with: ollama serve');
      }
      
      try {
        const text = await callOllama(prompt);
        console.log('Successfully switched to Ollama');
        return { text, service: 'ollama' };
      } catch (ollamaError: any) {
        console.error('Ollama fallback also failed:', ollamaError);
        throw new Error(`Both Gemini and Ollama failed. Gemini: ${error.message}, Ollama: ${ollamaError.message}`);
      }
    }
    
    // For safety filter errors, don't fallback to Ollama
    if (error.message?.includes('safety')) {
      throw new Error('Content was blocked by safety filters. Please try a different description.');
    }
    
    // For model not found errors
    if (error.message?.includes('not found')) {
      throw new Error('Model not available. Please check your API key has access to Gemini models.');
    }
    
    // For unknown errors, try Ollama as last resort
    console.log('Unknown Gemini error, trying Ollama as fallback...');
    
    const ollamaAvailable = await isOllamaAvailable();
    if (!ollamaAvailable) {
      throw new Error(`Gemini API Error: ${error.message || 'Unknown error'}`);
    }
    
    try {
      const text = await callOllama(prompt);
      console.log('Ollama fallback successful');
      return { text, service: 'ollama' };
    } catch (ollamaError: any) {
      console.error('Ollama fallback failed:', ollamaError);
      throw new Error(`Gemini API Error: ${error.message || 'Unknown error'}`);
    }
  }
}

/**
 * Batch AI calls with smart load balancing
 * Distributes requests between Gemini and Ollama to avoid quota issues
 * @param prompts - Array of prompts to process
 * @param maxConcurrent - Maximum concurrent requests (default: 3)
 * @returns Promise with array of results
 */
export async function batchCallAI(
  prompts: string[], 
  maxConcurrent: number = 3
): Promise<Array<{ text: string; service: 'gemini' | 'ollama'; index: number }>> {
  
  const results: Array<{ text: string; service: 'gemini' | 'ollama'; index: number }> = [];
  let geminiFailures = 0;
  const maxGeminiFailures = 2; // Switch to Ollama after 2 failures
  
  // Process in batches to avoid overwhelming the APIs
  for (let i = 0; i < prompts.length; i += maxConcurrent) {
    const batch = prompts.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(async (prompt, batchIndex) => {
      const actualIndex = i + batchIndex;
      
      try {
        // If we've had too many Gemini failures, use Ollama directly
        const forceOllama = geminiFailures >= maxGeminiFailures;
        const result = await callAI(prompt, forceOllama);
        
        return {
          ...result,
          index: actualIndex
        };
      } catch (error: any) {
        // Track Gemini failures
        if (error.message?.includes('Gemini')) {
          geminiFailures++;
        }
        
        console.error(`Error processing prompt ${actualIndex}:`, error);
        throw error;
      }
    });
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches to be respectful to APIs
      if (i + maxConcurrent < prompts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Batch processing failed:', error);
      throw error;
    }
  }
  
  return results.sort((a, b) => a.index - b.index);
}