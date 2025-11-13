/**
 * Bytez API Service for ChatGPT Models
 * 
 * This service handles OpenAI (ChatGPT) models via Bytez platform:
 * - openai/gpt-4o
 * - openai/gpt-5
 * - openai/gpt-4
 */

import Bytez from "bytez.js";
import { getApiKey } from "@/config/apiConfig";
import { toast } from "sonner";

export interface BytezOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Process conversation using Bytez API (ChatGPT models)
 * 
 * @param conversationHistory - Array of conversation messages (user/assistant) or single text string (legacy)
 * @param prompt - System prompt
 * @param options - Model options (model, temperature, max_tokens)
 * @returns Generated response text
 */
export async function processWithBytez(
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> | string,
  prompt: string,
  options: BytezOptions = {}
): Promise<string> {
  try {
    // Get API key (checks predefined keys from .env first, then localStorage)
    // ChatGPT models are free, but still require a Bytez API key
    // You can set VITE_BYTEZ_API_KEY or VITE_OPENAI_API_KEY in .env file for free tier
    // getApiKey already checks both env vars and localStorage, so we don't need to check localStorage again
    const bytezApiKey = getApiKey('openai') || localStorage.getItem('bytezApiKey');
    
    if (!bytezApiKey) {
      throw new Error(
        "Bytez API key is required for ChatGPT models. " +
        "You can add it in two ways:\n" +
        "1. Set VITE_BYTEZ_API_KEY in your .env file (for free tier)\n" +
        "2. Add it in Settings > API Keys (localStorage)"
      );
    }

    // Get model from options or use default
    const modelId = options.model || 'openai/gpt-4o';
    
    // Initialize Bytez SDK
    const sdk = new Bytez(bytezApiKey);
    const model = sdk.model(modelId);

    // Handle backward compatibility: if conversationHistory is a string, convert it to array format
    let apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    if (typeof conversationHistory === 'string') {
      // Legacy format: single text string
      apiMessages = [
        {
          role: "system",
          content: prompt
        },
        {
          role: "user",
          content: conversationHistory
        }
      ];
    } else {
      // New format: conversation history array
      apiMessages = [
        {
          role: "system",
          content: prompt
        },
        ...conversationHistory // Include full conversation history
      ];
    }

    // Send request to Bytez
    const { error, output } = await model.run(apiMessages);

    if (error) {
      console.error("Bytez API error:", error);
      
      // Handle error - error can be a string or an object
      const errorMessage = typeof error === 'string' 
        ? error 
        : (error && typeof error === 'object' && 'message' in error 
          ? String((error as any).message) 
          : String(error) || "Unknown error");
      
      // Handle specific error cases
      if (errorMessage.includes("rate limit") || errorMessage.includes("429")) {
        toast.error("ChatGPT API rate limit exceeded. Please wait a few minutes and try again.");
        throw new Error("Rate limit exceeded");
      } else if (errorMessage.includes("401") || errorMessage.includes("403") || errorMessage.includes("invalid")) {
        toast.error("Invalid ChatGPT API key. Please check your API key settings.");
        throw new Error("Invalid API key");
      } else if (errorMessage.includes("model") || errorMessage.includes("not found")) {
        toast.error(`Model ${modelId} is not available. Please try a different model.`);
        throw new Error("Model not found");
      } else {
        toast.error(`ChatGPT API error: ${errorMessage}`);
        throw new Error(errorMessage);
      }
    }

    // Handle different output formats from Bytez
    if (!output) {
      throw new Error("No response from ChatGPT API");
    }

    // Extract text from output
    // Bytez output format may vary, handle different response structures
    let responseText = '';
    
    if (typeof output === 'string') {
      responseText = output;
    } else if (output && typeof output === 'object') {
      // Try different possible output structures
      if (output.content) {
        responseText = typeof output.content === 'string' ? output.content : JSON.stringify(output.content);
      } else if (output.text) {
        responseText = typeof output.text === 'string' ? output.text : JSON.stringify(output.text);
      } else if (output.message) {
        responseText = typeof output.message === 'string' ? output.message : JSON.stringify(output.message);
      } else if (output.choices && Array.isArray(output.choices) && output.choices[0]) {
        // OpenAI-style response format
        const choice = output.choices[0];
        if (choice.message && choice.message.content) {
          responseText = choice.message.content;
        } else if (choice.text) {
          responseText = choice.text;
        }
      } else {
        // Fallback: try to extract text from any response
        responseText = JSON.stringify(output);
      }
    } else {
      responseText = String(output);
    }

    if (!responseText || responseText.trim().length === 0) {
      throw new Error("Empty response from ChatGPT API");
    }

    return responseText.trim();
  } catch (error: any) {
    console.error("Bytez service error:", error);
    
    // Re-throw if it's already a formatted error
    if (error.message && (
      error.message.includes("API key") ||
      error.message.includes("rate limit") ||
      error.message.includes("Model not found") ||
      error.message.includes("Rate limit exceeded")
    )) {
      throw error;
    }

    // Format unknown errors
    const errorMessage = error.message || error.toString() || "Unknown error occurred";
    throw new Error(`ChatGPT API error: ${errorMessage}`);
  }
}

/**
 * Check if Bytez API key is available
 */
export function hasBytezApiKey(): boolean {
  const bytezApiKey = getApiKey('openai') || localStorage.getItem('openaiApiKey') || localStorage.getItem('bytezApiKey');
  return !!bytezApiKey;
}

/**
 * Get available Bytez models
 */
export function getBytezModels(): string[] {
  return [
    'openai/gpt-4o',
    'openai/gpt-5',
    'openai/gpt-4'
  ];
}

