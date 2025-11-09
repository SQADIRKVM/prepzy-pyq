
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
  const [deepseekApiKey, setDeepseekApiKey] = useState('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<'deepseek' | 'openrouter'>('deepseek');

  useEffect(() => {
    if (open) {
      // Load existing keys if any
      const savedDeepseekKey = localStorage.getItem('deepseekApiKey') || '';
      const savedOpenRouterKey = localStorage.getItem('openRouterApiKey') || '';
      const savedYoutubeKey = localStorage.getItem('youtubeApiKey') || '';
      setDeepseekApiKey(savedDeepseekKey);
      setOpenRouterApiKey(savedOpenRouterKey);
      setYoutubeApiKey(savedYoutubeKey);
      
      // Determine which provider to use based on existing keys
      if (savedOpenRouterKey) {
        setApiProvider('openrouter');
      } else if (savedDeepseekKey) {
        setApiProvider('deepseek');
      }
    }
  }, [open]);

  const handleSave = () => {
    // At least one AI API key (DeepSeek or OpenRouter) is required
    if (!deepseekApiKey.trim() && !openRouterApiKey.trim()) {
      toast.error("Either DeepSeek or OpenRouter API key is required");
      return;
    }

    // Save API keys
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
            To use Prepzy PYQ, you need to configure your API keys. Either DeepSeek or OpenRouter API key is required for processing documents.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Required:</strong> Either DeepSeek or OpenRouter API key is mandatory for document processing and question analysis.
              </p>
            </div>
          </div>

          {/* API Provider Selection */}
          <div className="space-y-2">
            <Label>AI API Provider</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={apiProvider === 'deepseek' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('deepseek')}
                className="flex-1"
              >
                DeepSeek
              </Button>
              <Button
                type="button"
                variant={apiProvider === 'openrouter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setApiProvider('openrouter')}
                className="flex-1"
              >
                OpenRouter
              </Button>
            </div>
          </div>

          {/* DeepSeek API Key */}
          {apiProvider === 'deepseek' && (
            <div className="space-y-2">
              <Label htmlFor="setup-deepseek-api-key" className="flex items-center gap-2">
                DeepSeek API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setup-deepseek-api-key"
                type="password"
                value={deepseekApiKey}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                placeholder="Enter your DeepSeek API key"
                className={!deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
              />
              <div className="flex items-center gap-1">
                <a 
                  href="https://platform.deepseek.com/api_keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
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
              <Label htmlFor="setup-openrouter-api-key" className="flex items-center gap-2">
                OpenRouter API Key <span className="text-red-500">*</span>
              </Label>
              <Input
                id="setup-openrouter-api-key"
                type="password"
                value={openRouterApiKey}
                onChange={(e) => setOpenRouterApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                className={!deepseekApiKey && !openRouterApiKey ? "border-amber-500" : ""}
              />
              <div className="flex items-center gap-1">
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get your API key from OpenRouter
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <p className="text-xs text-muted-foreground">
                OpenRouter provides access to DeepSeek models and other AI models. Uses the model: <code className="text-xs bg-muted">deepseek/deepseek-chat-v3-0324:free</code>
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="setup-youtube-api-key" className="flex items-center gap-2">
              YouTube API Key <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="setup-youtube-api-key"
              value={youtubeApiKey}
              onChange={(e) => setYoutubeApiKey(e.target.value)}
              placeholder="Enter your YouTube API key (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Used for fetching related educational videos. You can add this later.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="w-full sm:w-auto">
            Set Up Later
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeySetupDialog;


