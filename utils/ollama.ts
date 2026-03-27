/**
 * Ollama API utility for local Llama2 integration
 * Provides fallback when Gemini quota is exhausted
 */

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    repeat_penalty?: number;
    seed?: number;
    num_predict?: number;
  };
}

/**
 * Call Ollama API (local Llama2)
 * @param prompt - The prompt to send to Llama2
 * @param options - Optional configuration for the model
 * @returns Promise with the generated text
 */
export async function callOllama(
  prompt: string, 
  options?: OllamaRequest['options']
): Promise<string> {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const ollamaModel = process.env.OLLAMA_MODEL || 'llama2';
    
    console.log(`Calling Ollama at ${ollamaUrl} with model ${ollamaModel}`);
    
    const requestBody: OllamaRequest = {
      model: ollamaModel,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.8,
        top_k: 40,
        repeat_penalty: 1.1,
        num_predict: 2048,
        ...options
      }
    };

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    
    if (!data.response) {
      throw new Error('Empty response from Ollama API');
    }

    console.log('Ollama API call successful');
    return data.response.trim();
    
  } catch (error: any) {
    console.error('Ollama API Error:', error);
    
    // Provide helpful error messages
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama server is not running. Please start it with: ollama serve');
    }
    
    if (error.message?.includes('model')) {
      throw new Error(`Model not found. Please pull the model with: ollama pull ${process.env.OLLAMA_MODEL || 'llama2'}`);
    }
    
    throw new Error(`Ollama API Error: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Check if Ollama server is available
 * @returns Promise<boolean> - true if Ollama is running and accessible
 */
export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.log('Ollama not available:', error);
    return false;
  }
}

/**
 * Get available models from Ollama
 * @returns Promise<string[]> - Array of available model names
 */
export async function getOllamaModels(): Promise<string[]> {
  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await fetch(`${ollamaUrl}/api/tags`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}