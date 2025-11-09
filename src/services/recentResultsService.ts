import { AnalysisResult } from "@/pages/analyzer/types";

export interface RecentResult {
  id: string;
  filename: string;
  date: string;
  questionCount: number;
  subjectCount: number;
  topicCount: number;
  year?: string;
  data: AnalysisResult;
}

/**
 * Generate a meaningful filename from analysis result
 */
export function generateResultFilename(result: AnalysisResult): string {
  const { questions } = result;
  
  if (questions.length === 0) {
    return `Empty Analysis - ${new Date().toLocaleTimeString()}`;
  }

  // Extract year (most common year)
  const yearCounts = new Map<string, number>();
  questions.forEach(q => {
    if (q.year && q.year !== "Unknown") {
      yearCounts.set(q.year, (yearCounts.get(q.year) || 0) + 1);
    }
  });
  const mostCommonYear = Array.from(yearCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Extract subjects (most common subject)
  const subjectCounts = new Map<string, number>();
  questions.forEach(q => {
    if (q.subject) {
      subjectCounts.set(q.subject, (subjectCounts.get(q.subject) || 0) + 1);
    }
  });
  const mostCommonSubject = Array.from(subjectCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0];

  // Build filename
  const parts: string[] = [];
  
  if (mostCommonYear) {
    parts.push(mostCommonYear);
  }
  
  if (mostCommonSubject) {
    parts.push(mostCommonSubject);
  }
  
  parts.push(`${questions.length} Questions`);
  
  const timeStr = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  
  return `${parts.join(' - ')} (${timeStr})`;
}

const STORAGE_KEY = 'prepzy_recent_results';
const MAX_RECENT_RESULTS = 10;

export const recentResultsService = {
  /**
   * Save a new result to recent results
   */
  saveResult: (filename: string, result: AnalysisResult): void => {
    try {
      const recentResults = recentResultsService.getRecentResults();
      
      // If filename is not provided or is a generic name, generate a meaningful one
      const finalFilename = filename && 
        !filename.includes('Previous Session') && 
        !filename.includes('Analysis -') && 
        !filename.includes('Untitled')
        ? filename 
        : generateResultFilename(result);
      
      // Create new result entry
      const newResult: RecentResult = {
        id: `result-${Date.now()}`,
        filename: finalFilename,
        date: new Date().toISOString(),
        questionCount: result.questions.length,
        subjectCount: new Set(result.questions.map(q => q.subject)).size,
        topicCount: result.topics.length,
        year: result.questions[0]?.year || undefined,
        data: result,
      };

      // Remove duplicate if same result exists (check by first question ID and count)
      const filteredResults = recentResults.filter(r => {
        if (r.data.questions.length !== result.questions.length) return true;
        if (r.data.questions.length === 0 || result.questions.length === 0) return true;
        return r.data.questions[0]?.id !== result.questions[0]?.id;
      });
      
      // Add new result at the beginning
      const updatedResults = [newResult, ...filteredResults].slice(0, MAX_RECENT_RESULTS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedResults));
    } catch (error) {
      console.error('Error saving recent result:', error);
    }
  },

  /**
   * Get all recent results
   */
  getRecentResults: (): RecentResult[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const results: RecentResult[] = JSON.parse(stored);
      // Sort by date (most recent first)
      return results.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Error getting recent results:', error);
      return [];
    }
  },

  /**
   * Get a specific result by ID
   */
  getResultById: (id: string): RecentResult | null => {
    try {
      const results = recentResultsService.getRecentResults();
      return results.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting result by ID:', error);
      return null;
    }
  },

  /**
   * Delete a specific result
   */
  deleteResult: (id: string): void => {
    try {
      const results = recentResultsService.getRecentResults();
      const filtered = results.filter(r => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  },

  /**
   * Clear all recent results
   */
  clearAllResults: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recent results:', error);
    }
  },

  /**
   * Clear all localStorage data (including recent results, questions, topics, etc.)
   */
  clearAllLocalStorage: (): void => {
    try {
      // Clear recent results
      localStorage.removeItem(STORAGE_KEY);
      
      // Clear current questions and topics
      localStorage.removeItem('analyzedQuestions');
      localStorage.removeItem('questionTopics');
      
      // Note: We keep API keys as they are user settings
      // If you want to clear everything, uncomment below:
      // localStorage.clear();
    } catch (error) {
      console.error('Error clearing all localStorage:', error);
    }
  },
};

