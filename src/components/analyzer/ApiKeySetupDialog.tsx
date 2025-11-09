
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
import { Key, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKeySetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const ApiKeySetupDialog = ({ open, onOpenChange, onSave }: ApiKeySetupDialogProps) => {
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'gemini' | 'deepseek' | 'openrouter'>('gemini');

  useEffect(() => {
    if (open) {
      // Load existing keys if any
      const savedGeminiKey = localStorage.getItem('geminiApiKey') || '';
      const savedDeepseekKey = localStorage.getItem('deepseekApiKey') || '';
      const savedOpenRouterKey = localStorage.getItem('openRouterApiKey') || '';
      const savedYoutubeKey = localStorage.getItem('youtubeApiKey') || '';
      setGeminiApiKey(savedGeminiKey);
      setDeepseekApiKey(savedDeepseekKey);
      setOpenRouterApiKey(savedOpenRouterKey);
      setYoutubeApiKey(savedYoutubeKey);
      
      // Determine which provider to use based on existing keys (priority: Gemini > OpenRouter > DeepSeek)
      if (savedGeminiKey) {
        setApiProvider('gemini');
      } else if (savedOpenRouterKey) {
        setApiProvider('openrouter');
      } else if (savedDeepseekKey) {
        setApiProvider('deepseek');
      }
    }
  }, [open]);

  const handleSave = () => {
    // At least one AI API key (Gemini, DeepSeek, or OpenRouter) is required
    if (!geminiApiKey.trim() && !deepseekApiKey.trim() && !openRouterApiKey.trim()) {
      toast.error("At least one AI API key (Gemini, DeepSeek, or OpenRouter) is required");
      return;
    }

    // Save API keys
    if (geminiApiKey.trim()) {
      localStorage.setItem('geminiApiKey', geminiApiKey);
    } else {
      localStorage.removeItem('geminiApiKey');
    }
    
    if (deepseekApiKey.trim()) {
      localStorage.setItem('deepseekApiKey', deepseekApiKey);
    } else {
      localStorage.removeItem('deepseekApiKey');
    }
    
    if (openRouterApiKey.trim()) {
      localStorage.setItem('openRouterApiKey', openRouterApiKey);
    } else {
      localStorage.removeItem('openRouterApiKey');
    }
    
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
            To use Prepzy PYQ, you need to configure your API keys. At least one AI API key (Gemini, DeepSeek, or OpenRouter) is required for processing documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2.5 sm:p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] sm:text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                <strong>Required:</strong> At least one AI API key (Gemini, DeepSeek, or OpenRouter) is mandatory for document processing and question analysis.
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
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                Uses the model: <code className="text-[10px] sm:text-xs bg-muted px-1 py-0.5 rounded">gemini-1.5-flash</code> (fast and efficient)
              </p>
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
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
                OpenRouter provides access to DeepSeek models and other AI models. Uses the model: <code className="text-[10px] sm:text-xs bg-muted px-1 py-0.5 rounded">deepseek/deepseek-chat-v3-0324:free</code>
              </p>
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


