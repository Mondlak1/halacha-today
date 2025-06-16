import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const GROQ_API_KEY_STORAGE = 'groq_api_key';
const GROQ_API_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: ChatMessage;
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Save the Groq API key securely
 */
export const saveGroqApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(GROQ_API_KEY_STORAGE, apiKey);
    return true;
  } catch (error) {
    console.error('Failed to save Groq API key:', error);
    return false;
  }
};

/**
 * Get the stored Groq API key
 */
export const getGroqApiKey = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(GROQ_API_KEY_STORAGE);
  } catch (error) {
    console.error('Failed to get Groq API key:', error);
    return null;
  }
};

/**
 * Send a request to the Groq API
 */
export const fetchGroqCompletion = async (
  messages: ChatMessage[],
  model: string = 'llama-3.3-70b-versatile',
  temperature: number = 0.7,
  maxTokens?: number
): Promise<string | null> => {
  try {
    const apiKey = await getGroqApiKey();
    
    if (!apiKey) {
      throw new Error('Groq API key not found');
    }
    
    const requestBody: CompletionRequest = {
      model,
      messages,
      temperature,
    };
    
    if (maxTokens) {
      requestBody.max_tokens = maxTokens;
    }
    
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json() as CompletionResponse;
    return data.choices[0]?.message.content || null;
  } catch (error) {
    console.error('Groq API request failed:', error);
    return null;
  }
};

/**
 * Test the Groq API connection with the provided key
 */
export const testGroqApiConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Hello, world!' }],
        max_tokens: 1 // Minimize tokens for the test
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Groq API connection test failed:', error);
    return false;
  }
};

/**
 * Get explanations for halachic activities using Groq
 */
export const getHalachicExplanation = async (
  activityName: string,
  tradition: string = 'general'
): Promise<string | null> => {
  const prompt = `Provide a clear explanation of the Jewish practice "${activityName}" 
  from a ${tradition} perspective. Include the basis in Jewish law, practical guidelines, 
  and any relevant customs. Keep the response concise and focused on practical information.`;
  
  return fetchGroqCompletion([
    { role: 'system', content: 'You are a knowledgeable assistant on Jewish law and traditions.' },
    { role: 'user', content: prompt }
  ]);
}; 