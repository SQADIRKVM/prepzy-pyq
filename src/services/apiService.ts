import { extractQuestionsFromText, extractTextFromPDF, ExtractedText } from './pdfService';
import { performOCR, extractTextFromPDFViaOCR } from './ocrService';
import { databaseService } from './databaseService';
import { findRelatedVideos } from './youtubeService';
import { Question, AnalysisResult, QuestionTopic } from '@/pages/analyzer/types';
import { enhanceText, analyzeQuestions } from './deepSeekService';
import { toast } from 'sonner';

// Helper function to extract year from text
function extractYearFromText(text: string): string | null {
  // Common year patterns
  const yearPatterns = [
    /\b20\d{2}\b/, // Regular year like 2021
    /\b20\d{2}-\d{2,4}\b/, // Year range like 2021-22 or 2021-2022
    /\b20\d{2}\/\d{2,4}\b/, // Year range with slash like 2021/22
    /\b20\d{2}\s*\(\s*\d{2,4}\s*\)/, // Year with bracket like 2021(22)
    /\b20\d{2}\s*batch\b/i, // Year with batch like 2021 Batch
    /\b20\d{2}\s*scheme\b/i // Year with scheme like 2021 Scheme
  ];

  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      // Extract just the first 4-digit year
      const yearMatch = match[0].match(/\b20\d{2}\b/);
      if (yearMatch) {
        return yearMatch[0];
      }
    }
  }

  return null;
}

/**
 * API service for processing documents and managing questions
 * In a real app, this would call backend API endpoints
 */
export const apiService = {
  /**
   * Process multiple PDF files to extract questions
   */
  processMultiplePdfFiles: async (
    files: File[],
    onProgress: (progress: number, step: string, currentFile?: number, totalFiles?: number) => void
  ): Promise<AnalysisResult> => {
    const allQuestions: Question[] = [];
    const allTopicsMap = new Map<string, { count: number, questions: string[] }>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileProgress = (i / files.length) * 100;
      const fileProgressRange = 100 / files.length;

      onProgress(
        fileProgress,
        `Processing file ${i + 1} of ${files.length}: ${file.name}`,
        i + 1,
        files.length
      );

      try {
        // Process each file with adjusted progress callback
        const result = await apiService.processPdfFile(
          file,
          (progress, step) => {
            // Scale progress to fit within this file's range
            const scaledProgress = fileProgress + (progress * fileProgressRange / 100);
            onProgress(
              scaledProgress,
              `[File ${i + 1}/${files.length}] ${step}`,
              i + 1,
              files.length
            );
          }
        );

        // Aggregate questions
        allQuestions.push(...result.questions);

        // Aggregate topics
        result.topics.forEach(topic => {
          if (!allTopicsMap.has(topic.name)) {
            allTopicsMap.set(topic.name, { count: 0, questions: [] });
          }
          const topicData = allTopicsMap.get(topic.name)!;
          topicData.count += topic.count;
          topicData.questions.push(...topic.questions);
        });

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with other files even if one fails
        onProgress(
          fileProgress + fileProgressRange,
          `Failed to process ${file.name}, continuing with other files...`,
          i + 1,
          files.length
        );
      }
    }

    // Deduplicate questions (remove exact duplicates and very similar ones)
    const deduplicatedQuestions = deduplicateQuestions(allQuestions);

    // Filter to only show repeated/common questions
    const commonQuestions = filterCommonQuestions(deduplicatedQuestions);

    // Convert topics map to array (only for common questions)
    const commonQuestionIds = new Set(commonQuestions.map(q => q.id));
    const topicsArray: QuestionTopic[] = Array.from(allTopicsMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        questions: Array.from(new Set(data.questions.filter(id => commonQuestionIds.has(id)))) // Only include common questions
      }))
      .filter(topic => topic.count > 1 && topic.questions.length > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const result: AnalysisResult = {
      questions: commonQuestions,
      topics: topicsArray
    };

    // Save aggregated results (use first file name or combined name)
    const combinedFilename = files.length > 1
      ? `${files.length} files (${files.map(f => f.name).join(', ')})`
      : files[0]?.name || 'Multiple Files';
    await databaseService.saveQuestions(result, combinedFilename);

    return result;
  },

  /**
   * Process a PDF file to extract questions
   */
  processPdfFile: async (
    file: File,
    onProgress: (progress: number, step: string) => void
  ): Promise<AnalysisResult> => {
    try {
      // 1. Extract text from PDF (30%)
      onProgress(10, "Extracting text from PDF...");
      const extractedText = await extractTextFromPDF(file);
      onProgress(30, "PDF text extraction complete");

      // 2. Enhance text with AI (50%)
      onProgress(35, "Enhancing text with AI...");
      const combinedText = extractedText.map(page => page.text).join('\n\n');
      const enhancedTextResult = await enhanceText(combinedText);
      onProgress(50, "AI text enhancement complete");

      // 3. Analyze questions with AI (70%)
      onProgress(55, "Analyzing questions with AI...");
      const analysisResult = await analyzeQuestions(enhancedTextResult);

      // If the AI analysis was successful, convert to our Question format
      const extractedQuestions: Question[] = [];

      if (Array.isArray(analysisResult) && analysisResult.length > 0) {
        // Use AI-analyzed questions
        // Extract year from the first question's year field or from text (all questions from same paper should have same year)
        const extractedYear = analysisResult[0]?.year || extractYearFromText(combinedText) || "Unknown";

        analysisResult.forEach((item, index) => {
          if (item.questionText) {
            extractedQuestions.push({
              id: `q-${Date.now()}-${index}`,
              text: item.questionText,
              year: item.year || extractedYear, // Use year from AI analysis or extracted year
              subject: item.subject || "General",
              topics: Array.isArray(item.topics) ? item.topics : [],
              keywords: Array.isArray(item.keywords) ? item.keywords : [],
            });
          }
        });
      } else {
        // Fall back to the original question extraction method
        const enhancedText: ExtractedText[] = [{
          text: enhancedTextResult,
          pageNumber: 1
        }];

        const fallbackQuestions = await extractQuestionsFromText(enhancedText);
        extractedQuestions.push(...fallbackQuestions);
      }

      onProgress(70, "Question analysis complete");

      // 4. Find related videos for each question (100%)
      onProgress(75, "Finding related educational videos...");
      const enhancedQuestions = [];

      for (let i = 0; i < extractedQuestions.length; i++) {
        const question = extractedQuestions[i];
        const questionWithVideos = await findRelatedVideos(question);
        enhancedQuestions.push(questionWithVideos);

        // Update progress incrementally
        const progressIncrement = 25 * ((i + 1) / extractedQuestions.length);
        onProgress(75 + progressIncrement, `Processing question ${i + 1} of ${extractedQuestions.length}`);
      }

      // 5. Identify common topics across questions
      const topics = extractCommonTopics(enhancedQuestions);

      // 6. Save to database
      const result: AnalysisResult = {
        questions: enhancedQuestions,
        topics
      };

      await databaseService.saveQuestions(result, file.name);

      return result;
    } catch (error) {
      console.error("Error processing PDF:", error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Process an image file using OCR to extract questions
   */
  processImageFile: async (
    file: File,
    onProgress: (progress: number, step: string) => void
  ): Promise<AnalysisResult> => {
    try {
      // 1. Perform OCR on image (40%)
      onProgress(10, "Performing OCR on image...");
      const ocrResult = await performOCR(file);
      onProgress(40, "OCR processing complete");

      // 2. Enhance extracted text with AI (60%)
      onProgress(45, "Enhancing and correcting OCR text with AI...");
      const enhancedText = await enhanceText(ocrResult.text);
      onProgress(60, "AI text enhancement complete");

      // 3. Analyze questions with AI (80%)
      onProgress(65, "Analyzing questions with AI...");
      const analysisResult = await analyzeQuestions(enhancedText);

      // If AI analysis was successful, convert to our Question format
      let extractedQuestions: Question[] = [];

      if (Array.isArray(analysisResult) && analysisResult.length > 0) {
        // Use AI-analyzed questions
        // Extract year from the first question's year field or from text (all questions from same paper should have same year)
        const extractedYear = analysisResult[0]?.year || extractYearFromText(enhancedText) || "Unknown";

        analysisResult.forEach((item, index) => {
          if (item.questionText) {
            extractedQuestions.push({
              id: `q-${Date.now()}-${index}`,
              text: item.questionText,
              year: item.year || extractedYear, // Use year from AI analysis or extracted year
              subject: item.subject || "General",
              topics: Array.isArray(item.topics) ? item.topics : [],
              keywords: Array.isArray(item.keywords) ? item.keywords : [],
            });
          }
        });
      } else {
        // Fall back to the original question extraction method
        const extractedTextForFallback: ExtractedText[] = [{
          text: enhancedText,
          pageNumber: 1
        }];

        extractedQuestions = await extractQuestionsFromText(extractedTextForFallback);
      }

      onProgress(80, "Questions identified and analyzed");

      // 4. Find related videos for each question (100%)
      onProgress(85, "Finding related educational videos...");
      const enhancedQuestions = [];

      for (let i = 0; i < extractedQuestions.length; i++) {
        const question = extractedQuestions[i];
        const questionWithVideos = await findRelatedVideos(question);
        enhancedQuestions.push(questionWithVideos);

        // Update progress incrementally
        const progressIncrement = 15 * ((i + 1) / extractedQuestions.length);
        onProgress(85 + progressIncrement, `Processing question ${i + 1} of ${extractedQuestions.length}`);
      }

      // 5. Deduplicate questions (remove exact duplicates and very similar ones)
      const deduplicatedQuestions = deduplicateQuestions(enhancedQuestions);

      // 6. Filter to only show repeated/common questions
      const commonQuestions = filterCommonQuestions(deduplicatedQuestions);

      // 7. Identify common topics across questions (only for common questions)
      const topics = extractCommonTopics(commonQuestions);

      // 8. Save to database
      const result: AnalysisResult = {
        questions: commonQuestions,
        topics
      };

      await databaseService.saveQuestions(result, file.name);

      return result;
    } catch (error) {
      console.error("Error processing image:", error);
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Process a PDF file using the OCR approach (convert to images first)
   */
  processPdfWithOCR: async (
    file: File,
    onProgress: (progress: number, step: string) => void
  ): Promise<AnalysisResult> => {
    try {
      // 1. Convert PDF to images and perform OCR (50%)
      onProgress(10, "Converting PDF to images for OCR...");
      const extractedText = await extractTextFromPDFViaOCR(file);
      onProgress(50, "PDF-to-image OCR complete");

      // 2. Analyze questions with AI (70%)
      onProgress(55, "Analyzing questions with AI...");
      const analysisResult = await analyzeQuestions(extractedText);

      // If the AI analysis was successful, convert to our Question format
      let extractedQuestions: Question[] = [];

      if (Array.isArray(analysisResult) && analysisResult.length > 0) {
        // Use AI-analyzed questions
        // Extract year from the first question's year field or from text (all questions from same paper should have same year)
        const extractedYear = analysisResult[0]?.year || extractYearFromText(extractedText) || "Unknown";

        analysisResult.forEach((item, index) => {
          if (item.questionText) {
            extractedQuestions.push({
              id: `q-${Date.now()}-${index}`,
              text: item.questionText,
              year: item.year || extractedYear, // Use year from AI analysis or extracted year
              subject: item.subject || "General",
              topics: Array.isArray(item.topics) ? item.topics : [],
              keywords: Array.isArray(item.keywords) ? item.keywords : [],
            });
          }
        });
      } else {
        // Fall back to the original question extraction method
        const extractedTextForFallback: ExtractedText[] = [{
          text: extractedText,
          pageNumber: 1
        }];

        extractedQuestions = await extractQuestionsFromText(extractedTextForFallback);
      }

      onProgress(70, "Question analysis complete");

      // 3. Find related videos for each question (100%)
      onProgress(75, "Finding related educational videos...");
      const enhancedQuestions = [];

      for (let i = 0; i < extractedQuestions.length; i++) {
        const question = extractedQuestions[i];
        const questionWithVideos = await findRelatedVideos(question);
        enhancedQuestions.push(questionWithVideos);

        // Update progress incrementally
        const progressIncrement = 25 * ((i + 1) / extractedQuestions.length);
        onProgress(75 + progressIncrement, `Processing question ${i + 1} of ${extractedQuestions.length}`);
      }

      // 4. Deduplicate questions (remove exact duplicates and very similar ones)
      const deduplicatedQuestions = deduplicateQuestions(enhancedQuestions);

      // 5. Filter to only show repeated/common questions
      const commonQuestions = filterCommonQuestions(deduplicatedQuestions);

      // 6. Identify common topics across questions (only for common questions)
      const topics = extractCommonTopics(commonQuestions);

      // 7. Save to database
      const result: AnalysisResult = {
        questions: commonQuestions,
        topics
      };

      await databaseService.saveQuestions(result, file.name);

      return result;
    } catch (error) {
      console.error("Error processing PDF with OCR:", error);
      throw new Error(`Failed to process PDF with OCR: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Get all questions from the database
   */
  getQuestions: async (): Promise<AnalysisResult> => {
    return await databaseService.getQuestions();
  },

  /**
   * Get filtered questions from the database
   */
  getFilteredQuestions: async (
    yearFilter: string,
    topicFilter: string,
    keywordFilter: string
  ): Promise<AnalysisResult> => {
    return await databaseService.getQuestionsByFilter(
      yearFilter,
      topicFilter,
      keywordFilter
    );
  }
};

/**
 * Deduplicate questions by removing exact duplicates and very similar questions
 */
function deduplicateQuestions(questions: Question[]): Question[] {
  const seen = new Map<string, Question>();
  const normalizedTexts = new Set<string>();

  for (const question of questions) {
    // Normalize text for comparison (lowercase, remove extra spaces, remove question numbers)
    const normalized = question.text
      .toLowerCase()
      .replace(/^\d+[\.\)]\s*/g, '') // Remove question numbers
      .replace(/\s+/g, ' ')
      .trim();

    // Skip if we've seen this exact normalized text
    if (normalizedTexts.has(normalized)) {
      continue;
    }

    // Check for similar questions (80% similarity threshold)
    let isDuplicate = false;
    for (const [existingNormalized, existingQuestion] of seen.entries()) {
      const similarity = calculateSimilarity(normalized, existingNormalized);
      if (similarity > 0.8) {
        isDuplicate = true;
        // Keep the one with more topics/keywords (more complete)
        if ((question.topics?.length || 0) + (question.keywords?.length || 0) >
          (existingQuestion.topics?.length || 0) + (existingQuestion.keywords?.length || 0)) {
          seen.delete(existingNormalized);
          seen.set(normalized, question);
          normalizedTexts.delete(existingNormalized);
          normalizedTexts.add(normalized);
        }
        break;
      }
    }

    if (!isDuplicate) {
      seen.set(normalized, question);
      normalizedTexts.add(normalized);
    }
  }

  return Array.from(seen.values());
}

/**
 * Calculate similarity between two strings using Jaccard similarity
 */
function calculateSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

/**
 * Filter to only show repeated/common/tricky questions
 * A question is considered common if:
 * 1. It appears in multiple topics (repeated across different contexts)
 * 2. It has common topics/keywords that appear in other questions
 * 3. It's marked as tricky by having certain keywords
 */
function filterCommonQuestions(questions: Question[]): Question[] {
  if (questions.length === 0) return [];

  // Build a map of topic/keyword frequency
  const topicFrequency = new Map<string, number>();
  const keywordFrequency = new Map<string, number>();

  questions.forEach(q => {
    q.topics?.forEach(topic => {
      topicFrequency.set(topic, (topicFrequency.get(topic) || 0) + 1);
    });
    q.keywords?.forEach(keyword => {
      keywordFrequency.set(keyword, (keywordFrequency.get(keyword) || 0) + 1);
    });
  });

  // Build a map to track question similarity (questions that share topics/keywords)
  const questionSimilarity = new Map<string, number>();

  questions.forEach(q => {
    let similarityScore = 0;

    // Count how many other questions share the same topics/keywords
    q.topics?.forEach(topic => {
      const freq = topicFrequency.get(topic) || 0;
      if (freq > 1) similarityScore += freq - 1; // -1 because we don't count the question itself
    });

    q.keywords?.forEach(keyword => {
      const freq = keywordFrequency.get(keyword) || 0;
      if (freq > 1) similarityScore += freq - 1;
    });

    questionSimilarity.set(q.id, similarityScore);
  });

  // Filter questions that are common/repeated
  const commonQuestions = questions.filter(q => {
    // Check if question has topics/keywords that appear in multiple questions
    const hasCommonTopics = q.topics?.some(topic => (topicFrequency.get(topic) || 0) > 1) || false;
    const hasCommonKeywords = q.keywords?.some(keyword => (keywordFrequency.get(keyword) || 0) > 1) || false;

    // Check for tricky/common question indicators
    const trickyKeywords = ['prove', 'derive', 'show that', 'verify', 'demonstrate', 'calculate', 'solve', 'find', 'determine', 'evaluate', 'compute', 'obtain'];
    const isTricky = trickyKeywords.some(keyword => q.text.toLowerCase().includes(keyword));

    // Get similarity score (how many other questions share topics/keywords)
    const similarityScore = questionSimilarity.get(q.id) || 0;

    // A question is common if:
    // 1. It has common topics/keywords (appears in multiple contexts) - similarityScore > 0
    // 2. It's a tricky question (has problem-solving keywords)
    // 3. It has multiple topics/keywords (well-categorized) and appears in at least 2 contexts
    return similarityScore > 0 || isTricky || ((q.topics?.length || 0) + (q.keywords?.length || 0) >= 3 && (hasCommonTopics || hasCommonKeywords));
  });

  // If no common questions found, return all questions (fallback)
  if (commonQuestions.length === 0) {
    return questions;
  }

  return commonQuestions;
}

/**
 * Extract common topics across multiple questions
 */
function extractCommonTopics(questions: Question[]): QuestionTopic[] {
  // Initialize topics map
  const topicsMap = new Map<string, { count: number, questions: string[] }>();

  // Process topics from each question
  questions.forEach(question => {
    // Process explicit topics if available
    if (question.topics && question.topics.length > 0) {
      question.topics.forEach(topic => {
        if (!topicsMap.has(topic)) {
          topicsMap.set(topic, { count: 0, questions: [] });
        }

        const topicData = topicsMap.get(topic)!;
        topicData.count += 1;
        topicData.questions.push(question.id);
      });
    }
    // Otherwise use keywords
    else if (question.keywords && question.keywords.length > 0) {
      question.keywords.forEach(keyword => {
        if (!topicsMap.has(keyword)) {
          topicsMap.set(keyword, { count: 0, questions: [] });
        }

        const topicData = topicsMap.get(keyword)!;
        topicData.count += 1;
        topicData.questions.push(question.id);
      });
    }
  });

  // Convert map to array and sort by frequency
  const topicsArray: QuestionTopic[] = Array.from(topicsMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      questions: data.questions
    }))
    .filter(topic => topic.count > 1) // Only include topics that appear in multiple questions
    .sort((a, b) => b.count - a.count) // Sort by count (descending)
    .slice(0, 10); // Limit to top 10 topics

  return topicsArray;
}
