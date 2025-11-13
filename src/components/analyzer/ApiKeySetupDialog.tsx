
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Key, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ApiKeySetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  defaultProvider?: 'gemini' | 'deepseek' | 'openrouter';
}

const ApiKeySetupDialog = ({ open, onOpenChange, onSave, defaultProvider }: ApiKeySetupDialogProps) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'deepseek' | 'openrouter'>('gemini');

  useEffect(() => {
    if (open) {
      // Load existing keys if any
      const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
      const savedGeminiModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
      const savedDeepseekKey = localStorage.getItem('deepseekApiKey') || '';
      const savedOpenRouterKey = localStorage.getItem('openRouterApiKey') || '';
      const savedOpenRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
      const savedYoutubeKey = localStorage.getItem('youtubeApiKey') || '';
      setGeminiApiKey(savedGeminiKey);
      setGeminiModel(savedGeminiModel);
      setDeepseekApiKey(savedDeepseekKey);
      setOpenRouterApiKey(savedOpenRouterKey);
      setOpenRouterModel(savedOpenRouterModel);
      setYoutubeApiKey(savedYoutubeKey);
      
      // Determine which provider to use based on defaultProvider prop or existing keys (priority: defaultProvider > Gemini > OpenRouter > DeepSeek)
      if (defaultProvider) {
        setApiProvider(defaultProvider);
      } else if (savedGeminiKey) {
        setApiProvider('gemini');
      } else if (savedOpenRouterKey) {
        setApiProvider('openrouter');
      } else if (savedDeepseekKey) {
        setApiProvider('deepseek');
      }
    }
  }, [open, defaultProvider]);

  const handleSave = () => {
    // No validation required - users can save API keys as needed
    // Note: ChatGPT models are free and don't require API key

    // Save API keys
    if (geminiApiKey.trim()) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
      localStorage.setItem('geminiModel', geminiModel);
    } else {
      localStorage.removeItem('geminiApiKey');
      localStorage.removeItem('geminiModel');
    }
    
    if (deepseekApiKey.trim()) {
      localStorage.setItem('deepseekApiKey', deepseekApiKey);
    } else {
      localStorage.removeItem('deepseekApiKey');
    }
    
    if (openRouterApiKey.trim()) {
      localStorage.setItem('openRouterApiKey', openRouterApiKey);
      localStorage.setItem('openRouterModel', openRouterModel);
    } else {
      localStorage.removeItem('openRouterApiKey');
      localStorage.removeItem('openRouterModel');
    }
    
    // ChatGPT models are free, no API key needed
    // Remove any existing ChatGPT API keys
    localStorage.removeItem('openaiApiKey');
    localStorage.removeItem('openaiModel');
    localStorage.removeItem('bytezApiKey');
    
    if (youtubeApiKey) {
      localStorage.setItem('youtubeApiKey', youtubeApiKey);
    }
    
    // Mark as not first time
    localStorage.setItem('apiKeySetupCompleted', 'true');
    
    toast.success('API keys saved successfully!');
    onSave();
    onOpenChange(false);
  };

  const handleSkip = () => {
    // Mark as dismissed (user can set it up later)
    localStorage.setItem('apiKeySetupDismissed', 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Key Setup Required
          </DialogTitle>
          <DialogDescription>
            Configure your API keys to enable AI-powered features. ChatGPT models are free and don't require an API key. You can add API keys for Gemini, DeepSeek, or OpenRouter as needed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Optional:</strong> Add API keys for Gemini, DeepSeek, or OpenRouter to use their models. ChatGPT models are free and don't require an API key. Free models are available for Gemini and OpenRouter.
              </p>
            </div>
          </div>

          {/* API Provider Selection */}
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">AI API Provider</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={apiProvider === 'gemini' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('gemini')}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                Gemini
              </Button>
              <Button
                type="button"
                variant={apiProvider === 'deepseek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('deepseek')}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                DeepSeek
              </Button>
              <Button
                type="button"
                variant={apiProvider === 'openrouter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('openrouter')}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                OpenRouter
              </Button>
            </div>
          </div>

          {/* Gemini API Key */}
          {apiProvider === 'gemini' && (
            <div className="space-y-2">
              <Label htmlFor="setup-gemini-api-key" className="flex items-center gap-2 text-xs sm:text-sm">
                Gemini API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setup-gemini-api-key"
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className={`text-sm h-9 sm:h-10 ${!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}`}
              />
              <div className="flex items-center gap-1">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get your API key from Google AI Studio
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {/* Gemini Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="gemini-model" className="text-[11px] sm:text-xs font-semibold">
                  Gemini Model
                </Label>
                <Select
                  value={geminiModel}
                  onValueChange={setGeminiModel}
                >
                  <SelectTrigger 
                    id="gemini-model"
                    className="h-9 sm:h-10 w-full text-xs sm:text-sm"
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">
                      <div className="flex items-center gap-2">
                        <span>Gemini 2.5 Flash</span>
                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] bg-primary/10 text-primary border-0">
                          Free
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini-2.5-pro">
                      Gemini 2.5 Pro (Most Advanced)
                    </SelectItem>
                    <SelectItem value="gemini-2.5-flash-lite">
                      Gemini 2.5 Flash Lite (Fastest)
                    </SelectItem>
                    <SelectItem value="gemini-2.0-flash">
                      Gemini 2.0 Flash
                    </SelectItem>
                    <SelectItem value="gemini-2.0-flash-lite">
                      Gemini 2.0 Flash Lite
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Choose the Gemini model. Flash models are faster, Pro models offer higher quality.
                </p>
              </div>
            </div>
          )}

          {/* DeepSeek API Key */}
          {apiProvider === 'deepseek' && (
            <div className="space-y-2">
              <Label htmlFor="setup-deepseek-api-key" className="flex items-center gap-2 text-xs sm:text-sm">
                DeepSeek API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setup-deepseek-api-key"
                type="password"
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
                className={`text-sm h-9 sm:h-10 ${!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}`}
              />
              <div className="flex items-center gap-1">
                <a 
                  href="https://platform.deepseek.com/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get your API key from DeepSeek
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* OpenRouter API Key */}
          {apiProvider === 'openrouter' && (
            <div className="space-y-2">
              <Label htmlFor="setup-openrouter-api-key" className="flex items-center gap-2 text-xs sm:text-sm">
                OpenRouter API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setup-openrouter-api-key"
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className={`text-sm h-9 sm:h-10 ${!geminiApiKey && !deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}`}
              />
              <div className="flex items-center gap-1">
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] sm:text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get your API key from OpenRouter
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              {/* OpenRouter Model Selection */}
              <div className="space-y-2">
                <Label htmlFor="openrouter-model" className="text-[11px] sm:text-xs font-semibold">
                  OpenRouter Model
                </Label>
                <Select
                  value={openRouterModel}
                  onValueChange={setOpenRouterModel}
                >
                  <SelectTrigger 
                    id="openrouter-model"
                    className="h-9 sm:h-10 w-full text-xs sm:text-sm"
                  >
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
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
                  </SelectContent>
                </Select>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                  Choose a model from OpenRouter. Free models (DeepSeek V3, DeepSeek R1, Kimi K2) don't require an API key. Others are paid.
                </p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="setup-youtube-api-key" className="flex items-center gap-2 text-xs sm:text-sm">
              YouTube API Key <span className="text-[10px] sm:text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="setup-youtube-api-key"
              value={youtubeApiKey}
              onChange={(e) => setYoutubeApiKey(e.target.value)}
              placeholder="Enter your YouTube API key (optional)"
              className="text-sm h-9 sm:h-10"
            />
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              Used for fetching related educational videos. You can add this later.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto h-10 text-sm">
            Set Up Later
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto h-10 text-sm">
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeySetupDialog;


