import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Sparkles, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "👋 Hello! I'm Prepzy AI Assistant, powered by advanced AI to help you with everything about Prepzy PYQ. I can answer questions, guide you through features, help with setup, and more. What would you like to know?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What is Prepzy PYQ?",
    "How do I get started?",
    "What API keys do I need?",
    "Is it free to use?",
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getBotResponse = (userMessage: string): { text: string; suggestions?: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    const conversationContext = messages.slice(-3).map(m => m.text.toLowerCase()).join(' ');

    // Greetings
    if (lowerMessage.match(/hi|hello|hey|greetings|good morning|good afternoon|good evening/)) {
      return {
        text: "Hello! 👋 Welcome to Prepzy PYQ! I'm here to help you master your exam preparation. What would you like to know?",
        suggestions: ["How does Prepzy PYQ work?", "What features does it have?", "How do I get started?"]
      };
    }

    // About Prepzy PYQ
    if (lowerMessage.match(/what is prepzy|what is pyq|about prepzy|tell me about/)) {
      return {
        text: "🤖 Prepzy PYQ is an advanced AI-powered platform designed to revolutionize how students prepare for exams. It uses cutting-edge OCR technology and AI analysis to:\n\n✨ Extract questions from PDFs and images\n📊 Classify questions by topics and subjects\n🔍 Analyze keywords and patterns\n🎥 Recommend educational video resources\n📈 Provide detailed analytics and insights\n\nAll while maintaining complete privacy with local-only storage!",
        suggestions: ["How does it work?", "What features are available?", "Is it free?"]
      };
    }

    // Features
    if (lowerMessage.match(/features|what can it do|capabilities|what does it offer|what are the features/)) {
      return {
        text: "🚀 Prepzy PYQ offers powerful features:\n\n📄 **Multi-Format Support**\n• Upload PDFs and images (JPG, PNG)\n• OCR for scanned documents\n• Batch processing\n\n🤖 **AI-Powered Analysis**\n• Automatic question extraction\n• Topic and subject classification\n• Keyword extraction\n• Pattern recognition\n\n📊 **Smart Organization**\n• Filter by year, topic, subject, keywords\n• View statistics and analytics\n• Export results as JSON\n• Session-based storage\n\n🎥 **Video Resources** (Optional)\n• Curated educational videos\n• YouTube API integration\n\n🔒 **Privacy First**\n• Local browser storage only\n• Auto-delete files after processing\n• No server-side authentication",
        suggestions: ["How do I get started?", "What API keys do I need?", "Is my data safe?"]
      };
    }

    // How to use
    if (lowerMessage.match(/how to use|how do i|getting started|tutorial|guide|steps/)) {
      return {
        text: "📚 Getting started with Prepzy PYQ is simple:\n\n**Step 1:** Click 'Get Started' button to open the Analyzer\n\n**Step 2:** Set up your API keys:\n• Go to Settings (gear icon)\n• Navigate to API Keys section\n• Add DeepSeek or OpenRouter API key\n• Optional: Add YouTube API key for video resources\n\n**Step 3:** Upload your question papers:\n• Drag & drop PDF files or images\n• Or click to browse and select\n• Multiple files supported\n\n**Step 4:** Wait for AI processing (10-20 seconds)\n\n**Step 5:** Explore your results:\n• View extracted questions\n• Filter by year, topic, subject\n• Check analytics and statistics\n• Access video resources\n\nThat's it! You're ready to analyze PYQ papers! 🎉",
        suggestions: ["Where do I get API keys?", "What file formats are supported?", "How long does processing take?"]
      };
    }

    // API Keys
    if (lowerMessage.match(/api key|api keys|deepseek|openrouter|how to get api key|where.*api/)) {
      return {
        text: "🔑 You need an AI API key for full functionality. Here's how to get one:\n\n**Option 1: DeepSeek API**\n1. Visit: platform.deepseek.com\n2. Sign up or log in\n3. Go to API Keys section\n4. Create a new API key\n5. Copy and paste it in Settings\n\n**Option 2: OpenRouter API** (Alternative)\n1. Visit: openrouter.ai\n2. Sign up or log in\n3. Go to Keys section (openrouter.ai/keys)\n4. Create a new API key\n5. Copy and paste it in Settings\n\n💡 **Important:**\n• You only need ONE API key (either DeepSeek OR OpenRouter)\n• OpenRouter uses the model: `deepseek/deepseek-chat-v3-0324:free`\n• Basic text extraction works without API keys\n• AI analysis requires an API key\n\nAdd your key in: Settings → API Keys → Select Provider → Enter Key → Save",
        suggestions: ["Is it free?", "Which one should I choose?", "What if I don't have an API key?"]
      };
    }

    // Pricing
    if (lowerMessage.match(/price|cost|free|pricing|paid|subscription|money/)) {
      return {
        text: "💰 Prepzy PYQ is **completely FREE**! 🎉\n\n✅ No cost\n✅ No subscription\n✅ No hidden fees\n✅ No premium features locked\n✅ Open source\n\nYou only need to provide your own API keys (which are free from DeepSeek or OpenRouter). The platform itself costs nothing to use!",
        suggestions: ["How do I get API keys?", "What's the catch?", "Is there a paid version?"]
      };
    }

    // Privacy
    if (lowerMessage.match(/privacy|data|security|safe|local storage|browser|confidential/)) {
      return {
        text: "🔒 Your privacy is our **top priority**!\n\n**Local-Only Storage:**\n• All data stored in your browser\n• No server-side storage\n• No cloud uploads\n\n**Security Features:**\n• Files auto-deleted after processing (within 5 minutes)\n• API keys stored securely in browser\n• No external authentication\n• Session-based local management\n\n**What We DON'T Do:**\n❌ We never access your files\n❌ We never share your data\n❌ We never send data to servers\n❌ We never track you\n\nYour data stays on your device, always! 🛡️",
        suggestions: ["How does local storage work?", "What happens to my files?", "Is my data safe?"]
      };
    }

    // Session Management
    if (lowerMessage.match(/session|account|login|create account|sign up|register/)) {
      return {
        text: "👤 Prepzy PYQ uses **local session management** for privacy:\n\n**How It Works:**\n• Create a session to save analysis results\n• Sessions stored in your browser only\n• No server-side authentication\n• No third-party login\n\n**Benefits:**\n✅ Complete privacy\n✅ No account creation required\n✅ Multiple sessions supported\n✅ Device-specific storage\n\n**Important Notes:**\n⚠️ Sessions are browser-specific\n⚠️ Clearing browser data removes sessions\n⚠️ Different browsers = different sessions\n\nCreate a session by clicking 'Create Account' in the sidebar!",
        suggestions: ["What if I clear my browser data?", "Can I use it on multiple devices?", "Is login required?"]
      };
    }

    // Support/Help
    if (lowerMessage.match(/help|support|contact|issue|problem|bug|error|not working/)) {
      return {
        text: "🆘 I'm here to help! Here are your support options:\n\n**📚 Documentation:**\n• Visit the Documentation page\n• Step-by-step guides\n• FAQ section\n\n**💬 Community Support:**\n• GitHub: github.com/SQADIRKVM/prepzy-pyq\n• Report issues on GitHub Issues\n• Join discussions\n\n**🤖 AI Assistant (Me!):**\n• Ask me anything about Prepzy PYQ\n• I can guide you through features\n• Help with setup and troubleshooting\n\n**Common Issues:**\n• API key not working? Check Settings\n• Files not uploading? Check format (PDF/JPG/PNG)\n• Processing slow? Large files take longer\n\nWhat specific issue are you facing?",
        suggestions: ["How do I report a bug?", "Where is the documentation?", "My API key isn't working"]
      };
    }

    // Roadmap/Future
    if (lowerMessage.match(/roadmap|future|upcoming|planned|new features|what's next|roadmap/)) {
      return {
        text: "🗺️ We're building towards a **Complete AI Study Operating System**!\n\n**Phase 2 - Connect & Intelligence:**\n• Multi-language OCR (Hindi, Spanish, etc.)\n• Advanced analytics with visualizations\n• Question difficulty analysis\n• Export to PDF/Excel formats\n\n**Phase 3 - Advanced Intelligence:**\n• Collaborative features\n• Personalized study recommendations\n• Progress tracking\n• Custom study plans\n\n**Phase 4 - Complete Study OS:**\n• Mobile app (React Native)\n• Browser extension\n• API for integrations\n• Offline mode\n• Cloud sync (optional)\n\nCheck the Roadmap section on our landing page for detailed timeline! 🚀",
        suggestions: ["When will these features be available?", "Can I contribute?", "What's the current phase?"]
      };
    }

    // Thank you
    if (lowerMessage.match(/thank|thanks|appreciate|grateful/)) {
      return {
        text: "You're very welcome! 😊 I'm glad I could help. If you have any more questions about Prepzy PYQ, feel free to ask anytime. Good luck with your exam preparation! 🎓✨",
        suggestions: ["How do I get started?", "What features are available?", "Is it free?"]
      };
    }

    // Default responses with context awareness
    const defaultResponses = [
      {
        text: "That's an interesting question! 🤔 Prepzy PYQ is an AI-powered platform for analyzing previous year question papers. Could you tell me more about what specifically you'd like to know? I can help with features, setup, usage, or anything else!",
        suggestions: ["What is Prepzy PYQ?", "How do I get started?", "What features does it have?"]
      },
      {
        text: "I'd be happy to help you with that! 💡 Prepzy PYQ offers many features like AI-powered question extraction, topic classification, analytics, and more. What aspect would you like to explore?",
        suggestions: ["How does it work?", "What API keys do I need?", "Is it free to use?"]
      },
      {
        text: "Great question! 🚀 Let me help you understand Prepzy PYQ better. It's designed to make exam preparation easier through AI analysis. What would you like to know more about?",
        suggestions: ["Tell me about features", "How do I get started?", "What makes it special?"]
      },
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking with variable delay for more natural feel
    const thinkingTime = Math.random() * 500 + 800; // 800-1300ms
    
    setTimeout(() => {
      const response = getBotResponse(userMessage.text);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
      
      // Update suggestions if provided
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }
    }, thinkingTime);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "flex items-center justify-center p-0",
          "transition-all duration-300",
          isOpen && "scale-90"
        )}
        aria-label="Open chatbot"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "fixed bottom-24 right-6 z-50 w-[90vw] sm:w-96 h-[600px]",
          "glass-card border-primary/30 shadow-2xl",
          "flex flex-col overflow-hidden",
          "animate-in slide-in-from-bottom-4 duration-300"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                <img 
                  src="/prepzy_logo.svg" 
                  alt="Prepzy PYQ Logo" 
                  className="h-full w-full object-contain p-1.5"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/logo.png') {
                      target.src = '/logo.png';
                    }
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm sm:text-base">Prepzy AI Assistant</h3>
                  <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-muted-foreground">AI Online • Ready to help</p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden border border-primary/30">
                    <img 
                      src="/prepzy_logo.svg" 
                      alt="Prepzy AI" 
                      className="h-full w-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== '/logo.png') {
                          target.src = '/logo.png';
                        }
                      }}
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.sender === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "glass-card border border-primary/20"
                  )}
                >
                  <p className="whitespace-pre-line">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.sender === 'user' && (
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden border border-primary/30">
                  <img 
                    src="/prepzy_logo.svg" 
                    alt="Prepzy AI" 
                    className="h-full w-full object-contain p-1.5"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/logo.png') {
                        target.src = '/logo.png';
                      }
                    }}
                  />
                </div>
                <div className="glass-card border border-primary/20 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-muted-foreground ml-1">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {suggestions.length > 0 && messages.length > 1 && !isTyping && (
            <div className="px-4 pb-2 border-t border-border/30 bg-background/50">
              <div className="flex items-center gap-2 mb-2 pt-2">
                <Lightbulb className="h-3 w-3 text-primary" />
                <p className="text-xs text-muted-foreground">Quick suggestions:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="text-xs h-7 px-2 bg-background/50 hover:bg-primary/10 border-primary/20"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/50 bg-background/80">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Prepzy PYQ..."
                className="flex-1 text-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 shrink-0"
                size="icon"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              <Sparkles className="h-3 w-3 text-primary/60" />
              <p className="text-xs text-muted-foreground">
                Powered by AI • Ask anything about Prepzy PYQ
              </p>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default Chatbot;

