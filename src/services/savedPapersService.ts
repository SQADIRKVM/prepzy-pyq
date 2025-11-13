import { QuestionPaper } from './paperSearchService';

export interface SavedPaper extends QuestionPaper {
  savedAt: string;
}

const SAVED_PAPERS_KEY = 'prepzy_saved_papers';
const RECENT_SEARCHES_KEY = 'prepzy_recent_searches';
const MAX_RECENT_SEARCHES = 10;

export const savedPapersService = {
  /**
   * Save a paper to saved papers
   */
  savePaper: (paper: QuestionPaper): void => {
    try {
      const saved = savedPapersService.getSavedPapers();
      
      // Check if already saved
      if (saved.some(p => p.id === paper.id)) {
        return; // Already saved
      }
      
      const savedPaper: SavedPaper = {
        ...paper,
        savedAt: new Date().toISOString(),
      };
      
      const updated = [savedPaper, ...saved].slice(0, 50); // Max 50 saved papers
      localStorage.setItem(SAVED_PAPERS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving paper:', error);
    }
  },

  /**
   * Remove a paper from saved papers
   */
  removePaper: (paperId: string): void => {
    try {
      const saved = savedPapersService.getSavedPapers();
      const updated = saved.filter(p => p.id !== paperId);
      localStorage.setItem(SAVED_PAPERS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing paper:', error);
    }
  },

  /**
   * Check if a paper is saved
   */
  isPaperSaved: (paperId: string): boolean => {
    const saved = savedPapersService.getSavedPapers();
    return saved.some(p => p.id === paperId);
  },

  /**
   * Get all saved papers
   */
  getSavedPapers: (): SavedPaper[] => {
    try {
      const stored = localStorage.getItem(SAVED_PAPERS_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as SavedPaper[];
    } catch {
      return [];
    }
  },

  /**
   * Add a recent search
   */
  addRecentSearch: (searchTerm: string): void => {
    try {
      if (!searchTerm.trim()) return;
      
      const recent = savedPapersService.getRecentSearches();
      const trimmedTerm = searchTerm.trim();
      
      // Remove if already exists
      const filtered = recent.filter(s => s.toLowerCase() !== trimmedTerm.toLowerCase());
      
      // Add to beginning and limit
      const updated = [trimmedTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  },

  /**
   * Get recent searches
   */
  getRecentSearches: (): string[] => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as string[];
    } catch {
      return [];
    }
  },

  /**
   * Clear recent searches
   */
  clearRecentSearches: (): void => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  },

  /**
   * Clear all saved papers
   */
  clearSavedPapers: (): void => {
    localStorage.removeItem(SAVED_PAPERS_KEY);
  },
};

