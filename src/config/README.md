# API Configuration Guide

This directory contains the API configuration for Prepzy PYQ, including predefined models and API key setup.

## File Structure

- `apiConfig.ts` - Main configuration file with all models and providers
- `.env.example` - Example environment variables file (in project root)

## Setup Instructions

### Option 1: Free Tier (No API Keys Required)

1. Leave all API keys empty in `.env` file
2. Use OpenRouter free models (they work without API keys)
3. Models available:
   - DeepSeek Chat V3 (Free)
   - GLM 4.5 Air (Free)
   - Kimi K2 (Free)
   - Qwen 3 30B (Free)
   - Gemini 2.0 Flash (Free)
   - Llama 3.2 3B (Free)
   - Phi-3 Mini (Free)
   - Mistral 7B (Free)

### Option 2: BYOK (Bring Your Own Key)

1. Copy `.env.example` to `.env` in the project root
2. Add your API keys to `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_key_here
   VITE_OPENAI_API_KEY=your_openai_key_here
   VITE_DEEPSEEK_API_KEY=your_deepseek_key_here
   VITE_OPENROUTER_API_KEY=your_openrouter_key_here
   ```
3. Restart the development server

### Option 3: Predefined Keys (For Deployment)

1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Add the same variables as in `.env.example`
3. These keys will be used for all users (free tier)

## How It Works

1. **Priority Order:**
   - First checks predefined API keys (from `.env` or environment variables)
   - Falls back to user's localStorage keys (BYOK)
   - For free models, no API key is required

2. **Model Selection:**
   - Users can select any model from the configured list
   - Free models are marked with `isFree: true`
   - Models requiring API keys are marked with `requiresApiKey: true`

3. **API Key Storage:**
   - Predefined keys: Environment variables (server-side)
   - User keys: localStorage (client-side)

## Adding New Models

To add a new model, edit `apiConfig.ts` and add it to the appropriate provider's model array:

```typescript
{
  id: 'model-id',
  name: 'Model Name',
  provider: 'openrouter',
  requiresApiKey: false,
  isFree: true,
  maxTokens: 16000,
  description: 'Model description'
}
```

## Supported Providers

1. **Gemini** - Google's AI models
2. **OpenAI** - ChatGPT models
3. **DeepSeek** - DeepSeek AI models
4. **OpenRouter** - Multiple AI models (free and paid)

## Security Notes

- Never commit `.env` files to version control
- Predefined API keys are exposed to clients (use with caution)
- For production, consider using a backend proxy for API keys
- User-provided keys (BYOK) are stored in localStorage (client-side only)

