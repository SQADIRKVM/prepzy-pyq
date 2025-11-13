/**
 * Service for searching and fetching question papers from KTU DSpace repository
 */

export interface QuestionPaper {
  id: string;
  title: string;
  subjectCode: string;
  year: string;
  semester?: string;
  branch?: string;
  university?: string;
  examType?: string;
  paperType?: string; // Board Exam, University Exam, Entrance Exam, Competitive Exam, International Exam
  state?: string; // For state board exams
  country?: string; // For foreign/international exams
  pdfUrl: string;
  detailUrl: string;
  type?: string; // Deprecated, use paperType instead
}

export interface SearchFilters {
  subject?: string;
  year?: string;
  semester?: string;
  keyword?: string;
}

const KTU_BASE_URL = 'http://202.88.225.92';

/**
 * Extract university/exam type from title or URL - fully dynamic detection
 * No hardcoded values - extracts from actual source URL, paper title, and content
 * Supports: Universities, Board Exams (by state), Foreign Exams, Competitive Exams
 */
function extractUniversityOrExamType(title: string, url: string): { university?: string; examType?: string; paperType?: string; state?: string; country?: string } {
  const lowerTitle = title.toLowerCase();
  const lowerUrl = url.toLowerCase();
  const combinedText = `${lowerTitle} ${lowerUrl}`;
  
  let university: string | undefined;
  let examType: string | undefined;
  let state: string | undefined;
  let country: string | undefined;
  
  // Extract from URL domain/hostname dynamically
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check if it's an IP address (e.g., 202.88.225.92)
    const isIP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
    
    if (!isIP) {
      // Extract from domain (e.g., ktu.ac.in -> KTU, dspace.ktu.ac.in -> KTU)
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        // Get main domain part (usually the first or second part)
        const mainDomain = domainParts.find(part => 
          part.length >= 2 && 
          part.length <= 15 && 
          !['www', 'dspace', 'xmlui', 'www2', 'www3', 'edu', 'ac', 'org', 'com'].includes(part)
        ) || domainParts[0];
        
        if (mainDomain && mainDomain.length >= 2) {
          // Convert to uppercase for common abbreviations
          if (mainDomain.length <= 6) {
            university = mainDomain.toUpperCase();
          } else {
            // Format longer domain names
            university = mainDomain
              .split(/[-_]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
          }
        }
        
        // Extract country from TLD
        const tld = domainParts[domainParts.length - 1];
        if (tld && tld.length === 2) {
          // Common country codes
          const countryMap: Record<string, string> = {
            'in': 'India', 'us': 'USA', 'uk': 'UK', 'au': 'Australia',
            'ca': 'Canada', 'de': 'Germany', 'fr': 'France', 'jp': 'Japan',
            'cn': 'China', 'sg': 'Singapore', 'ae': 'UAE', 'sa': 'Saudi Arabia'
          };
          country = countryMap[tld] || tld.toUpperCase();
        }
      }
    }
    // If IP address, rely on title extraction below
  } catch {
    // If URL parsing fails, continue with text analysis
  }
  
  // Extract state name for board exams (dynamic - any state)
  const stateMatch = combinedText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:state|board|syllabus|hse)\b/i);
  if (stateMatch) {
    const stateName = stateMatch[1].trim();
    if (stateName.length >= 3 && stateName.length <= 30) {
      state = stateName
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
  
  // Extract university from title using general patterns (not hardcoded names)
  // Look for "University of X", "X University", "X College", "X Institute"
  // Also look for common abbreviations like KTU, IIT, NIT in the title
  const univPatterns = [
    /(?:university\s+of\s+|^)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+university/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+university/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+college/gi,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+institute/gi,
    /\b([A-Z]{2,10})\b(?=.*(?:university|college|institute|exam|paper|ktu|dspace))/gi, // Abbreviations like KTU, IIT, NIT
  ];
  
  // First try to find university abbreviations (KTU, IIT, NIT, etc.) in title
  if (!university) {
    const abbrMatch = title.match(/\b([A-Z]{2,6})\b/i);
    if (abbrMatch) {
      const abbr = abbrMatch[1].toUpperCase();
      // Check if it's a known university abbreviation pattern (not a year or subject code)
      if (!/^(19|20)\d{2}$/.test(abbr) && // Not a year
          !/^[A-Z]{2,4}\d{3,4}$/.test(abbr) && // Not a subject code
          abbr.length >= 2 && abbr.length <= 6) {
        // Check if title contains university-related keywords
        if (lowerTitle.includes('ktu') || lowerTitle.includes('kerala') || 
            lowerTitle.includes('university') || lowerTitle.includes('dspace') ||
            lowerTitle.includes('technological')) {
          university = abbr;
        }
      }
    }
  }
  
  // Then try full university name patterns
  for (const pattern of univPatterns) {
    const match = title.match(pattern);
    if (match && !university) {
      const extracted = match[0]
        .replace(/\b(university|college|institute|of|the)\b/gi, '')
        .trim();
      if (extracted.length >= 2 && extracted.length <= 30) {
        university = extracted
          .split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        break;
      }
    }
  }
  
  // Special case: If URL contains KTU DSpace or title mentions KTU/Kerala Technological
  // Also check if it's from KTU DSpace repository (IP address 202.88.225.92)
  if (!university) {
    if (lowerUrl.includes('ktu') || lowerUrl.includes('202.88.225.92') || 
        lowerTitle.includes('ktu') || lowerTitle.includes('kerala technological') || 
        lowerTitle.includes('apj abdul kalam') || lowerTitle.includes('dspace')) {
      university = 'KTU';
    }
  }
  
  // Common words to filter out (not exam abbreviations)
  const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE'];
  
  // Extract exam type from title using general patterns - fully dynamic
  // Look for exam abbreviations (2-8 uppercase letters) near exam-related keywords
  const examAbbrMatch = combinedText.match(/\b([A-Z]{2,8})\b(?=.*(?:exam|entrance|test|paper|question|board|admission|competitive))/i);
  if (examAbbrMatch && !examType) {
    const abbr = examAbbrMatch[1].toUpperCase();
    // Only use if it's a reasonable exam abbreviation (not common words)
    if (!commonWords.includes(abbr) && abbr.length >= 2 && abbr.length <= 8) {
      examType = abbr;
    }
  }
  
  // Extract full exam names dynamically (e.g., "Joint Entrance Exam" -> "JEE")
  // Also catches foreign exams like "Scholastic Assessment Test" -> "SAT"
  const fullExamMatch = combinedText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:entrance|exam|test|board|assessment|aptitude)/i);
  if (fullExamMatch && !examType) {
    const examName = fullExamMatch[1];
    // Extract first letters of each word to form abbreviation
    const abbr = examName
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    if (abbr.length >= 2 && abbr.length <= 8) {
      examType = abbr;
    } else if (examName.length <= 30) {
      examType = examName;
    }
  }
  
  // Extract foreign/international exam types dynamically (no hardcoded list)
  // Look for exam abbreviations that appear with international/foreign keywords
  if (!examType && combinedText.match(/\b(international|foreign|global|overseas)\b/i)) {
    const foreignExamMatch = combinedText.match(/\b([A-Z]{2,8})\b(?=.*(?:international|foreign|global|overseas))/i);
    if (foreignExamMatch) {
      const abbr = foreignExamMatch[1].toUpperCase();
      if (abbr.length >= 2 && abbr.length <= 8 && !commonWords.includes(abbr)) {
        examType = abbr;
        if (!country) {
          country = 'Foreign';
        }
      }
    }
  }
  
  // Paper type detection (dynamic based on keywords)
  let paperType: string | undefined;
  
  if (combinedText.match(/\b(board\s+exam|hse|higher\s+secondary|secondary\s+school|board\s+paper|state\s+board)\b/i)) {
    paperType = 'Board Exam';
  } else if (combinedText.match(/\b(entrance\s+exam|admission\s+test|competitive\s+exam|entrance\s+test)\b/i)) {
    paperType = 'Entrance Exam';
  } else if (combinedText.match(/\b(university\s+exam|semester\s+exam|degree\s+exam|b\.?\s*tech|m\.?\s*tech|bachelor|master|graduation)\b/i)) {
    paperType = 'University Exam';
  } else if (combinedText.match(/\b(competitive\s+exam|recruitment\s+exam|public\s+service|government\s+exam)\b/i)) {
    paperType = 'Competitive Exam';
  } else if (combinedText.match(/\b(international|foreign|sat|gre|toefl|ielts)\b/i)) {
    paperType = 'International Exam';
  }
  
  // Format exam type with state if it's a board exam
  if (paperType === 'Board Exam' && state && !examType) {
    examType = `${state} Board`;
  }
  
  // Return only what we actually detected (no defaults, no hardcoded values)
  return { 
    university: university || undefined,
    examType: examType || undefined,
    paperType: paperType || undefined,
    state: state || undefined,
    country: country || undefined
  };
}

/**
 * Extract branch from subject code
 * CS -> CSE, EC -> ECE, EE -> EEE, ME -> ME, etc.
 */
function extractBranchFromSubjectCode(subjectCode: string): string | undefined {
  const code = subjectCode.toUpperCase();
  
  // Common KTU subject code patterns
  const branchMap: Record<string, string> = {
    'CS': 'CSE',
    'EC': 'ECE',
    'EE': 'EEE',
    'ME': 'ME',
    'CE': 'CE',
    'AE': 'AE',
    'IT': 'IT',
    'BT': 'BT',
    'CH': 'CH',
    'PH': 'PH',
    'MA': 'MA',
    'HS': 'HS',
    'CY': 'CY'
  };
  
  // Extract first 2-3 letters
  const prefix = code.substring(0, 2);
  if (branchMap[prefix]) {
    return branchMap[prefix];
  }
  
  // Try 3 letters for some codes
  const prefix3 = code.substring(0, 3);
  if (branchMap[prefix3]) {
    return branchMap[prefix3];
  }
  
  return undefined;
}

/**
 * Extract PDF URL from KTU DSpace detail page
 */
async function getPdfLink(detailUrl: string): Promise<string | null> {
  try {
    // Use proxy to avoid CORS issues
    const proxyUrl = import.meta.env.PROD 
      ? `/api/proxy?url=${encodeURIComponent(detailUrl)}`
      : `http://localhost:3001/api/proxy?url=${encodeURIComponent(detailUrl)}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch detail page: ${response.status}`);
      return null;
    }
    
    const html = await response.text();
    
    // Parse HTML to find PDF link (look for bitstream links)
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find PDF links - KTU DSpace uses bitstream URLs
    // Try multiple selectors
    const selectors = [
      'a[href*="bitstream"][href*=".pdf"]',
      'a[href*="bitstream"]',
      'a[href$=".pdf"]',
      'a[href*=".pdf"]',
      'a.download-link',
      'a[title*="PDF"]',
      'a[title*="pdf"]'
    ];
    
    for (const selector of selectors) {
      const links = doc.querySelectorAll(selector);
      for (const link of links) {
        const href = link.getAttribute('href');
        if (href) {
          // Check if it's a PDF link
          if (href.includes('.pdf') || href.includes('bitstream')) {
            // Construct full URL
            if (href.startsWith('http')) {
              return href;
            }
            const fullUrl = `${KTU_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
            console.log('Found PDF URL:', fullUrl);
            return fullUrl;
          }
        }
      }
    }
    
    // Also check for download buttons or links with specific text
    const downloadLinks = doc.querySelectorAll('a');
    for (const link of downloadLinks) {
      const text = link.textContent?.toLowerCase() || '';
      const href = link.getAttribute('href');
      if (href && (text.includes('download') || text.includes('pdf') || text.includes('view'))) {
        if (href.includes('bitstream') || href.includes('.pdf')) {
          if (href.startsWith('http')) {
            return href;
          }
          return `${KTU_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching PDF link:', error);
    return null;
  }
}

/**
 * Search for question papers by subject code
 */
export async function searchPapers(
  subjectCode: string,
  filters?: SearchFilters
): Promise<QuestionPaper[]> {
  if (!subjectCode || subjectCode.trim() === '') {
    return [];
  }

  const searchUrl = `${KTU_BASE_URL}/xmlui/simple-search?query=${encodeURIComponent(subjectCode)}`;
  
  try {
    // Use proxy to avoid CORS issues
    const proxyUrl = import.meta.env.PROD 
      ? `/api/proxy?url=${encodeURIComponent(searchUrl)}`
      : `http://localhost:3001/api/proxy?url=${encodeURIComponent(searchUrl)}`;
    
    console.log('Fetching from proxy:', proxyUrl);
    
    const response = await fetch(proxyUrl, { 
      cache: 'no-store',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to fetch search results for ${subjectCode}, status: ${response.status}`, errorText);
      
      // If it's a JSON error response, try to parse it
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Proxy error details:', errorJson);
      } catch (e) {
        // Not JSON, ignore
      }
      
      return [];
    }

    const html = await response.text();
    
    // Debug: Log HTML length and first 500 chars
    console.log('HTML response length:', html.length);
    console.log('HTML preview:', html.substring(0, 500));
    
    // Parse HTML to extract paper information
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Try multiple selectors to find paper links
    // KTU DSpace might use different structures
    const selectors = [
      'div.artifact-title a',
      '.artifact-title a',
      'a[href*="/handle/"]',
      'a[href*="/xmlui/handle/"]',
      'table a[href*="handle"]',
      '.item-title a',
      'h4 a',
      'h3 a',
      'td a[href*="handle"]'
    ];
    
    let items: NodeListOf<Element> | null = null;
    for (const selector of selectors) {
      items = doc.querySelectorAll(selector);
      if (items.length > 0) {
        console.log(`Found ${items.length} items using selector: ${selector}`);
        break;
      }
    }
    
    if (!items || items.length === 0) {
      console.warn('No items found with any selector. Available links:', doc.querySelectorAll('a').length);
      // Log some sample links for debugging
      const allLinks = doc.querySelectorAll('a');
      console.log('Sample links:', Array.from(allLinks).slice(0, 5).map(a => ({
        text: a.textContent?.trim(),
        href: a.getAttribute('href')
      })));
      return [];
    }
    
    const results: QuestionPaper[] = [];

    for (const item of Array.from(items)) {
      const title = item.textContent?.trim() || '';
      const href = item.getAttribute('href');
      
      if (!href || !title || title.length < 5) continue;
      
      // Skip navigation and non-paper links
      if (href.includes('#') || href.includes('javascript:') || href.startsWith('mailto:')) {
        continue;
      }
      
      const detailUrl = href.startsWith('http') ? href : `${KTU_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      
      // Extract year from title if possible
      const yearMatch = title.match(/\b(20\d{2})\b/);
      const year = yearMatch ? yearMatch[1] : 'Unknown';
      
      // Extract semester if mentioned in title
      const semesterMatch = title.match(/\b(S[1-8]|Semester\s*[1-8])\b/i);
      let semester = semesterMatch ? semesterMatch[0].replace(/semester\s*/i, 'S').replace(/^S/i, 'S') : undefined;
      
      // If semester not found in title, try to infer from subject code pattern
      // KTU codes format: CS301 = CS (branch) + 3 (semester) + 01 (course number)
      // So the 3rd character (index 2) is the semester number
      if (!semester && subjectCode.length >= 3) {
        const semesterNum = parseInt(subjectCode.charAt(2));
        if (semesterNum >= 1 && semesterNum <= 8) {
          semester = `S${semesterNum}`;
        }
      }
      
      // Extract branch from subject code
      const branch = extractBranchFromSubjectCode(subjectCode);
      
      // Extract university/exam type and paper type dynamically
      let { university, examType, paperType, state, country } = extractUniversityOrExamType(title, detailUrl);
      
      // Fallback: If no university detected and we're searching KTU DSpace, set it
      if (!university && detailUrl.includes(KTU_BASE_URL)) {
        university = 'KTU';
      }
      
      // No fallback for paperType - must be detected dynamically from content
      
      // Get PDF URL - but don't wait for all of them, process in parallel
      results.push({
        id: detailUrl, // Use detail URL as temporary ID
        title: title,
        subjectCode: subjectCode.toUpperCase(),
        year: year,
        semester: semester,
        branch: branch,
        university: university,
        examType: examType,
        paperType: paperType,
        state: state,
        country: country,
        pdfUrl: '', // Will be filled later
        detailUrl: detailUrl,
        type: paperType, // For backward compatibility (no default)
      });
    }
    
    console.log(`Found ${results.length} potential papers, fetching PDF URLs...`);
    
    // Fetch PDF URLs for all papers in parallel (with limit)
    const pdfPromises = results.slice(0, 20).map(async (paper, index) => {
      try {
        const pdfUrl = await getPdfLink(paper.detailUrl);
        if (pdfUrl) {
          return { ...paper, id: pdfUrl, pdfUrl };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching PDF for ${paper.title}:`, error);
        return null;
      }
    });
    
    const papersWithPdfs = await Promise.all(pdfPromises);
    const validPapers = papersWithPdfs.filter(p => p !== null) as QuestionPaper[];
    
    console.log(`Successfully fetched ${validPapers.length} papers with PDFs`);

    // Apply additional filters if provided
    let filteredResults = validPapers;
    
    if (filters?.year && filters.year !== 'all') {
      filteredResults = filteredResults.filter(p => p.year === filters.year);
    }
    
    if (filters?.semester && filters.semester !== 'all') {
      filteredResults = filteredResults.filter(p => 
        p.semester?.toLowerCase().includes(filters.semester!.toLowerCase())
      );
    }
    
    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filteredResults = filteredResults.filter(p =>
        p.title.toLowerCase().includes(keyword)
      );
    }

    return filteredResults;
  } catch (error) {
    console.error(`Error in searchPapers for ${subjectCode}:`, error);
    return [];
  }
}

/**
 * Fetch PDF as File object for processing
 */
export async function fetchPaperAsFile(paper: QuestionPaper): Promise<File> {
  try {
    // Use proxy to fetch PDF
    const proxyUrl = import.meta.env.PROD 
      ? `/api/proxy?url=${encodeURIComponent(paper.pdfUrl)}`
      : `http://localhost:3001/api/proxy?url=${encodeURIComponent(paper.pdfUrl)}`;
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const fileName = `${paper.subjectCode}_${paper.year}_${paper.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    
    return new File([blob], fileName, { type: 'application/pdf' });
  } catch (error) {
    console.error('Error fetching paper as file:', error);
    throw error;
  }
}

