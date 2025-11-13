import { useState, useEffect } from "react";
import { Sparkles, Zap, Crown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getModelConfig } from "@/config/apiConfig";

interface ModelSelectorProps {
  className?: string;
  onApiKeyRequired?: (provider: 'gemini' | 'deepseek' | 'openrouter' | 'openai') => void;
}

const ModelSelector = ({ className, onApiKeyRequired }: ModelSelectorProps) => {
  const [apiProvider, setApiProvider] = useState<'gemini' | 'deepseek' | 'openrouter' | 'openai'>('gemini');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [openRouterModel, setOpenRouterModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [openaiModel, setOpenaiModel] = useState('openai/gpt-4o');
  const [apiTier, setApiTier] = useState<'free' | 'byok'>('free');

  useEffect(() => {
    // Load saved preferences
    const savedGeminiKey = localStorage.getItem('geminiApiKey');
    const savedDeepseekKey = localStorage.getItem('deepseekApiKey');
    const savedOpenRouterKey = localStorage.getItem('openRouterApiKey');
    const savedOpenaiKey = localStorage.getItem('openaiApiKey') || localStorage.getItem('bytezApiKey');
    const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
    const savedOpenRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
    const savedOpenaiModel = localStorage.getItem('openaiModel') || 'openai/gpt-4o';
    
    setGeminiModel(savedGeminiModel);
    setOpenRouterModel(savedOpenRouterModel);
    setOpenaiModel(savedOpenaiModel);
    
    // Determine provider and tier
    if (savedGeminiKey) {
      setApiProvider('gemini');
      // Check if selected model is free
      const modelConfig = getModelConfig(savedGeminiModel);
      setApiTier(modelConfig?.isFree ? 'free' : 'byok');
    } else if (savedOpenaiKey) {
      setApiProvider('openai');
      setApiTier('free'); // ChatGPT models are always free
    } else if (savedOpenRouterKey) {
      setApiProvider('openrouter');
      // Check if selected model is free
      const modelConfig = getModelConfig(savedOpenRouterModel);
      setApiTier(modelConfig?.isFree ? 'free' : 'byok');
    } else if (savedDeepseekKey) {
      setApiProvider('deepseek');
      setApiTier('byok'); // All DeepSeek models require API key
    } else {
      // No API keys, use free tier (default to Gemini)
      const lastProvider = localStorage.getItem('lastSelectedProvider') || 'gemini';
      if (lastProvider === 'gemini') {
        setApiProvider('gemini');
        const isFreeModel = savedGeminiModel === 'gemini-2.5-flash';
        setApiTier(isFreeModel ? 'free' : 'byok');
      } else if (lastProvider === 'openai') {
        setApiProvider('openai');
        setApiTier('free');
      } else if (lastProvider === 'openrouter') {
        setApiProvider('openrouter');
        const modelConfig = getModelConfig(savedOpenRouterModel);
        setApiTier(modelConfig?.isFree ? 'free' : 'byok');
      } else if (lastProvider === 'deepseek') {
        setApiProvider('deepseek');
        setApiTier('byok');
      } else {
        setApiProvider('gemini'); // Default to Gemini (free)
        setApiTier('free');
      }
    }
  }, []);

  const handleModelChange = (value: string) => {
    // Detect which provider this model belongs to
    let detectedProvider: 'gemini' | 'openai' | 'openrouter' | 'deepseek' = apiProvider;
    
    if (value.startsWith('gemini-')) {
      detectedProvider = 'gemini';
      setGeminiModel(value);
      localStorage.setItem('geminiModel', value);
      // Check if API key is needed (gemini-2.5-flash is free, others require BYOK)
      const isFreeModel = value === 'gemini-2.5-flash';
      if (!isFreeModel) {
        const hasKey = !!localStorage.getItem('geminiApiKey');
        if (!hasKey && onApiKeyRequired) {
          onApiKeyRequired('gemini');
        }
      }
      // Update tier and provider
      setApiTier(isFreeModel ? 'free' : 'byok');
      setApiProvider('gemini');
      localStorage.setItem('lastSelectedProvider', 'gemini');
    } else if (value.startsWith('openai/')) {
      detectedProvider = 'openai';
      setOpenaiModel(value);
      localStorage.setItem('openaiModel', value);
      // ChatGPT models are free, no API key needed
      setApiTier('free');
      setApiProvider('openai');
      localStorage.setItem('lastSelectedProvider', 'openai');
    } else if (value.includes('/') && !value.startsWith('openai/')) {
      // OpenRouter models have format like "deepseek/deepseek-chat-v3-0324:free"
      detectedProvider = 'openrouter';
      setOpenRouterModel(value);
      localStorage.setItem('openRouterModel', value);
      // Check if model is free (DeepSeek V3, DeepSeek R1, Kimi K2 are free)
      const freeModels = [
        'deepseek/deepseek-chat-v3-0324:free',
        'deepseek/deepseek-r1-0528:free',
        'moonshotai/kimi-k2:free'
      ];
      const isFreeModel = freeModels.includes(value);
      if (!isFreeModel) {
        const hasKey = !!localStorage.getItem('openRouterApiKey');
        if (!hasKey && onApiKeyRequired) {
          onApiKeyRequired('openrouter');
        }
      }
      // Update tier and provider
      setApiTier(isFreeModel ? 'free' : 'byok');
      setApiProvider('openrouter');
      localStorage.setItem('lastSelectedProvider', 'openrouter');
    } else if (value === 'deepseek-chat') {
      detectedProvider = 'deepseek';
      // DeepSeek always requires API key
      const hasKey = !!localStorage.getItem('deepseekApiKey');
      if (!hasKey && onApiKeyRequired) {
        onApiKeyRequired('deepseek');
      }
      setApiTier('byok');
      setApiProvider('deepseek');
      localStorage.setItem('lastSelectedProvider', 'deepseek');
    }
  };

  const getCurrentModel = () => {
    if (apiProvider === 'gemini') {
      const modelNames: Record<string, string> = {
        'gemini-2.5-flash': 'Gemini 2.5 Flash',
        'gemini-2.5-pro': 'Gemini 2.5 Pro',
        'gemini-2.5-flash-lite': 'Gemini 2.5 Flash Lite',
        'gemini-2.0-flash': 'Gemini 2.0 Flash',
        'gemini-2.0-flash-lite': 'Gemini 2.0 Flash Lite',
      };
      return modelNames[geminiModel] || geminiModel;
    } else if (apiProvider === 'openai') {
      const modelNames: Record<string, string> = {
        'openai/gpt-4o': 'GPT-4o',
        'openai/gpt-5': 'GPT-5',
        'openai/gpt-4': 'GPT-4',
      };
      return modelNames[openaiModel] || openaiModel.split('/').pop() || 'ChatGPT';
    } else if (apiProvider === 'openrouter') {
      const modelNames: Record<string, string> = {
        'deepseek/deepseek-chat-v3-0324:free': 'DeepSeek V3',
        'deepseek/deepseek-r1-0528:free': 'DeepSeek R1',
        'moonshotai/kimi-k2:free': 'Kimi K2',
        'z-ai/glm-4.5-air:free': 'GLM 4.5',
        'qwen/qwen3-30b-a3b:free': 'Qwen 3',
        'google/gemini-2.0-flash:free': 'Gemini 2.0',
        'meta-llama/llama-3.2-3b-instruct:free': 'Llama 3.2',
        'microsoft/phi-3-mini-128k-instruct:free': 'Phi-3',
        'mistralai/mistral-7b-instruct:free': 'Mistral 7B',
      };
      return modelNames[openRouterModel] || openRouterModel.split('/').pop()?.split(':')[0]?.substring(0, 12) || 'Unknown';
    }
    return 'DeepSeek';
  };

  const getProviderIcon = () => {
    if (apiProvider === 'gemini') {
      return <Sparkles className="h-3 w-3" />;
    } else if (apiProvider === 'openai') {
      return <Zap className="h-3 w-3" />;
    } else if (apiProvider === 'openrouter') {
      return <Zap className="h-3 w-3" />;
    }
    return <Sparkles className="h-3 w-3" />;
  };

  return (
    <div className={cn("flex items-center", className)}>
      <Select
        value={apiProvider === 'gemini' ? geminiModel : apiProvider === 'openai' ? openaiModel : apiProvider === 'openrouter' ? openRouterModel : 'deepseek-chat'}
        onValueChange={handleModelChange}
      >
        <SelectTrigger className="h-7 sm:h-8 px-1.5 sm:px-2 gap-1 sm:gap-1.5 text-[10px] sm:text-xs border-border/50 bg-background/50 hover:bg-background/80 w-auto min-w-[140px] sm:min-w-[180px] max-w-[220px] sm:max-w-[260px] [&>span]:text-foreground">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0 overflow-hidden">
            {getProviderIcon()}
            <SelectValue className="flex-1 min-w-0">
              <span className="truncate text-xs sm:text-sm text-foreground font-medium block">{getCurrentModel()}</span>
            </SelectValue>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-1">
            {apiTier === 'free' && (
              <Badge variant="secondary" className="h-4 px-1 sm:px-1.5 text-[8px] sm:text-[9px] bg-primary/10 text-primary border-0 whitespace-nowrap flex-shrink-0">
                Free
              </Badge>
            )}
            {apiTier === 'byok' && (
              <Badge variant="secondary" className="h-4 px-1 sm:px-1.5 text-[8px] sm:text-[9px] bg-amber-500/10 text-amber-500 border-0 whitespace-nowrap flex items-center flex-shrink-0">
                <Crown className="h-2.5 w-2.5 mr-0.5 flex-shrink-0" />
                BYOK
              </Badge>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="min-w-[200px]">
          {/* Provider Selection */}
          <div className="px-2 py-1.5 border-b border-border/50 mb-1">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-1.5">Provider</div>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const savedModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
                  const isFreeModel = savedModel === 'gemini-2.5-flash';
                  const hasKey = !!localStorage.getItem('geminiApiKey');
                  setApiProvider('gemini');
                  setApiTier(isFreeModel ? 'free' : (hasKey ? 'byok' : 'free'));
                  localStorage.setItem('lastSelectedProvider', 'gemini');
                  // If switching to Gemini without API key and not using free model, open setup
                  if (!isFreeModel && !hasKey && onApiKeyRequired) {
                    onApiKeyRequired('gemini');
                  }
                }}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors",
                  apiProvider === 'gemini' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                Gemini
              </button>
              <button
                onClick={() => {
                  setApiProvider('openai');
                  setApiTier('free'); // ChatGPT models are always free
                  localStorage.setItem('lastSelectedProvider', 'openai');
                }}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors",
                  apiProvider === 'openai' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                ChatGPT
              </button>
              <button
                onClick={() => {
                  const savedModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
                  const freeModels = [
                    'deepseek/deepseek-chat-v3-0324:free',
                    'deepseek/deepseek-r1-0528:free',
                    'moonshotai/kimi-k2:free'
                  ];
                  const isFreeModel = freeModels.includes(savedModel);
                  const hasKey = !!localStorage.getItem('openRouterApiKey');
                  setApiProvider('openrouter');
                  setApiTier(isFreeModel ? 'free' : (hasKey ? 'byok' : 'free'));
                  localStorage.setItem('lastSelectedProvider', 'openrouter');
                  // OpenRouter has free models, so no need to force API key setup for free models
                }}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors",
                  apiProvider === 'openrouter' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                OpenRouter
              </button>
              <button
                onClick={() => {
                  const hasKey = !!localStorage.getItem('deepseekApiKey');
                  setApiProvider('deepseek');
                  setApiTier(hasKey ? 'byok' : 'free');
                  localStorage.setItem('lastSelectedProvider', 'deepseek');
                  // If switching to DeepSeek without API key, open setup
                  if (!hasKey && onApiKeyRequired) {
                    onApiKeyRequired('deepseek');
                  }
                }}
                className={cn(
                  "px-2 py-1 text-[10px] rounded transition-colors",
                  apiProvider === 'deepseek' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                DeepSeek
              </button>
            </div>
          </div>

          {/* Model Selection */}
          {apiProvider === 'gemini' ? (
            <>
              <SelectItem value="gemini-2.5-flash">
                <div className="flex items-center gap-2">
                  <span>Gemini 2.5 Flash</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
              <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
              <SelectItem value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</SelectItem>
            </>
          ) : apiProvider === 'openai' ? (
            <>
              <SelectItem value="openai/gpt-4o">
                <div className="flex items-center gap-2">
                  <span>GPT-4o</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="openai/gpt-5">
                <div className="flex items-center gap-2">
                  <span>GPT-5</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="openai/gpt-4">
                <div className="flex items-center gap-2">
                  <span>GPT-4</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
            </>
          ) : apiProvider === 'openrouter' ? (
            <>
              <SelectItem value="deepseek/deepseek-chat-v3-0324:free">
                <div className="flex items-center gap-2">
                  <span>DeepSeek V3</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="deepseek/deepseek-r1-0528:free">
                <div className="flex items-center gap-2">
                  <span>DeepSeek R1</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="moonshotai/kimi-k2:free">
                <div className="flex items-center gap-2">
                  <span>Kimi K2</span>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                    Free
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="z-ai/glm-4.5-air:free">GLM 4.5 Air</SelectItem>
              <SelectItem value="qwen/qwen3-30b-a3b:free">Qwen 3 30B</SelectItem>
              <SelectItem value="google/gemini-2.0-flash:free">Gemini 2.0 Flash</SelectItem>
              <SelectItem value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B</SelectItem>
              <SelectItem value="microsoft/phi-3-mini-128k-instruct:free">Phi-3 Mini</SelectItem>
              <SelectItem value="mistralai/mistral-7b-instruct:free">Mistral 7B</SelectItem>
            </>
          ) : (
            <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelector;
