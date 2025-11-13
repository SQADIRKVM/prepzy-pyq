# Bytez API Key Setup for ChatGPT Models

## Overview
ChatGPT models (GPT-4o, GPT-5, GPT-4) are free to use via the Bytez platform, but you still need a Bytez API key to access them.

## Where to Get Your Bytez API Key
1. Visit [Bytez Platform](https://bytez.com) or the Bytez API documentation
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

## How to Add Your Bytez API Key

### Option 1: Environment Variable (Recommended for Development)
Add your Bytez API key to your `.env` file in the project root:

```env
# Bytez API Key for ChatGPT models (free tier)
VITE_BYTEZ_API_KEY=your_bytez_api_key_here

# OR use OPENAI_API_KEY (both work)
VITE_OPENAI_API_KEY=your_bytez_api_key_here
```

**Note:** The `.env` file should be in the root directory of your project (same level as `package.json`).

### Option 2: Settings Dialog (For Users)
1. Open the app
2. Click on **Settings** in the sidebar
3. Go to **API Keys** tab
4. The API key will be saved in browser localStorage

## Important Notes
- ChatGPT models are **free** but still require a Bytez API key
- The key is used to authenticate with the Bytez platform
- You can use either `VITE_BYTEZ_API_KEY` or `VITE_OPENAI_API_KEY` in your `.env` file
- The service checks environment variables first, then localStorage

## Troubleshooting
If you see "Bytez API key is required" error:
1. Make sure your `.env` file is in the project root
2. Restart your development server after adding the key
3. Check that the variable name is exactly `VITE_BYTEZ_API_KEY` or `VITE_OPENAI_API_KEY`
4. Verify your API key is valid on the Bytez platform

