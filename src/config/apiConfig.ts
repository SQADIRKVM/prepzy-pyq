/**
 * API Configuration for Prepzy PYQ
 * 
 * This file contains predefined models and API configurations for:
 * - Gemini (Google)
 * - ChatGPT (OpenAI via Bytez Platform)
 * - DeepSeek
 * - OpenRouter (Free models only)
 * 
 * Users can use free tier models or bring their own API keys (BYOK)
 */

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'deepseek' | 'openrouter';
  requiresApiKey: boolean;
  isFree: boolean;
  maxTokens?: number;
  description?: string;
}

export interface ProviderConfig {
  name: string;
  apiKeyName: string; // localStorage key name
  baseUrl?: string;
  defaultModel?: string;
  models: ModelConfig[];
}

/**
 * Predefined API Keys (for free tier)
 * These can be set via environment variables or left empty for BYOK
 */
// Helper function to safely get env vars
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  // Handle undefined, null, or empty string
  if (!value || value === 'undefined' || value === 'null') {
    return '';
  }
  return String(value).trim();
};

export const PREDEFINED_API_KEYS = {
  // Set these in .env file or leave empty for BYOK
  // Environment variables are loaded at build time in Vite
  GEMINI_API_KEY: getEnvVar('VITE_GEMINI_API_KEY'),
  OPENAI_API_KEY: getEnvVar('VITE_OPENAI_API_KEY'), // Bytez API key for ChatGPT
  BYTEZ_API_KEY: getEnvVar('VITE_BYTEZ_API_KEY'), // Bytez platform API key
  DEEPSEEK_API_KEY: getEnvVar('VITE_DEEPSEEK_API_KEY'),
  OPENROUTER_API_KEY: getEnvVar('VITE_OPENROUTER_API_KEY'),
} as const;

// Debug: Log which env vars are available (without exposing values)
if (typeof window !== 'undefined') {
  console.log('Environment Variables Status:', {
    hasGemini: !!PREDEFINED_API_KEYS.GEMINI_API_KEY,
    hasOpenAI: !!PREDEFINED_API_KEYS.OPENAI_API_KEY,
    hasBytez: !!PREDEFINED_API_KEYS.BYTEZ_API_KEY,
    hasDeepSeek: !!PREDEFINED_API_KEYS.DEEPSEEK_API_KEY,
    hasOpenRouter: !!PREDEFINED_API_KEYS.OPENROUTER_API_KEY,
    // Show first few chars to verify it's being read (for debugging)
    geminiPreview: PREDEFINED_API_KEYS.GEMINI_API_KEY ? `${PREDEFINED_API_KEYS.GEMINI_API_KEY.substring(0, 10)}...` : 'not set',
  });
}

/**
 * Gemini Models Configuration
 */
export const GEMINI_MODELS: ModelConfig[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'Balanced model optimized for price-performance, ideal for large-scale processing'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Most advanced reasoning model, suitable for complex problem-solving in code, math, and STEM'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Fastest and most cost-efficient multimodal model, ideal for high-frequency tasks'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Well-rounded Flash model with earlier capabilities'
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'gemini',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Faster and more cost-efficient earlier Flash model'
  },
];

/**
 * OpenAI (ChatGPT) Models Configuration via Bytez Platform
 */
export const OPENAI_MODELS: ModelConfig[] = [
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'Latest GPT-4 Optimized model - Free'
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'openai',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'GPT-5 model - Free'
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'GPT-4 model - Free'
  },
];

/**
 * DeepSeek Models Configuration
 */
export const DEEPSEEK_MODELS: ModelConfig[] = [
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 8192,
    description: 'Standard DeepSeek Chat model'
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 8192,
    description: 'Optimized for coding tasks'
  },
];

/**
 * OpenRouter Models Configuration
 * Mix of free and paid models
 */
export const OPENROUTER_MODELS: ModelConfig[] = [
  // Free Models
  {
    id: 'deepseek/deepseek-chat-v3-0324:free',
    name: 'DeepSeek V3',
    provider: 'openrouter',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'Free DeepSeek V3 model - Recommended'
  },
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek R1',
    provider: 'openrouter',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'Free DeepSeek R1 model'
  },
  {
    id: 'moonshotai/kimi-k2:free',
    name: 'Kimi K2',
    provider: 'openrouter',
    requiresApiKey: false,
    isFree: true,
    maxTokens: 16000,
    description: 'Free Moonshot AI Kimi K2'
  },
  // Paid Models
  {
    id: 'z-ai/glm-4.5-air:free',
    name: 'GLM 4.5 Air',
    provider: 'openrouter',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'GLM 4.5 Air model - Paid'
  },
  {
    id: 'qwen/qwen3-30b-a3b:free',
    name: 'Qwen 3 30B',
    provider: 'openrouter',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Qwen 3 30B model - Paid'
  },
  {
    id: 'google/gemini-2.0-flash:free',
    name: 'Gemini 2.0 Flash',
    provider: 'openrouter',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Gemini 2.0 Flash via OpenRouter - Paid'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B',
    provider: 'openrouter',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Llama 3.2 3B Instruct - Paid'
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini',
    provider: 'openrouter',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Microsoft Phi-3 Mini - Paid'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B',
    provider: 'openrouter',
    requiresApiKey: true,
    isFree: false,
    maxTokens: 16000,
    description: 'Mistral 7B Instruct - Paid'
  },
];

/**
 * Provider Configurations
 */
export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  gemini: {
    name: 'Google Gemini',
    apiKeyName: 'geminiApiKey',
    baseUrl: 'https://generativelanguage.googleapis.com',
    defaultModel: 'gemini-2.5-flash',
    models: GEMINI_MODELS,
  },
  openai: {
    name: 'OpenAI (ChatGPT) via Bytez',
    apiKeyName: 'openaiApiKey',
    baseUrl: 'https://api.bytez.com', // Bytez platform
    defaultModel: 'openai/gpt-4o',
    models: OPENAI_MODELS,
  },
  deepseek: {
    name: 'DeepSeek',
    apiKeyName: 'deepseekApiKey',
    baseUrl: 'https://api.deepseek.com',
    defaultModel: 'deepseek-chat',
    models: DEEPSEEK_MODELS,
  },
  openrouter: {
    name: 'OpenRouter',
    apiKeyName: 'openRouterApiKey',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'deepseek/deepseek-chat-v3-0324:free',
    models: OPENROUTER_MODELS,
  },
};

/**
 * Get all models for a specific provider
 */
export function getModelsByProvider(provider: string): ModelConfig[] {
  return PROVIDER_CONFIGS[provider]?.models || [];
}

/**
 * Get a specific model configuration
 */
export function getModelConfig(modelId: string): ModelConfig | null {
  for (const provider of Object.values(PROVIDER_CONFIGS)) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return model;
  }
  return null;
}

/**
 * Get API key for a provider (checks predefined keys first, then localStorage)
 */
export function getApiKey(provider: string): string | null {
  const config = PROVIDER_CONFIGS[provider];
  if (!config) {
    console.warn(`No config found for provider: ${provider}`);
    return null;
  }

  // Check predefined API key first (from env)
  let predefinedKey: string | null = null;
  switch (provider) {
    case 'gemini':
      predefinedKey = PREDEFINED_API_KEYS.GEMINI_API_KEY || null;
      break;
    case 'openai':
      // Check Bytez key first, then OpenAI key
      predefinedKey = PREDEFINED_API_KEYS.BYTEZ_API_KEY || PREDEFINED_API_KEYS.OPENAI_API_KEY || null;
      break;
    case 'deepseek':
      predefinedKey = PREDEFINED_API_KEYS.DEEPSEEK_API_KEY || null;
      break;
    case 'openrouter':
      predefinedKey = PREDEFINED_API_KEYS.OPENROUTER_API_KEY || null;
      break;
  }

  // Return predefined key only if it's not empty
  if (predefinedKey && predefinedKey.trim().length > 0) {
    console.log(`✅ Found predefined API key for ${provider} (from env) - Length: ${predefinedKey.length} chars`);
    return predefinedKey.trim();
  } else if (predefinedKey !== null && predefinedKey.length === 0) {
    console.log(`⚠️ Predefined API key for ${provider} exists but is empty (from env)`);
  } else {
    console.log(`ℹ️ No predefined API key found for ${provider} (checked env vars)`);
  }

  // Fall back to localStorage (user's own key)
  if (typeof window !== 'undefined') {
    const localStorageKey = localStorage.getItem(config.apiKeyName);
    if (localStorageKey && localStorageKey.trim().length > 0) {
      console.log(`Found API key for ${provider} in localStorage (key name: ${config.apiKeyName})`);
      return localStorageKey.trim();
    } else {
      console.log(`No API key found in localStorage for ${provider} (key name: ${config.apiKeyName})`);
      // Debug: List all localStorage keys to help troubleshoot
      const allKeys = Object.keys(localStorage);
      const relevantKeys = allKeys.filter(key => 
        key.toLowerCase().includes('api') || 
        key.toLowerCase().includes('gemini') || 
        key.toLowerCase().includes('deepseek') || 
        key.toLowerCase().includes('openrouter')
      );
      console.log('Relevant localStorage keys:', relevantKeys);
    }
  }

  console.warn(`No API key found for ${provider} (checked env and localStorage)`);
  return null;
}

/**
 * Check if a model requires an API key
 */
export function modelRequiresApiKey(modelId: string): boolean {
  const model = getModelConfig(modelId);
  return model?.requiresApiKey ?? true;
}

/**
 * Check if a model is free
 */
export function isFreeModel(modelId: string): boolean {
  const model = getModelConfig(modelId);
  return model?.isFree ?? false;
}

/**
 * Get all free models
 */
export function getFreeModels(): ModelConfig[] {
  const allModels: ModelConfig[] = [];
  for (const provider of Object.values(PROVIDER_CONFIGS)) {
    allModels.push(...provider.models.filter(m => m.isFree));
  }
  return allModels;
}

/**
 * Get all models that don't require API keys
 */
export function getNoApiKeyModels(): ModelConfig[] {
  const allModels: ModelConfig[] = [];
  for (const provider of Object.values(PROVIDER_CONFIGS)) {
    allModels.push(...provider.models.filter(m => !m.requiresApiKey));
  }
  return allModels;
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: string): string | null {
  return PROVIDER_CONFIGS[provider]?.defaultModel || null;
}

