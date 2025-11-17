import { useState, useEffect } from "react";
import { Sparkles, Zap, Crown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getModelConfig } from "@/config/apiConfig";

interface ModelSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (model: string, provider: 'gemini' | 'openai' | 'openrouter' | 'deepseek') => void;
}

const ModelSelectionDialog = ({ open, onOpenChange, onSelect }: ModelSelectionDialogProps) => {
  const [apiProvider, setApiProvider] = useState<'gemini' | 'deepseek' | 'openrouter' | 'openai'>('gemini');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [openRouterModel, setOpenRouterModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [openaiModel, setOpenaiModel] = useState('openai/gpt-4o');
  const [apiTier, setApiTier] = useState<'free' | 'byok'>('free');

  useEffect(() => {
    // Load saved preferences
    const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
    const savedOpenRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
    const savedOpenaiModel = localStorage.getItem('openaiModel') || 'openai/gpt-4o';
    const lastProvider = localStorage.getItem('lastSelectedProvider') || 'gemini';
    
    setGeminiModel(savedGeminiModel);
    setOpenRouterModel(savedOpenRouterModel);
    setOpenaiModel(savedOpenaiModel);
    
    // Set provider based on last selection
    if (lastProvider === 'gemini') {
      setApiProvider('gemini');
      const modelConfig = getModelConfig(savedGeminiModel);
      setApiTier(modelConfig?.isFree ? 'free' : 'byok');
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
    }
  }, [open]);

  const handleModelChange = (value: string) => {
    if (value.startsWith('gemini-')) {
      setGeminiModel(value);
      const isFreeModel = value === 'gemini-2.5-flash';
      setApiTier(isFreeModel ? 'free' : 'byok');
      setApiProvider('gemini');
    } else if (value.startsWith('openai/')) {
      setOpenaiModel(value);
      setApiTier('free');
      setApiProvider('openai');
    } else if (value.includes('/') && !value.startsWith('openai/')) {
      setOpenRouterModel(value);
      const freeModels = [
        'deepseek/deepseek-chat-v3-0324:free',
        'deepseek/deepseek-r1-0528:free',
        'moonshotai/kimi-k2:free'
      ];
      const isFreeModel = freeModels.includes(value);
      setApiTier(isFreeModel ? 'free' : 'byok');
      setApiProvider('openrouter');
    } else if (value === 'deepseek-chat') {
      setApiTier('byok');
      setApiProvider('deepseek');
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
      };
      return modelNames[openRouterModel] || openRouterModel.split('/').pop()?.split(':')[0]?.substring(0, 12) || 'Unknown';
    }
    return 'DeepSeek';
  };

  const handleConfirm = () => {
    let selectedModel: string;
    if (apiProvider === 'gemini') {
      selectedModel = geminiModel;
    } else if (apiProvider === 'openai') {
      selectedModel = openaiModel;
    } else if (apiProvider === 'openrouter') {
      selectedModel = openRouterModel;
    } else {
      selectedModel = 'deepseek-chat';
    }
    
    // Save selection to localStorage
    localStorage.setItem('lastSelectedProvider', apiProvider);
    if (apiProvider === 'gemini') {
      localStorage.setItem('geminiModel', selectedModel);
    } else if (apiProvider === 'openai') {
      localStorage.setItem('openaiModel', selectedModel);
    } else if (apiProvider === 'openrouter') {
      localStorage.setItem('openRouterModel', selectedModel);
    }
    
    onSelect(selectedModel, apiProvider);
    onOpenChange(false);
  };

  const getProviderIcon = () => {
    if (apiProvider === 'gemini') {
      return <Sparkles className="h-4 w-4" />;
    } else if (apiProvider === 'openai') {
      return <Zap className="h-4 w-4" />;
    } else if (apiProvider === 'openrouter') {
      return <Zap className="h-4 w-4" />;
    }
    return <Sparkles className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select AI Model for Analysis</DialogTitle>
          <DialogDescription>
            Choose which AI model you want to use to analyze the selected papers.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Provider</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  const savedModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
                  const isFreeModel = savedModel === 'gemini-2.5-flash';
                  setApiProvider('gemini');
                  setApiTier(isFreeModel ? 'free' : 'byok');
                  setGeminiModel(savedModel);
                }}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                  apiProvider === 'gemini' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Sparkles className="h-4 w-4" />
                Gemini
              </button>
              <button
                onClick={() => {
                  setApiProvider('openai');
                  setApiTier('free');
                  setOpenaiModel(localStorage.getItem('openaiModel') || 'openai/gpt-4o');
                }}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                  apiProvider === 'openai' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Zap className="h-4 w-4" />
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
                  setApiProvider('openrouter');
                  setApiTier(isFreeModel ? 'free' : 'byok');
                  setOpenRouterModel(savedModel);
                }}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                  apiProvider === 'openrouter' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Zap className="h-4 w-4" />
                OpenRouter
              </button>
              <button
                onClick={() => {
                  setApiProvider('deepseek');
                  setApiTier('byok');
                }}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                  apiProvider === 'deepseek' 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <Sparkles className="h-4 w-4" />
                DeepSeek
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select
              value={apiProvider === 'gemini' ? geminiModel : apiProvider === 'openai' ? openaiModel : apiProvider === 'openrouter' ? openRouterModel : 'deepseek-chat'}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getProviderIcon()}
                  <SelectValue>
                    <span className="truncate">{getCurrentModel()}</span>
                  </SelectValue>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  {apiTier === 'free' && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs bg-primary/10 text-primary border-0">
                      Free
                    </Badge>
                  )}
                  {apiTier === 'byok' && (
                    <Badge variant="secondary" className="h-5 px-2 text-xs bg-amber-500/10 text-amber-500 border-0 flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      BYOK
                    </Badge>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent>
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
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Analyze with {getCurrentModel()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSelectionDialog;

