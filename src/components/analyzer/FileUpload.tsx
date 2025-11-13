import { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileImage, FileText, Wand2, X, Paperclip, Send, Bot, User, Copy, RotateCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ModelSelector from './ModelSelector';
import { processWithDeepSeek } from '@/services/deepSeekService';
import { processWithBytez } from '@/services/bytezService';
import { getModelConfig } from '@/config/apiConfig';
import { extractTextFromPDF } from '@/services/pdfService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { chatService, ChatMessage } from '@/services/chatService';

interface FileUploadProps {
  onUploadPdf: (files: File[]) => void;
  onUploadImage: (files: File[]) => void;
  onUploadPdfOcr?: (files: File[]) => void;
  onApiKeyRequired?: (provider: 'gemini' | 'deepseek' | 'openrouter' | 'openai') => void;
  initialChatId?: string; // For loading existing chats
}

interface AttachedFile {
  file: File;
  extractedText?: string; // For PDFs, store extracted text
  isExtracting?: boolean;
}

const FileUpload = ({ onUploadPdf, onUploadImage, onUploadPdfOcr, onApiKeyRequired, initialChatId }: FileUploadProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]); // Changed from selectedFiles
  const [uploadType, setUploadType] = useState<'pdf' | 'image' | 'pdfocr'>('pdf');
  const [isDragActive, setIsDragActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat if initialChatId is provided
  useEffect(() => {
    if (initialChatId && messages.length === 0) {
      const chat = chatService.getChatById(initialChatId);
      if (chat) {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
        setHasStarted(true);
      }
    } else if (!initialChatId && currentChatId) {
      // Clear chat ID when starting fresh
      setCurrentChatId(null);
    }
  }, [initialChatId]);

  const formatFileSize = (file: File | { size?: number; __size?: number }) => {
    const bytes = file.size || (file as any).__size || 0;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (file.type.startsWith('image/')) return <FileImage className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleAIChat = async (userMessage: string, fileContents?: { [fileName: string]: string }) => {
    try {
      setIsTyping(true);
      
      // Get the selected model from ModelSelector's localStorage values
      // Use the last selected provider to determine which model to use
      const lastProvider = localStorage.getItem('lastSelectedProvider') || 'gemini'; // Default to Gemini (free)
      const geminiModel = localStorage.getItem('geminiModel') || 'gemini-2.5-flash';
      const openRouterModel = localStorage.getItem('openRouterModel') || 'deepseek/deepseek-chat-v3-0324:free';
      const openaiModel = localStorage.getItem('openaiModel') || 'openai/gpt-4o';
      
      // Determine which model to use based on last selected provider
      let selectedModel: string | undefined;
      let useBytez = false;
      
      if (lastProvider === 'openai') {
        // ChatGPT models are free, no API key needed
        selectedModel = openaiModel;
        useBytez = true;
      } else if (lastProvider === 'gemini') {
        selectedModel = geminiModel;
        // Check if it's a free model (doesn't need API key)
        const isFreeModel = geminiModel === 'gemini-2.5-flash';
        if (!isFreeModel) {
          const geminiApiKey = localStorage.getItem('geminiApiKey');
          if (!geminiApiKey) {
            throw new Error("Gemini API key is required for this model. Please add your API key in Settings.");
          }
        }
      } else if (lastProvider === 'openrouter') {
        selectedModel = openRouterModel;
        // Check if it's a free model
        const freeModels = [
          'deepseek/deepseek-chat-v3-0324:free',
          'deepseek/deepseek-r1-0528:free',
          'moonshotai/kimi-k2:free'
        ];
        const isFreeModel = freeModels.includes(openRouterModel);
        if (!isFreeModel) {
          const openRouterApiKey = localStorage.getItem('openRouterApiKey');
          if (!openRouterApiKey) {
            throw new Error("OpenRouter API key is required for this model. Please add your API key in Settings.");
          }
        }
      } else if (lastProvider === 'deepseek') {
        selectedModel = 'deepseek-chat';
        const deepseekApiKey = localStorage.getItem('deepseekApiKey');
        if (!deepseekApiKey) {
          throw new Error("DeepSeek API key is required. Please add your API key in Settings.");
        }
      } else {
        // Default to free Gemini model
        selectedModel = geminiModel; // Default to Gemini 2.5 Flash (free)
      }
      
      // Build context from attached files (use current attachedFiles if fileContents not provided)
      let fileContext = '';
      const filesToUse = fileContents || (() => {
        const contents: { [fileName: string]: string } = {};
        attachedFiles.forEach(attached => {
          if (attached.extractedText) {
            contents[attached.file.name] = attached.extractedText;
          }
        });
        return contents;
      })();
      
      if (Object.keys(filesToUse).length > 0) {
        fileContext = '\n\nAttached Documents:\n';
        Object.entries(filesToUse).forEach(([fileName, content]) => {
          fileContext += `\n--- ${fileName} ---\n${content.substring(0, 8000)}\n`; // Limit content to avoid token limits
        });
      }
      
      const systemPrompt = `You are Prepzy AI, the intelligent assistant for Prepzy PYQ - a comprehensive study platform for analyzing academic question papers.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. You are Prepzy AI, created and developed by the Prepzy team
2. NEVER mention DeepSeek, Gemini, OpenRouter, or any AI provider/model name
3. NEVER reveal that you are powered by any external AI service
4. NEVER discuss your technical architecture or underlying technology
5. Always identify yourself ONLY as "Prepzy AI" or "Prepzy"
6. If asked "who created you" or "who is your founder", respond that you are Prepzy AI developed by the Prepzy team
7. Focus exclusively on helping with academic question papers and study assistance

Your role:
- Analyze question papers and extract insights
- Answer questions about academic content
- Provide study guidance and tips
- Help users understand topics and concepts
- Assist with exam preparation strategies

Be helpful, concise, and accurate. If the user asks about uploaded files, refer to them in your response.${fileContext}`;

      // Build conversation history from previous messages
      // Convert messages to API format (exclude the current user message we're about to send)
      const conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];
      
      // Add all previous messages to conversation history
      messages.forEach(msg => {
        if (msg.type === 'user') {
          conversationHistory.push({
            role: 'user',
            content: msg.content
          });
        } else if (msg.type === 'assistant') {
          conversationHistory.push({
            role: 'assistant',
            content: msg.content
          });
        }
      });
      
      // Add the current user message
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Route to appropriate service based on model provider
      let response: string;
      if (useBytez) {
        // Use Bytez service for ChatGPT models
        response = await processWithBytez(
          conversationHistory,
          systemPrompt,
          {
            model: selectedModel,
            temperature: 0.7,
            max_tokens: 2000
          }
        );
      } else {
        // Use DeepSeek service for other models (Gemini, DeepSeek, OpenRouter)
        response = await processWithDeepSeek(
          conversationHistory,
          systemPrompt,
          {
            model: selectedModel,
            temperature: 0.7,
            max_tokens: 2000
          }
        );
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, assistantMessage];
        // Save chat after assistant responds
        if (currentChatId) {
          chatService.updateChat(currentChatId, updated);
        } else {
          const newChatId = chatService.saveChat(updated);
          if (newChatId) {
            setCurrentChatId(newChatId);
          }
        }
        return updated;
      });
    } catch (error: any) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key settings or try again.',
        timestamp: new Date(),
      };
      setMessages(prev => {
        const updated = [...prev, errorMessage];
        // Save chat even on error
        if (currentChatId) {
          chatService.updateChat(currentChatId, updated);
        } else {
          const newChatId = chatService.saveChat(updated);
          if (newChatId) {
            setCurrentChatId(newChatId);
          }
        }
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };
  
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const extractedPages = await extractTextFromPDF(file);
      return extractedPages.map(page => page.text).join('\n\n');
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      toast.error(`Failed to extract text from ${file.name}`);
      return '';
    }
  };

  const onDropPdf = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const oversizedFiles = acceptedFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 10MB limit.`);
      return;
    }
    
    setIsExtractingPdf(true);
    setIsDragActive(false);
    
    // Extract text from PDFs and add to attached files
    const newAttachedFiles: AttachedFile[] = [];
    for (const file of acceptedFiles) {
      if (file.type === 'application/pdf') {
        const extractedText = await extractPdfText(file);
        newAttachedFiles.push({
          file,
          extractedText,
          isExtracting: false
        });
      } else {
        newAttachedFiles.push({
          file,
          isExtracting: false
        });
      }
    }
    
    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
    setIsExtractingPdf(false);
    toast.success(`${acceptedFiles.length} file(s) attached`);
  }, []);

  const onDropImage = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    const newAttachedFiles: AttachedFile[] = acceptedFiles.map(file => ({
      file,
      isExtracting: false
    }));
    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
    setIsDragActive(false);
    toast.success(`${acceptedFiles.length} image(s) attached`);
  }, []);

  const onDropPdfOcr = useCallback(async (acceptedFiles: File[]) => {
    if (!onUploadPdfOcr || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    setIsExtractingPdf(true);
    setIsDragActive(false);
    
    // For PDF OCR, extract text and add to attached files
    const newAttachedFiles: AttachedFile[] = [];
    for (const file of acceptedFiles) {
      const extractedText = await extractPdfText(file);
      newAttachedFiles.push({
        file,
        extractedText,
        isExtracting: false
      });
    }
    
    setAttachedFiles(prev => [...prev, ...newAttachedFiles]);
    setIsExtractingPdf(false);
    toast.success(`${acceptedFiles.length} PDF(s) attached`);
  }, [onUploadPdfOcr]);

  const { 
    getRootProps: getPdfRootProps, 
    getInputProps: getPdfInputProps, 
    isDragActive: isPdfDragActive,
    open: openPdf
  } = useDropzone({
    onDrop: onDropPdf,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    noClick: true,
  });

  const { 
    getRootProps: getImageRootProps, 
    getInputProps: getImageInputProps, 
    isDragActive: isImageDragActive,
    open: openImage
  } = useDropzone({
    onDrop: onDropImage,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
    },
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    noClick: true,
  });

  const { 
    getRootProps: getPdfOcrRootProps, 
    getInputProps: getPdfOcrInputProps, 
    isDragActive: isPdfOcrDragActive,
    open: openPdfOcr
  } = useDropzone({
    onDrop: onDropPdfOcr,
    accept: {
      'application/pdf': ['.pdf'],
    },
    disabled: !onUploadPdfOcr,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    noClick: true,
  });

  const getDropzoneProps = () => {
    if (uploadType === 'pdf') return { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive, open: openPdf };
    if (uploadType === 'image') return { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive, open: openImage };
    return { getRootProps: getPdfOcrRootProps, getInputProps: getPdfOcrInputProps, isDragActive: isPdfOcrDragActive, open: openPdfOcr };
  };

  const { getRootProps, open } = getDropzoneProps();

  const handleSend = async () => {
    if (attachedFiles.length === 0 && !input.trim()) return;

    // Build file contents map for AI context
    const fileContents: { [fileName: string]: string } = {};
    attachedFiles.forEach(attached => {
      if (attached.extractedText) {
        fileContents[attached.file.name] = attached.extractedText;
      }
    });

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim() || `Attached ${attachedFiles.length} file(s)`,
      files: attachedFiles.map(attached => attached.file),
      fileContents: Object.keys(fileContents).length > 0 ? fileContents : undefined,
      timestamp: new Date(),
    };

    setMessages(prev => {
      const updated = [...prev, userMessage];
      // Save chat when user sends a message
      if (currentChatId) {
        chatService.updateChat(currentChatId, updated);
      } else {
        const newChatId = chatService.saveChat(updated);
        if (newChatId) {
          setCurrentChatId(newChatId);
        }
      }
      return updated;
    });
    const userInput = input.trim() || `Please analyze the attached file(s)`;
    setInput('');
    
    // Keep files attached for context in subsequent messages
    // Don't clear attachedFiles - they stay for the conversation
    
    // Get AI response with file context
    await handleAIChat(userInput, fileContents);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewPdf = (file: File) => {
    if (file.type === 'application/pdf') {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setViewingPdf(file);
    }
  };

  useEffect(() => {
    // Cleanup blob URL when component unmounts or PDF changes
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy message');
    }
  };

  const handleRegenerate = async (messageIndex: number) => {
    // Find the user message that prompted this assistant response
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.type !== 'user') return;

    // Remove the assistant message and regenerate
    setMessages(prev => prev.slice(0, messageIndex));
    
    // Get file contents from the user message
    const fileContents = userMessage.fileContents;
    
    // Regenerate response
    await handleAIChat(userMessage.content, fileContents);
  };

  const handleQuickAction = (type: 'pdf' | 'image' | 'pdfocr') => {
    setUploadType(type);
    // Open file picker immediately - don't set hasStarted, let messages control visibility
    if (type === 'pdf') {
      openPdf();
    } else if (type === 'image') {
      openImage();
    } else if (type === 'pdfocr' && onUploadPdfOcr) {
      openPdfOcr();
    }
  };

  return (
    <div {...getRootProps()} className="flex flex-col h-full w-full">
      {/* Hidden file input */}
      <input {...getPdfInputProps()} />
      <input {...getImageInputProps()} />
      {onUploadPdfOcr && <input {...getPdfOcrInputProps()} />}

      {/* Initial State - Centered Quick Actions */}
      {messages.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-2 sm:px-3 md:px-4 pb-20 sm:pb-24 md:pb-32">
          <div className="w-full max-w-4xl space-y-3 sm:space-y-4 md:space-y-6">
            <div className="text-center space-y-1.5 sm:space-y-2 px-2">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">What do you want to analyze?</h2>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Choose an upload method to get started</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4 px-2">
              {/* PDF Extract */}
              <Card
                className="p-4 sm:p-5 cursor-pointer border border-border hover:border-primary/50 transition-all hover:shadow-md bg-card/50 backdrop-blur-sm"
                onClick={() => handleQuickAction('pdf')}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10">
                    <FileText className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div className="text-center space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm sm:text-base font-semibold">PDF Extract</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">File, direct text</p>
                  </div>
                </div>
              </Card>

              {/* Image OCR */}
              <Card
                className="p-4 sm:p-5 cursor-pointer border border-border hover:border-primary/50 transition-all hover:shadow-md bg-card/50 backdrop-blur-sm"
                onClick={() => handleQuickAction('image')}
              >
                <div className="flex flex-col items-center gap-2 sm:gap-3">
                  <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10">
                    <FileImage className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  </div>
                  <div className="text-center space-y-0.5 sm:space-y-1">
                    <h3 className="text-sm sm:text-base font-semibold">Image OCR</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Scan images</p>
                  </div>
                </div>
              </Card>

              {/* PDF OCR */}
              {onUploadPdfOcr && (
                <Card
                  className="p-4 sm:p-5 cursor-pointer border border-border hover:border-primary/50 transition-all hover:shadow-md bg-card/50 backdrop-blur-sm"
                  onClick={() => handleQuickAction('pdfocr')}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10">
                      <Wand2 className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                    </div>
                    <div className="text-center space-y-0.5 sm:space-y-1">
                      <h3 className="text-sm sm:text-base font-semibold">PDF OCR</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Advanced OCR</p>
              </div>
              </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto w-full py-3 sm:py-4 md:py-6 min-h-0 pb-20 sm:pb-24 md:pb-32">
          <div className="w-full flex justify-center px-2 sm:px-3 md:px-4">
            <div className="w-full max-w-4xl space-y-3 sm:space-y-4 md:space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 w-full",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
              {message.type === 'assistant' && (
                <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
          </div>
              )}
              
              <div className={cn(
                "flex flex-col gap-1 sm:gap-1.5 md:gap-2 max-w-[90%] sm:max-w-[85%] md:max-w-[80%]",
                message.type === 'user' && 'items-end'
              )}>
                <div className={cn(
                  "group relative rounded-lg sm:rounded-xl md:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3",
                  message.type === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 border border-border/50"
                )}>
                  {message.type === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-p:my-1.5 sm:prose-p:my-2 prose-ul:my-1.5 sm:prose-ul:my-2 prose-ol:my-1.5 sm:prose-ol:my-2 prose-li:my-0 prose-code:text-[10px] sm:prose-code:text-xs prose-pre:text-[10px] sm:prose-pre:text-xs prose-pre:bg-background/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-lg prose-pre:p-1.5 sm:prose-pre:p-2 prose-pre:overflow-x-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  )}
                  
                  {/* File attachments */}
                  {message.files && message.files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.files.map((file, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer hover:bg-opacity-80 transition-colors",
                            message.type === 'user'
                              ? "bg-primary-foreground/10 hover:bg-primary-foreground/15"
                              : "bg-background/50 hover:bg-background/70"
                          )}
                          onClick={() => file.type === 'application/pdf' && handleViewPdf(file)}
                        >
                          {getFileIcon(file)}
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-muted-foreground hidden sm:inline">{formatFileSize(file)}</span>
                          {file.type === 'application/pdf' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 text-muted-foreground hover:text-foreground flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPdf(file);
                              }}
                              title="View PDF"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                  {/* Copy and Regenerate Buttons - Below the message */}
                  {message.type === 'assistant' && (
                    <div className="flex gap-1 sm:gap-1.5 mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyMessage(message.content)}
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                        Copy
                      </Button>
                      {messages.indexOf(message) > 0 && messages[messages.indexOf(message) - 1]?.type === 'user' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 opacity-70 hover:opacity-100 transition-opacity"
                          onClick={() => handleRegenerate(messages.indexOf(message))}
                          title="Regenerate response"
                        >
                          <RotateCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5" />
                          Regenerate
                        </Button>
                      )}
                    </div>
                  )}
              </div>

              {message.type === 'user' && (
                <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                </div>
              )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-2 sm:gap-3 md:gap-4 w-full justify-start">
                  <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 border border-border/50 rounded-lg sm:rounded-xl md:rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
              </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-primary/10 border-4 border-dashed border-primary z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Upload className="h-16 w-16 text-primary mx-auto" />
            <p className="text-xl font-semibold">Drop files here to upload</p>
          </div>
        </div>
      )}

      {/* PDF Viewer Dialog */}
      <Dialog open={!!viewingPdf} onOpenChange={(open) => {
        if (!open) {
          setViewingPdf(null);
          if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }
      }}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 flex-shrink-0">
            <DialogTitle className="text-sm sm:text-base md:text-lg line-clamp-2">
              {viewingPdf?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-4 sm:px-6 pb-4 sm:pb-6 min-h-0">
            {pdfUrl && (
              <iframe
                src={`${pdfUrl}#toolbar=1`}
                className="w-full h-full border border-border rounded-lg"
                title={viewingPdf?.name}
                style={{ minHeight: '60vh' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Input Area - ChatGPT Style - Fixed at Bottom, Full Width, Centered */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-sm z-10 w-full safe-area-inset-bottom">
        <div className="w-full flex justify-center px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
          <div className="w-full max-w-4xl">
          {/* Selected Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-1.5 sm:mb-2 md:mb-3 flex flex-wrap gap-1 sm:gap-1.5 md:gap-2">
              {attachedFiles.map((attached, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 bg-muted/50 rounded-md sm:rounded-lg border border-border/50 text-[10px] sm:text-xs",
                    attached.file.type === 'application/pdf' && "cursor-pointer hover:bg-muted/70 transition-colors"
                  )}
                  onClick={() => attached.file.type === 'application/pdf' && handleViewPdf(attached.file)}
                >
                  {attached.isExtracting ? (
                    <div className="h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-primary border-t-transparent flex-shrink-0" />
                  ) : (
                    <div className="flex-shrink-0">{getFileIcon(attached.file)}</div>
                  )}
                  <span className="max-w-[100px] sm:max-w-[120px] md:max-w-[150px] truncate">{attached.file.name}</span>
                  <span className="text-muted-foreground hidden sm:inline">{formatFileSize(attached.file)}</span>
                  {attached.file.type === 'application/pdf' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-foreground flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPdf(attached.file);
                      }}
                      title="View PDF"
                    >
                      <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    title="Remove file"
                  >
                    <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </Button>
                </div>
              ))}
              </div>
          )}

          {/* Input Container */}
          <Card className="border border-border/50 bg-background/50 backdrop-blur-sm shadow-lg">
            <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2 p-1.5 sm:p-2 md:p-3">
              {/* File Upload Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
              >
                <Paperclip className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Button>

              {/* Text Input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Prepzy..."
                className="flex-1 min-h-[32px] sm:min-h-[36px] md:min-h-[40px] max-h-[150px] sm:max-h-[200px] resize-none bg-transparent border-0 outline-none text-xs sm:text-sm placeholder:text-muted-foreground py-1 sm:py-1.5 md:py-2 leading-relaxed"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '32px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, window.innerWidth < 640 ? 150 : 200)}px`;
                }}
                disabled={isTyping}
              />

                  {/* Model Selector */}
                  <div className="hidden md:block">
                    <ModelSelector onApiKeyRequired={onApiKeyRequired} />
              </div>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={(attachedFiles.length === 0 && !input.trim()) || isTyping || isExtractingPdf}
                size="icon"
                className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 disabled:opacity-50"
              >
                <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </Card>

            <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground text-center mt-1 sm:mt-1.5 md:mt-2 px-2">
              Powered by AI • Upload files or ask questions to get started
            </p>
          </div>
        </div>
          </div>
    </div>
  );
};

export default FileUpload;
