export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  files?: File[];
  fileContents?: { [fileName: string]: string };
  timestamp: Date | string;
}

interface SerializableChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  fileNames?: string[];
  fileSizes?: number[];
  fileTypes?: string[];
  fileContents?: { [fileName: string]: string };
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  lastAccessed: string;
  messageCount: number;
  hasFiles: boolean;
}

const STORAGE_KEY = 'prepzy_chat_sessions';
const MAX_CHAT_SESSIONS = 20;

/**
 * Generate a title from the first user message
 */
function generateChatTitle(firstMessage: ChatMessage): string {
  if (firstMessage.content) {
    // Use first 50 characters of the message
    const title = firstMessage.content.substring(0, 50).trim();
    return title.length < firstMessage.content.length ? `${title}...` : title;
  }
  if (firstMessage.files && firstMessage.files.length > 0) {
    return `Chat with ${firstMessage.files.length} file(s)`;
  }
  return `New Chat - ${new Date().toLocaleTimeString()}`;
}

// Helper to serialize messages (File objects can't be stored in localStorage)
function serializeMessages(messages: ChatMessage[]): SerializableChatMessage[] {
  return messages.map(msg => ({
    id: msg.id,
    type: msg.type,
    content: msg.content,
    fileNames: msg.files?.map(f => f.name),
    fileSizes: msg.files?.map(f => f.size),
    fileTypes: msg.files?.map(f => f.type),
    fileContents: msg.fileContents,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
  }));
}

// Helper to deserialize messages (reconstruct File objects from metadata)
function deserializeMessages(serialized: SerializableChatMessage[]): ChatMessage[] {
  return serialized.map(msg => ({
    id: msg.id,
    type: msg.type,
    content: msg.content,
    files: msg.fileNames?.map((name, idx) => {
      // Create a File-like object (we can't fully reconstruct File, but we can store metadata)
      const file = new File([], name, { type: msg.fileTypes?.[idx] || 'application/octet-stream' });
      // Store size in a custom property
      (file as any).__size = msg.fileSizes?.[idx] || 0;
      return file;
    }),
    fileContents: msg.fileContents,
    timestamp: new Date(msg.timestamp),
  }));
}

export const chatService = {
  /**
   * Save a new chat session
   */
  saveChat: (messages: ChatMessage[]): string | null => {
    try {
      if (messages.length === 0) return null;

      const firstUserMessage = messages.find(m => m.type === 'user');
      if (!firstUserMessage) return null;

      const title = generateChatTitle(firstUserMessage);
      const hasFiles = messages.some(m => m.files && m.files.length > 0);

      const serializedMessages = serializeMessages(messages);

      const chatSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title,
        messages: serializedMessages as any, // Store serialized version
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        messageCount: messages.length,
        hasFiles,
      };

      const allChats = chatService.getAllChats();
      const updatedChats = [chatSession, ...allChats].slice(0, MAX_CHAT_SESSIONS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedChats));
      return chatSession.id;
    } catch (error) {
      console.error('Error saving chat:', error);
      return null;
    }
  },

  /**
   * Update an existing chat session
   */
  updateChat: (chatId: string, messages: ChatMessage[]): boolean => {
    try {
      const allChats = chatService.getAllChats();
      const chatIndex = allChats.findIndex(c => c.id === chatId);
      
      if (chatIndex === -1) return false;

      const serializedMessages = serializeMessages(messages);
      allChats[chatIndex].messages = serializedMessages as any;
      allChats[chatIndex].messageCount = messages.length;
      allChats[chatIndex].lastAccessed = new Date().toISOString();
      allChats[chatIndex].hasFiles = messages.some(m => m.files && m.files.length > 0);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allChats));
      return true;
    } catch (error) {
      console.error('Error updating chat:', error);
      return false;
    }
  },

  /**
   * Get all chat sessions
   */
  getAllChats: (): ChatSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const chats: ChatSession[] = JSON.parse(stored);
      // Sort by last accessed (most recent first)
      return chats.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );
    } catch (error) {
      console.error('Error getting chats:', error);
      return [];
    }
  },

  /**
   * Get a specific chat by ID (with deserialized messages)
   */
  getChatById: (id: string): ChatSession | null => {
    try {
      const chats = chatService.getAllChats();
      const chat = chats.find(c => c.id === id);
      if (chat) {
        // Deserialize messages
        const deserializedMessages = deserializeMessages(chat.messages as any);
        chat.messages = deserializedMessages as any;
        
        // Update last accessed
        chat.lastAccessed = new Date().toISOString();
        chatService.updateChat(id, deserializedMessages);
      }
      return chat || null;
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      return null;
    }
  },

  /**
   * Delete a chat session
   */
  deleteChat: (id: string): void => {
    try {
      const chats = chatService.getAllChats();
      const filtered = chats.filter(c => c.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  },

  /**
   * Clear all chats
   */
  clearAllChats: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chats:', error);
    }
  },
};

