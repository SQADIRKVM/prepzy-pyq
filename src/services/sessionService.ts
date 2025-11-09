// Simple encryption/decryption for password (client-side only, not secure)
function encryptPassword(password: string): string {
  // Simple base64 encoding (not secure, just obfuscation)
  return btoa(password);
}

function decryptPassword(encrypted: string): string {
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
}

export interface UserSession {
  id: string;
  email: string;
  passwordHash: string; // Encrypted password
  username: string;
  createdAt: string;
  lastLogin: string;
}

export interface AnalysisSession {
  id: string;
  userId: string; // Link to user
  sessionName: string;
  resultId: string; // Link to recent result
  createdAt: string;
  lastAccessed: string;
  questionCount: number;
  year?: string;
  subject?: string;
}

const SESSION_STORAGE_KEY = 'prepzy_user_session';
const USERS_STORAGE_KEY = 'prepzy_users'; // All registered users
const USER_SESSIONS_KEY = 'prepzy_user_sessions'; // All analysis sessions for all users
const SESSION_INFO_SHOWN_KEY = 'prepzy_session_info_shown';

export const sessionService = {
  /**
   * Migrate existing session to users list (for backward compatibility)
   */
  migrateExistingSession: (): void => {
    // Check if migration is needed
    const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (existingUsers) {
      try {
        const users = JSON.parse(existingUsers);
        if (Array.isArray(users) && users.length > 0) {
          return; // Already migrated
        }
      } catch {
        // If parsing fails, continue with migration
      }
    }

    // Check if there's an existing session that needs to be migrated
    try {
      const existingSession = sessionService.getCurrentSession();
      if (existingSession) {
        // Check if this user already exists in the users list
        const allUsers = sessionService.getAllUsers();
        const userExists = allUsers.some(u => u.id === existingSession.id || u.email === existingSession.email);
        
        if (!userExists) {
          // Add to users list
          allUsers.push(existingSession);
          sessionService.saveAllUsers(allUsers);
          console.log('Migrated existing session to users list');
        }
      }
    } catch (error) {
      console.error('Migration error:', error);
    }
  },

  /**
   * Get all registered users
   */
  getAllUsers: (): UserSession[] => {
    // Migrate existing session on first access
    sessionService.migrateExistingSession();
    
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as UserSession[];
    } catch {
      return [];
    }
  },

  /**
   * Save all users
   */
  saveAllUsers: (users: UserSession[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  /**
   * Create a new user session
   */
  createSession: (email: string, password: string, username: string): UserSession => {
    const emailLower = email.trim().toLowerCase();
    const passwordTrimmed = password.trim();
    
    // Check if user already exists
    const allUsers = sessionService.getAllUsers();
    const existingUser = allUsers.find(u => u.email.toLowerCase() === emailLower);
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const session: UserSession = {
      id: `session-${Date.now()}`,
      email: emailLower,
      passwordHash: encryptPassword(passwordTrimmed),
      username: username.trim(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    // Add to users list
    allUsers.push(session);
    sessionService.saveAllUsers(allUsers);

    // Set as current session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    console.log('User created successfully:', emailLower);
    return session;
  },

  /**
   * Get current session
   */
  getCurrentSession: (): UserSession | null => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as UserSession;
    } catch {
      return null;
    }
  },

  /**
   * Login with email and password
   */
  login: (email: string, password: string): boolean => {
    const emailLower = email.trim().toLowerCase();
    const passwordTrimmed = password.trim();
    
    // Find user in all registered users
    const allUsers = sessionService.getAllUsers();
    console.log('Login attempt - All users:', allUsers.length);
    console.log('Login attempt - Email:', emailLower);
    
    const user = allUsers.find(u => u.email.toLowerCase() === emailLower);
    
    if (!user) {
      console.log('Login failed - User not found');
      return false;
    }

    // Verify password
    const decryptedPassword = decryptPassword(user.passwordHash);
    console.log('Login attempt - Password match:', decryptedPassword === passwordTrimmed);
    
    if (decryptedPassword !== passwordTrimmed) {
      console.log('Login failed - Password mismatch');
      return false;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    sessionService.saveAllUsers(allUsers);

    // Set as current session
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    console.log('Login successful');
    return true;
  },

  /**
   * Update user details
   */
  updateUserDetails: (username: string, email?: string): boolean => {
    const session = sessionService.getCurrentSession();
    if (!session) return false;

    const allUsers = sessionService.getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === session.id);
    
    if (userIndex === -1) return false;

    // Update in users list
    allUsers[userIndex].username = username.trim();
    if (email) {
      allUsers[userIndex].email = email.trim().toLowerCase();
    }
    sessionService.saveAllUsers(allUsers);

    // Update current session
    session.username = username.trim();
    if (email) {
      session.email = email.trim().toLowerCase();
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return true;
  },

  /**
   * Change password
   */
  changePassword: (oldPassword: string, newPassword: string): boolean => {
    const session = sessionService.getCurrentSession();
    if (!session) return false;

    const decryptedPassword = decryptPassword(session.passwordHash);
    if (decryptedPassword !== oldPassword) {
      return false; // Old password doesn't match
    }

    const allUsers = sessionService.getAllUsers();
    const userIndex = allUsers.findIndex(u => u.id === session.id);
    
    if (userIndex === -1) return false;

    // Update in users list
    allUsers[userIndex].passwordHash = encryptPassword(newPassword);
    sessionService.saveAllUsers(allUsers);

    // Update current session
    session.passwordHash = encryptPassword(newPassword);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return true;
  },

  /**
   * Logout (clear session)
   */
  logout: (): void => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn: (): boolean => {
    return sessionService.getCurrentSession() !== null;
  },

  /**
   * Check if session info has been shown
   */
  hasSeenSessionInfo: (): boolean => {
    return localStorage.getItem(SESSION_INFO_SHOWN_KEY) === 'true';
  },

  /**
   * Mark session info as shown
   */
  markSessionInfoShown: (): void => {
    localStorage.setItem(SESSION_INFO_SHOWN_KEY, 'true');
  },

  /**
   * Create a new analysis session linked to a result
   */
  createAnalysisSession: (resultId: string, sessionName: string, questionCount: number, year?: string, subject?: string): AnalysisSession | null => {
    const currentUser = sessionService.getCurrentSession();
    if (!currentUser) return null;

    const session: AnalysisSession = {
      id: `analysis-${Date.now()}`,
      userId: currentUser.id,
      sessionName: sessionName,
      resultId: resultId,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      questionCount,
      year,
      subject,
    };

    const allSessions = sessionService.getAllAnalysisSessions();
    allSessions.push(session);
    localStorage.setItem(USER_SESSIONS_KEY, JSON.stringify(allSessions));
    
    return session;
  },

  /**
   * Get all analysis sessions for the current user
   */
  getUserAnalysisSessions: (): AnalysisSession[] => {
    const currentUser = sessionService.getCurrentSession();
    if (!currentUser) return [];

    const allSessions = sessionService.getAllAnalysisSessions();
    return allSessions
      .filter(s => s.userId === currentUser.id)
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
  },

  /**
   * Get all analysis sessions (for all users)
   */
  getAllAnalysisSessions: (): AnalysisSession[] => {
    try {
      const stored = localStorage.getItem(USER_SESSIONS_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as AnalysisSession[];
    } catch {
      return [];
    }
  },

  /**
   * Get a specific analysis session by ID
   */
  getAnalysisSessionById: (sessionId: string): AnalysisSession | null => {
    const allSessions = sessionService.getAllAnalysisSessions();
    return allSessions.find(s => s.id === sessionId) || null;
  },

  /**
   * Update last accessed time for a session
   */
  updateSessionAccess: (sessionId: string): void => {
    const allSessions = sessionService.getAllAnalysisSessions();
    const session = allSessions.find(s => s.id === sessionId);
    if (session) {
      session.lastAccessed = new Date().toISOString();
      localStorage.setItem(USER_SESSIONS_KEY, JSON.stringify(allSessions));
    }
  },

  /**
   * Delete an analysis session
   */
  deleteAnalysisSession: (sessionId: string): void => {
    const allSessions = sessionService.getAllAnalysisSessions();
    const filtered = allSessions.filter(s => s.id !== sessionId);
    localStorage.setItem(USER_SESSIONS_KEY, JSON.stringify(filtered));
  },

  /**
   * Delete all analysis sessions for current user
   */
  deleteAllUserSessions: (): void => {
    const currentUser = sessionService.getCurrentSession();
    if (!currentUser) return;

    const allSessions = sessionService.getAllAnalysisSessions();
    const filtered = allSessions.filter(s => s.userId !== currentUser.id);
    localStorage.setItem(USER_SESSIONS_KEY, JSON.stringify(filtered));
  },
};

