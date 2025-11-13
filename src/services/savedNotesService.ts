import { Note } from './notesSearchService';

export interface SavedNote extends Note {
  savedAt: string;
}

const SAVED_NOTES_KEY = 'prepzy_saved_notes';
const RECENT_NOTE_SEARCHES_KEY = 'prepzy_recent_note_searches';
const MAX_RECENT_SEARCHES = 10;

export const savedNotesService = {
  /**
   * Save a note to saved notes
   */
  saveNote: (note: Note): void => {
    try {
      const saved = savedNotesService.getSavedNotes();
      
      // Check if already saved
      if (saved.some(n => n.id === note.id)) {
        return; // Already saved
      }
      
      const savedNote: SavedNote = {
        ...note,
        savedAt: new Date().toISOString(),
      };
      
      const updated = [savedNote, ...saved].slice(0, 50); // Max 50 saved notes
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving note:', error);
    }
  },

  /**
   * Remove a note from saved notes
   */
  removeNote: (noteId: string): void => {
    try {
      const saved = savedNotesService.getSavedNotes();
      const updated = saved.filter(n => n.id !== noteId);
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing note:', error);
    }
  },

  /**
   * Check if a note is saved
   */
  isNoteSaved: (noteId: string): boolean => {
    const saved = savedNotesService.getSavedNotes();
    return saved.some(n => n.id === noteId);
  },

  /**
   * Get all saved notes
   */
  getSavedNotes: (): SavedNote[] => {
    try {
      const stored = localStorage.getItem(SAVED_NOTES_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as SavedNote[];
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
      
      const recent = savedNotesService.getRecentSearches();
      const trimmedTerm = searchTerm.trim();
      
      // Remove if already exists
      const filtered = recent.filter(s => s.toLowerCase() !== trimmedTerm.toLowerCase());
      
      // Add to beginning and limit
      const updated = [trimmedTerm, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_NOTE_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  },

  /**
   * Get recent searches
   */
  getRecentSearches: (): string[] => {
    try {
      const stored = localStorage.getItem(RECENT_NOTE_SEARCHES_KEY);
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
    localStorage.removeItem(RECENT_NOTE_SEARCHES_KEY);
  },

  /**
   * Clear all saved notes
   */
  clearSavedNotes: (): void => {
    localStorage.removeItem(SAVED_NOTES_KEY);
  },
};

