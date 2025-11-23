import { toast } from 'sonner';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getApiKey } from '@/config/apiConfig';
import { processWithBytez } from './bytezService';

interface DeepSeekOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface VideoSearchResult {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

/**
 * Process conversation using the DeepSeek V3 API
 * @param conversationHistory Array of conversation messages (user/assistant)
 * @param prompt The system prompt for DeepSeek
 * @param options Configuration options for the API
 * @returns Enhanced and processed text
 */
export async function processWithDeepSeek(
  conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> | string,
  prompt: string,
  options: DeepSeekOptions = {}
): Promise<string> {
  try {
    // Handle backward compatibility: if conversationHistory is a string, convert it to array format
    let messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    if (typeof conversationHistory === 'string') {
      // Legacy format: single text string
      messages = [
        { role: 'user', content: conversationHistory }
      ];
    } else {
      // New format: conversation history array
      messages = conversationHistory;
    }

    // Get the model from options (this is the model selected in ModelSelector)
    const selectedModel = options.model;

    if (!selectedModel) {
      throw new Error("No model specified");
    }

    // Get API keys (getApiKey checks env vars first, then localStorage)
    const deepseekApiKey = getApiKey('deepseek');
    const openRouterApiKey = getApiKey('openrouter');
    const geminiApiKey = getApiKey('gemini');

    // Debug: Log API key status (without exposing the actual key)
    console.log('API Key Status:', {
      gemini: geminiApiKey ? `Found (${geminiApiKey.substring(0, 10)}...)` : 'Not found',
      deepseek: deepseekApiKey ? `Found (${deepseekApiKey.substring(0, 10)}...)` : 'Not found',
      openrouter: openRouterApiKey ? `Found (${openRouterApiKey.substring(0, 10)}...)` : 'Not found',
      selectedModel,
      localStorage: {
        gemini: localStorage.getItem('geminiApiKey') ? 'Has key' : 'No key',
        deepseek: localStorage.getItem('deepseekApiKey') ? 'Has key' : 'No key',
        openrouter: localStorage.getItem('openRouterApiKey') ? 'Has key' : 'No key',
      }
    });

    // Determine which API to use based on the selected model, not available API keys
    let useGemini = false;
    let useOpenRouter = false;
    let useDeepSeek = false;
    let providerName = 'Unknown';

    // Check which provider the model belongs to
    if (selectedModel.startsWith('gemini-')) {
      // Gemini model
      useGemini = true;
      providerName = 'Gemini';

      // Check if it's a free model (doesn't need API key)
      const isFreeModel = selectedModel === 'gemini-2.5-flash';
      if (!isFreeModel && !geminiApiKey) {
        throw new Error("Gemini API key is required for this model. Please add your API key in Settings.");
      }
    } else if (selectedModel.includes('/') && !selectedModel.startsWith('openai/')) {
      // OpenRouter model (format: "provider/model:free" or "provider/model")
      useOpenRouter = true;
      providerName = 'OpenRouter';

      // Check if it's a free model
      const freeModels = [
        'deepseek/deepseek-chat-v3-0324:free',
        'deepseek/deepseek-r1-0528:free',
        'moonshotai/kimi-k2:free'
      ];
      const isFreeModel = freeModels.includes(selectedModel);
      if (!isFreeModel && !openRouterApiKey) {
        throw new Error("OpenRouter API key is required for this model. Please add your API key in Settings.");
      }
    } else if (selectedModel === 'deepseek-chat') {
      // DeepSeek model
      useDeepSeek = true;
      providerName = 'DeepSeek';

      if (!deepseekApiKey) {
        throw new Error("DeepSeek API key is required. Please add your API key in Settings.");
      }
    } else {
      throw new Error(`Unknown model: ${selectedModel}`);
    }

    console.log(`Making request using ${providerName} API with model: ${selectedModel}`);

    // Handle Gemini API
    if (useGemini) {
      // Check if it's a free model
      const isFreeModel = selectedModel === 'gemini-2.5-flash';

      // Even free Gemini models require an API key (you get free tier credits)
      // But we should provide a helpful error message
      if (!geminiApiKey) {
        const errorMsg = isFreeModel
          ? "Gemini API key is required. Even free models need an API key (you get free tier credits). Please add your API key in Settings or set VITE_GEMINI_API_KEY in your .env file. Get a free key from: https://aistudio.google.com/app/apikey"
          : "Gemini API key is required for this model. Please add your API key in Settings or set VITE_GEMINI_API_KEY in your .env file.";
        throw new Error(errorMsg);
      }

      const genAI = new GoogleGenerativeAI(geminiApiKey);
      // Use the model from options (selected in ModelSelector)
      const modelToUse = selectedModel;
      // Gemini supports up to 16000 tokens, but respect the requested limit
      const geminiMaxTokens = Math.min(options.max_tokens || 16000, 16000);
      const model = genAI.getGenerativeModel({
        model: modelToUse,
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          maxOutputTokens: geminiMaxTokens,
        },
        systemInstruction: prompt, // Use systemInstruction for system prompt
      });

      // Build conversation history for Gemini chat
      // Convert messages to Gemini's chat format (parts must be an array)
      const chatHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Build history from previous messages (excluding the last user message which we'll send separately)
      const previousMessages = messages.slice(0, -1);
      previousMessages.forEach(msg => {
        if (msg.role === 'user') {
          chatHistory.push({
            role: 'user',
            parts: [{ text: msg.content }]
          });
        } else if (msg.role === 'assistant') {
          chatHistory.push({
            role: 'model',
            parts: [{ text: msg.content }]
          });
        }
      });

      // Get the current user message (last message in the array)
      const currentUserMessage = messages[messages.length - 1];
      const userContent = currentUserMessage.role === 'user' ? currentUserMessage.content : '';

      try {
        // Use startChat for conversation continuation
        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessage(userContent);
        const response = await result.response;
        const generatedText = response.text();

        if (!generatedText) {
          throw new Error("Gemini API returned empty response");
        }

        return generatedText;
      } catch (error: any) {
        console.error("Gemini API error:", error);

        // Handle Gemini-specific errors
        if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("401")) {
          toast.error("Invalid Gemini API key. Please check your settings.");
          throw new Error("API error: 401 - Invalid Gemini API key");
        } else if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
          toast.error("Gemini API rate limit exceeded. Please wait a few minutes and try again.", {
            duration: 8000,
          });
          throw new Error("API error: 429 - Gemini API rate limit exceeded");
        } else if (error.message?.includes("500") || error.message?.includes("503")) {
          toast.error("Gemini API server error. Please try again later.");
          throw new Error(`API error: ${error.status || 500} - Gemini API server error`);
        }

        throw error;
      }
    }

    // Define default options with provider-specific limits
    // DeepSeek max: 8192, OpenRouter/Gemini: 16000+
    const providerMaxTokens = useGemini ? 16000 : (useOpenRouter ? 16000 : 8192);
    const requestedMaxTokens = options.max_tokens || providerMaxTokens;
    const finalMaxTokens = Math.min(requestedMaxTokens, providerMaxTokens);

    // Remove max_tokens from options to avoid conflicts, then set it correctly
    const { max_tokens: _, ...optionsWithoutMaxTokens } = options;
    const defaultOptions = {
      model: selectedModel, // Use the model from options (selected in ModelSelector)
      temperature: 0.2,
      ...optionsWithoutMaxTokens,
      max_tokens: finalMaxTokens // Set max_tokens after spreading to ensure provider limit is respected
    };

    // Build messages array with system prompt and conversation history
    const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: "system",
        content: prompt
      },
      ...messages // Include full conversation history
    ];

    const requestBody = {
      model: defaultOptions.model,
      messages: apiMessages,
      temperature: defaultOptions.temperature,
      max_tokens: defaultOptions.max_tokens
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    let response;

    if (useOpenRouter) {
      // Use OpenRouter API directly
      const siteUrl = window.location.origin;
      const siteName = "Prepzy PYQ";

      // Check if it's a free model
      const freeModels = [
        'deepseek/deepseek-chat-v3-0324:free',
        'deepseek/deepseek-r1-0528:free',
        'moonshotai/kimi-k2:free'
      ];
      const isFreeModel = freeModels.includes(selectedModel);

      // Build headers - free models don't require Authorization header
      const headers: HeadersInit = {
        "HTTP-Referer": siteUrl,
        "X-Title": siteName,
        "Content-Type": "application/json"
      };

      // Only add Authorization header if API key is available (for paid models or if user has key)
      if (openRouterApiKey) {
        headers["Authorization"] = `Bearer ${openRouterApiKey}`;
      }

      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody)
      });
    } else {
      // Use DeepSeek API via proxy server (Vercel serverless function in production)
      const proxyUrl = import.meta.env.PROD
        ? "/api/deepseek"  // Vercel serverless function
        : "http://localhost:3001/api/deepseek";  // Local development

      response = await fetch(proxyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DeepSeek-API-Key": deepseekApiKey!
        },
        body: JSON.stringify(requestBody)
      });
    }

    console.log("API response status:", response.status);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = await response.text();
      }
      console.error("API error response:", errorData);

      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        toast.error(`Invalid ${providerName} API key. Please check your settings.`);
      } else if (response.status === 404) {
        // 404 errors from OpenRouter often indicate privacy/data policy issues
        let errorMessage = `${providerName} API error: `;

        if (useOpenRouter) {
          const errorMsg = errorData?.error?.message || JSON.stringify(errorData);
          if (errorMsg.includes("data policy") || errorMsg.includes("Free model publication")) {
            errorMessage = "OpenRouter data policy configuration required. ";
            errorMessage += "Please configure your privacy settings at https://openrouter.ai/settings/privacy to allow free model usage, or try a different model in Settings.";
            toast.error(errorMessage, {
              duration: 10000,
            });
          } else if (errorMsg.includes("model") || errorMsg.includes("endpoint")) {
            errorMessage = "The selected OpenRouter model is not available. ";
            errorMessage += "Please try a different model in Settings, or configure your OpenRouter account settings.";
            toast.error(errorMessage, {
              duration: 8000,
            });
          } else {
            errorMessage += errorMsg || "Model or endpoint not found. Please check your model selection in Settings.";
            toast.error(errorMessage, {
              duration: 8000,
            });
          }
        } else {
          errorMessage += "Endpoint not found. Please check your API configuration.";
          toast.error(errorMessage);
        }
      } else if (response.status === 429) {
        // Rate limit error
        let errorMessage = `${providerName} API rate limit exceeded. `;

        if (useOpenRouter && errorData?.error?.metadata?.raw) {
          const rawError = errorData.error.metadata.raw;
          if (rawError.includes('rate-limited upstream')) {
            errorMessage += "The free model is temporarily rate-limited. Please wait a few minutes and try again, or add your own API key in Settings for higher rate limits.";
          } else {
            errorMessage += "Please wait a few minutes and try again, or add your own API key in Settings.";
          }
        } else {
          errorMessage += "Please wait a few minutes and try again.";
        }

        toast.error(errorMessage, {
          duration: 8000,
        });
      } else if (response.status === 400) {
        // 400 Bad Request - often indicates invalid parameters
        let errorMessage = `${providerName} API error: `;
        const errorMsg = errorData?.error?.message || errorData?.details || JSON.stringify(errorData);

        if (errorMsg.includes("max_tokens") || errorMsg.includes("Invalid")) {
          if (useOpenRouter || useGemini) {
            errorMessage = "Token limit exceeded. Please try processing a smaller document or split it into parts.";
          } else {
            // DeepSeek has 8192 max
            errorMessage = "Document too large for DeepSeek API (max 8192 tokens). Please try a smaller document, use OpenRouter/Gemini API, or split the document into parts.";
          }
        } else {
          errorMessage += errorMsg;
        }

        toast.error(errorMessage, {
          duration: 10000,
        });
      } else if (response.status >= 500) {
        toast.error(`${providerName} API server error. Please try again later.`);
      } else {
        // Generic error for other status codes
        const errorMsg = errorData?.error?.message || JSON.stringify(errorData);
        toast.error(`${providerName} API error: ${errorMsg}`, {
          duration: 8000,
        });
      }

      throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Log the response for debugging
    console.log("API response data:", JSON.stringify(data, null, 2));

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error("Invalid API response structure:", data);

      // If we got an error message from the API, show it
      if (data.error || data.error_msg) {
        toast.error(`${providerName} API error: ${data.error || data.error_msg}`);
      } else {
        toast.error("Unexpected API response format");
      }

      throw new Error("Invalid API response structure");
    }

    // Check if response was truncated
    const finishReason = data.choices[0].finish_reason;
    if (finishReason === "length") {
      console.warn("API response was truncated due to token limit");
      toast.warning("Response was truncated. Some questions may be missing. Consider processing smaller batches.");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("API error:", error);
    toast.error("AI text processing failed");
    throw error;
  }
}

/**
 * Enhance and correct text using DeepSeek
 * @param text The text to enhance
 * @returns Enhanced text with grammar corrections and formatting
 */
export async function enhanceText(text: string): Promise<string> {
  toast.info("Enhancing extracted text with AI...");

  const prompt = `
    You are an expert at enhancing and correcting text extracted from academic question papers. 
    Your tasks:
    
    1. Fix grammar, spelling, and OCR errors
    2. Properly format questions with correct numbering
    3. Ensure each question starts on a new line with proper indentation
    4. Maintain the original structure of the document
    5. Preserve question numbers and section headings
    6. Fix any broken sentences or paragraphs
    7. Ensure math equations are properly formatted (use LaTeX-style formatting for equations)
    8. Add line breaks between questions for clarity
    9. Make sure each question is clearly separated for easy readability
    10. IMPORTANT: Remove any document headers, footers, or page numbers that aren't part of questions
    
    Format the text to look exactly like a professional academic question paper.
    Return only the enhanced text without any explanations or comments.
  `;

  try {
    // Get the selected model from localStorage (same logic as FileUpload)
    const lastProvider = localStorage.getItem('lastSelectedProvider') || 'gemini';
    const geminiModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
    const openRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
    const openaiModel = localStorage.getItem('openaiModel') || 'openai/gpt-4o';

    let selectedModel: string;
    if (lastProvider === 'openai') {
      selectedModel = openaiModel;
    } else if (lastProvider === 'gemini') {
      selectedModel = geminiModel;
    } else if (lastProvider === 'openrouter') {
      selectedModel = openRouterModel;
    } else if (lastProvider === 'deepseek') {
      selectedModel = 'deepseek-chat';
    } else {
      selectedModel = geminiModel; // Default to Gemini 2.5 Flash (free)
    }
    // Check if it's a ChatGPT model (needs Bytez)
    const isChatGPT = selectedModel.startsWith('openai/');

    let enhancedText: string;
    if (isChatGPT) {
      // Use Bytez service for ChatGPT models
      enhancedText = await processWithBytez(text, prompt, {
        model: selectedModel,
        max_tokens: 16000
      });
    } else {
      // Use DeepSeek service for other models
      // Set max tokens based on provider limits
      // DeepSeek: 8192 max, OpenRouter/Gemini: 16000
      const isDeepSeek = selectedModel === 'deepseek-chat';
      const maxTokens = isDeepSeek ? 8192 : 16000;

      enhancedText = await processWithDeepSeek(text, prompt, {
        model: selectedModel,
        max_tokens: maxTokens
      });
    }
    toast.success("Text enhancement complete");
    return enhancedText;
  } catch (error) {
    console.error("Text enhancement error:", error);
    toast.error("Text enhancement failed");
    // Return original text if enhancement fails
    return text;
  }
}

/**
 * Identify and analyze questions in a text
 * @param text The text containing questions
 * @returns Structured analysis of identified questions
 */
export async function analyzeQuestions(text: string): Promise<any> {
  toast.info("Analyzing questions with AI...");

  const prompt = `
    You are an expert at analyzing academic question papers across all subjects. Your task is to identify and extract ALL questions, focusing on those that are commonly repeated, tricky, or frequently asked.
    
    1. First, identify the exam year from the question paper header/metadata
    
    2. Identify the main subject area and sub-disciplines. Common subjects include:
       - Sciences (Physics, Chemistry, Biology, etc.)
       - Mathematics (Algebra, Calculus, Statistics, etc.)
       - Computer Science & Engineering
       - Social Sciences & Humanities
       - Languages & Literature
       - Business & Economics
       - And other academic fields
    
    3. For EACH question in the paper:
       - Extract the COMPLETE question text with its numbering (do not skip any questions)
       - Identify the specific subject and sub-discipline
       - Extract the main concepts being tested (NOT action words)
       - Identify key technical terms and concepts
       - Mark questions that are tricky or commonly repeated (look for patterns, similar wording across years)
    
    4. Group and classify topics by:
       - Core concepts of the subject
       - Sub-topics within the discipline
       - Technical terms and theories
       - Methods and applications
    
    IMPORTANT:
    - Extract ALL questions from the paper (do not skip any)
    - Extract the year from the question paper (look for year patterns like 2021, 2022-23, etc.)
    - NEVER include action words (explain, describe, write, etc.) as topics
    - Group related concepts under consistent names
    - Use subject-appropriate terminology
    - Focus on actual concepts being tested, not question words
    - Pay special attention to questions that appear frequently or are tricky (prove, derive, calculate, solve, etc.)
    
    Return ONLY a valid JSON array where each item follows this EXACT format:
    {
      "questionText": "The complete question text with number",
      "subject": "The main subject area",
      "subSubject": "The specific branch or sub-discipline",
      "topics": ["2-3 main concepts being tested"],
      "keywords": ["3-5 key technical terms"],
      "year": "The extracted year from the question paper"
    }
    
    Make sure to include ALL questions from the paper in the array.
  `;

  try {
    // Get the selected model from localStorage (same logic as FileUpload)
    const lastProvider = localStorage.getItem('lastSelectedProvider') || 'gemini';
    const geminiModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
    const openRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
    const openaiModel = localStorage.getItem('openaiModel') || 'openai/gpt-4o';

    let selectedModel: string;
    if (lastProvider === 'openai') {
      selectedModel = openaiModel;
    } else if (lastProvider === 'gemini') {
      selectedModel = geminiModel;
    } else if (lastProvider === 'openrouter') {
      selectedModel = openRouterModel;
    } else if (lastProvider === 'deepseek') {
      selectedModel = 'deepseek-chat';
    } else {
      selectedModel = geminiModel; // Default to Gemini 2.5 Flash (free)
    }
    // Check if it's a ChatGPT model (needs Bytez)
    const isChatGPT = selectedModel.startsWith('openai/');

    let analysisText: string;
    if (isChatGPT) {
      // Use Bytez service for ChatGPT models
      analysisText = await processWithBytez(text, prompt, {
        model: selectedModel,
        temperature: 0.1, // Lower temperature for more consistent results
        max_tokens: 16000
      });
    } else {
      // Use DeepSeek service for other models
      // Set max tokens based on provider limits
      // DeepSeek: 8192 max, OpenRouter/Gemini: 16000
      const isDeepSeek = selectedModel === 'deepseek-chat';
      const maxTokens = isDeepSeek ? 8192 : 16000;

      analysisText = await processWithDeepSeek(text, prompt, {
        model: selectedModel,
        temperature: 0.1, // Lower temperature for more consistent results
        max_tokens: maxTokens
      });
    }

    // Remove code block markers if present
    let cleanedAnalysisText = analysisText.replace(/```json|```/g, '').trim();

    // Fix common JSON issues
    // 1. Remove any leading/trailing whitespace and newlines
    cleanedAnalysisText = cleanedAnalysisText.trim();

    // 2. Fix invalid escape sequences - this needs to be done carefully
    // Valid JSON escape sequences: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
    // We'll process this character by character to avoid breaking valid sequences
    let escapeFixed = '';
    let i = 0;
    while (i < cleanedAnalysisText.length) {
      if (cleanedAnalysisText[i] === '\\' && i + 1 < cleanedAnalysisText.length) {
        const nextChar = cleanedAnalysisText[i + 1];
        // Check if it's a valid escape sequence
        if (nextChar === 'u' && i + 5 < cleanedAnalysisText.length) {
          // Check if it's a valid \uXXXX sequence
          const hexDigits = cleanedAnalysisText.substring(i + 2, i + 6);
          if (/^[0-9a-fA-F]{4}$/.test(hexDigits)) {
            // Valid \uXXXX sequence
            escapeFixed += cleanedAnalysisText.substring(i, i + 6);
            i += 6;
            continue;
          }
        } else if (['"', '\\', '/', 'b', 'f', 'n', 'r', 't'].includes(nextChar)) {
          // Valid escape sequence
          escapeFixed += cleanedAnalysisText.substring(i, i + 2);
          i += 2;
          continue;
        }
        // Invalid escape sequence - escape the backslash
        escapeFixed += '\\\\' + nextChar;
        i += 2;
      } else {
        escapeFixed += cleanedAnalysisText[i];
        i++;
      }
    }
    cleanedAnalysisText = escapeFixed;

    // 3. Fix unescaped newlines, tabs, and control characters inside string values
    // Process character by character to avoid double-escaping
    // Only fix characters that are NOT already escaped
    let fixedJson = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < cleanedAnalysisText.length; i++) {
      const char = cleanedAnalysisText[i];

      if (escapeNext) {
        // Previous char was backslash, this is the escaped character
        // The backslash was already added, just add the character
        fixedJson += char;
        escapeNext = false;
      } else if (char === '\\') {
        // Check if this is a valid escape sequence
        if (i + 1 < cleanedAnalysisText.length) {
          const nextChar = cleanedAnalysisText[i + 1];
          if (nextChar === 'u' && i + 5 < cleanedAnalysisText.length) {
            // \uXXXX sequence - copy it as-is
            fixedJson += cleanedAnalysisText.substring(i, i + 6);
            i += 5; // Will increment by 1 at end of loop
            continue;
          } else if (['"', '\\', '/', 'b', 'f', 'n', 'r', 't'].includes(nextChar)) {
            // Valid escape sequence - mark that we're escaping
            escapeNext = true;
            fixedJson += char;
          } else {
            // This shouldn't happen after step 2, but handle it anyway
            escapeNext = true;
            fixedJson += char;
          }
        } else {
          // Backslash at end of string - escape it
          fixedJson += '\\\\';
        }
      } else if (char === '"') {
        // Toggle string state (but not if it's escaped)
        inString = !inString;
        fixedJson += char;
      } else if (inString && !escapeNext) {
        // We're inside a string and not escaping
        // Replace unescaped control characters
        const charCode = char.charCodeAt(0);
        if (charCode === 0x0A) fixedJson += '\\n';      // \n
        else if (charCode === 0x0D) fixedJson += '\\r'; // \r
        else if (charCode === 0x09) fixedJson += '\\t'; // \t
        else if (charCode === 0x08) fixedJson += '\\b'; // \b
        else if (charCode === 0x0C) fixedJson += '\\f'; // \f
        else if (charCode < 0x20 || charCode === 0x7F) {
          // Other control characters - remove or replace with space
          fixedJson += ' ';
        } else {
          fixedJson += char;
        }
      } else {
        fixedJson += char;
      }
    }

    cleanedAnalysisText = fixedJson;

    // 4. Remove any trailing commas before closing brackets/braces
    cleanedAnalysisText = cleanedAnalysisText.replace(/,(\s*[}\]])/g, '$1');

    // Check if the response looks truncated (incomplete JSON)
    if (cleanedAnalysisText.trim().endsWith(',') ||
      (cleanedAnalysisText.includes('[') && !cleanedAnalysisText.trim().endsWith(']'))) {
      console.warn("Response appears to be truncated");
      toast.warning("Response was truncated. Attempting to parse partial data...");
    }

    let analysis;
    try {
      // Try to fix incomplete JSON if it's truncated
      let jsonText = cleanedAnalysisText;
      if (!jsonText.trim().endsWith(']') && jsonText.includes('[')) {
        // Find the last complete object and close the array
        const lastCompleteObject = jsonText.lastIndexOf('}');
        if (lastCompleteObject > 0) {
          jsonText = jsonText.substring(0, lastCompleteObject + 1) + '\n]';
          console.log("Attempting to fix truncated JSON");
        }
      }

      // Try to parse the JSON
      try {
        analysis = JSON.parse(jsonText);
      } catch (parseError: any) {
        // If parsing fails, try more aggressive cleaning
        console.warn("Direct JSON parse failed, attempting aggressive cleaning:", parseError.message);

        // Extract position from error message if available
        const positionMatch = parseError.message.match(/position (\d+)/);
        const errorPosition = positionMatch ? parseInt(positionMatch[1]) : -1;

        if (errorPosition > 0 && errorPosition < jsonText.length) {
          // Log the problematic area
          const start = Math.max(0, errorPosition - 50);
          const end = Math.min(jsonText.length, errorPosition + 50);
          console.warn("Problematic JSON area:", jsonText.substring(start, end));
          console.warn("Character at error position:", jsonText[errorPosition], "Code:", jsonText.charCodeAt(errorPosition));
        }

        // More aggressive cleaning: fix all potential issues
        let fixedJson = jsonText
          // Remove any control characters except those that are properly escaped
          .replace(/[\x00-\x1F\x7F]/g, (match, offset, string) => {
            // Check if we're inside a string
            let inString = false;
            let escapeNext = false;
            for (let i = 0; i < offset; i++) {
              if (escapeNext) {
                escapeNext = false;
                continue;
              }
              if (string[i] === '\\') {
                escapeNext = true;
                continue;
              }
              if (string[i] === '"') {
                inString = !inString;
              }
            }

            if (inString) {
              // We're in a string, escape the control character
              const charCode = match.charCodeAt(0);
              if (charCode === 0x0A) return '\\n'; // \n
              if (charCode === 0x0D) return '\\r'; // \r
              if (charCode === 0x09) return '\\t'; // \t
              if (charCode === 0x08) return '\\b'; // \b
              if (charCode === 0x0C) return '\\f'; // \f
              // For other control characters, remove them or replace with space
              return ' ';
            }
            return ''; // Remove control characters outside strings
          })
          // Fix any remaining invalid escape sequences
          .replace(/\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, '\\\\')
          // Remove trailing commas
          .replace(/,(\s*[}\]])/g, '$1');

        try {
          analysis = JSON.parse(fixedJson);
        } catch (secondError: any) {
          // Try to extract JSON array using regex
          console.warn("Second parse attempt failed, trying regex extraction:", secondError.message);

          const arrayMatch = fixedJson.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            try {
              analysis = JSON.parse(arrayMatch[0]);
            } catch (regexError) {
              // Last resort: try to use a JSON repair approach
              // Remove any characters that are definitely invalid in JSON
              let repairedJson = arrayMatch[0]
                // Remove any remaining control characters
                .replace(/[\x00-\x1F\x7F]/g, ' ')
                // Fix any double-escaped sequences
                .replace(/\\\\\\/g, '\\\\')
                // Ensure all quotes in string values are escaped
                .replace(/":\s*"([^"]*(?:"[^",}\]]*)*)"/g, (match, value) => {
                  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                  return `": "${escaped}"`;
                });

              try {
                analysis = JSON.parse(repairedJson);
              } catch (finalError) {
                console.error("All JSON parsing attempts failed:", finalError);
                console.error("Error position:", errorPosition);
                if (errorPosition > 0) {
                  console.error("Context around error:", jsonText.substring(Math.max(0, errorPosition - 100), Math.min(jsonText.length, errorPosition + 100)));
                }
                throw new Error(`Failed to parse JSON response: ${parseError.message}. Raw text preview: ${jsonText.substring(0, 500)}...`);
              }
            }
          } else {
            throw new Error(`No JSON array found in response. Raw text preview: ${jsonText.substring(0, 500)}...`);
          }
        }
      }
      if (!Array.isArray(analysis)) {
        throw new Error("Response is not an array");
      }

      // Extract year from the question paper text
      const extractedYear = extractYearFromText(text);

      // Filter out any non-question entries and standardize the data
      analysis = analysis.filter(item => {
        return (
          item.questionText &&
          item.questionText.length > 20 &&
          !item.questionText.toLowerCase().includes("reg.no") &&
          !item.questionText.toLowerCase().includes("technology") &&
          /\d/.test(item.questionText)
        );
      }).map(item => {
        // Ensure consistent data structure
        const standardizedItem = {
          ...item,
          year: extractedYear || item.year || "Unknown", // Use extracted year or fallback
          subject: item.subject || "General",
          subSubject: item.subSubject || "General",
          topics: standardizeTopics(item.topics || []),
          keywords: (item.keywords || []).filter(k => typeof k === 'string')
        };
        return standardizedItem;
      });

      toast.success("Question analysis complete");
      return analysis;
    } catch (jsonError) {
      console.error("JSON parsing error:", jsonError, "Raw text:", cleanedAnalysisText.substring(0, 500));

      // Provide more helpful error message
      if (jsonError instanceof SyntaxError && jsonError.message.includes("Unexpected end")) {
        toast.error("Response was truncated. The question paper is too large. Please try processing a smaller section or increase the API token limit.");
        throw new Error("Response truncated: Question paper too large for current token limit. Please process smaller batches.");
      } else {
        toast.error("Failed to parse question analysis. The AI response format was invalid.");
        throw jsonError;
      }
    }
  } catch (error) {
    console.error("Question analysis error:", error);
    toast.error("Question analysis failed");
    throw error;
  }
}

// Helper function to extract year from text
function extractYearFromText(text: string): string | null {
  // Common year patterns
  const yearPatterns = [
    /\b20\d{2}\b/, // Regular year like 2021
    /\b20\d{2}-\d{2,4}\b/, // Year range like 2021-22 or 2021-2022
    /\b20\d{2}\/\d{2,4}\b/, // Year range with slash like 2021/22
    /\b20\d{2}\s*\(\s*\d{2,4}\s*\)/, // Year with bracket like 2021(22)
    /\b20\d{2}\s*batch\b/i, // Year with batch like 2021 Batch
    /\b20\d{2}\s*scheme\b/i // Year with scheme like 2021 Scheme
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Clean up the matched year
      const year = match[0].replace(/[^0-9\-\/]/g, '');
      return year;
    }
  }

  return null;
}

// Helper function to standardize topics
function standardizeTopics(topics: string[]): string[] {
  // Remove action verbs and common words
  const actionVerbs = ['explain', 'describe', 'write', 'list', 'illustrate', 'outline', 'discuss', 'define', 'analyze', 'compare'];
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];

  const cleanedTopics = topics.filter(topic => {
    const lowerTopic = topic.toLowerCase();
    return !actionVerbs.some(verb => lowerTopic.startsWith(verb)) &&
      !commonWords.some(word => word === lowerTopic);
  });

  // Remove duplicates and standardize
  return Array.from(new Set(cleanedTopics)).map(topic => {
    // Capitalize first letter of each word
    return topic.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  });
}

/**
 * Get relevant YouTube videos for a question
 * @param question The analyzed question data
 * @returns Array of relevant video information
 */
export async function getRelevantVideos(question: {
  subject: string;
  subSubject: string;
  topics: string[];
  keywords: string[];
}): Promise<VideoSearchResult[]> {
  try {
    // Get YouTube API key from localStorage
    const youtubeApiKey = localStorage.getItem('youtubeApiKey');
    if (!youtubeApiKey) {
      toast.error("YouTube API key is required for video recommendations");
      throw new Error("YouTube API key is required");
    }

    // Construct search query
    const searchTerms = [
      question.subject,
      question.subSubject,
      ...question.topics,
      ...question.keywords
    ].filter(Boolean);

    // Add educational terms to improve results
    const educationalTerms = ['lecture', 'tutorial', 'explanation'];
    const searchQuery = [...searchTerms, ...educationalTerms].join(' ');

    console.log("Searching YouTube videos for:", searchQuery);

    // Make request to YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(searchQuery)}&type=video&relevanceLanguage=en&videoDuration=medium&key=${youtubeApiKey}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("YouTube API error:", errorData);
      toast.error("Failed to fetch relevant videos");
      throw new Error(`YouTube API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // Transform YouTube API response into our format
    const videos: VideoSearchResult[] = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails.medium.url
    }));

    console.log("Found relevant videos:", videos);
    return videos;
  } catch (error) {
    console.error("Error fetching videos:", error);
    toast.error("Failed to fetch relevant videos");
    throw error;
  }
}

/**
 * Analyze questions and fetch relevant videos
 * @param text The text containing questions
 * @returns Analyzed questions with relevant videos
 */
export async function analyzeQuestionsWithVideos(text: string): Promise<any> {
  // First analyze the questions
  const analysis = await analyzeQuestions(text);

  // Then fetch relevant videos for each question
  const analysisWithVideos = await Promise.all(
    analysis.map(async (question) => {
      try {
        const videos = await getRelevantVideos(question);
        return {
          ...question,
          relatedVideos: videos
        };
      } catch (error) {
        console.error("Error getting videos for question:", error);
        return {
          ...question,
          relatedVideos: []
        };
      }
    })
  );

  return analysisWithVideos;
}
