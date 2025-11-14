// Notes Search Service for KTU Notes

export interface Note {
  id: string;
  title: string;
  subjectCode: string;
  semester?: string;
  branch?: string;
  scheme?: string;
  module?: string;
  pdfUrl: string;
  detailUrl: string;
  source: string;
}

export interface SearchFilters {
  semester?: string;
  branch?: string;
  scheme?: string;
}

const NOTES_REPOSITORIES = {
  'KTUNotes.in': {
    baseUrl: 'https://www.ktunotes.in',
    schemes: {
      '2024': 'https://www.ktunotes.in/ktu-2024-scheme-notes/',
      '2019': 'https://www.ktunotes.in/ktu-2019-new-scheme-notes/',
      '2015': 'https://www.ktunotes.in/ktu-2015-scheme-notes/'
    }
  },
  'RTPNotes': {
    baseUrl: 'https://rtpnotes.vercel.app',
    semesters: {
      '5': 'https://rtpnotes.vercel.app/s5',
      '6': 'https://rtpnotes.vercel.app/s6',
      '7': 'https://rtpnotes.vercel.app/s7',
      '8': 'https://rtpnotes.vercel.app/s8'
    }
  }
};

/**
 * Infer semester from subject code (KTU pattern)
 * 
 * KTU codes follow: [BRANCH][YEAR][0-9][ODD/EVEN]
 * - First digit = YEAR (1-4)
 * - Last digit = Odd/Even indicator
 *   - Odd (1,3,5,7) → Odd semesters (S1, S3, S5, S7)
 *   - Even (0,2,4,6,8) → Even semesters (S2, S4, S6, S8)
 * 
 * Examples:
 * - MAT101: Year=1, Last=1(odd) → S1
 * - MAT203: Year=2, Last=3(odd) → S3
 * - CST201: Year=2, Last=1(odd) → S3
 * - PHY102: Year=1, Last=2(even) → S2
 */
function inferSemesterFromSubjectCode(code: string): string | null {
  if (!code) return null;
  
  // Extract the number part (e.g., CS301 -> 301, MAT203 -> 203)
  const numMatch = code.match(/\d{3,4}/);
  if (!numMatch) return null;
  
  const numStr = numMatch[0];
  if (numStr.length < 3) return null;
  
  const year = parseInt(numStr.charAt(0)); // First digit = year (1-4)
  const lastDigit = parseInt(numStr.charAt(numStr.length - 1)); // Last digit
  
  if (year < 1 || year > 4) return null;
  
  // Check if odd or even semester based on last digit
  const isOddSemester = lastDigit % 2 === 1;
  
  if (isOddSemester) {
    // Odd semesters: S1, S3, S5, S7
    return String((year * 2) - 1);
  } else {
    // Even semesters: S2, S4, S6, S8
    return String(year * 2);
  }
}

/**
 * Extract branch from subject code
 * Returns undefined for common subjects (MAT, PHY, etc.)
 */
function extractBranchFromSubjectCode(subjectCode: string): string | undefined {
  const code = subjectCode.toUpperCase();
  
  // Common subjects (not branch-specific) - return undefined to search all branches
  const commonPrefixes = ['MAT', 'PHY', 'CHE', 'HUM', 'EST', 'HUT', 'MCN', 'GE'];
  for (const prefix of commonPrefixes) {
    if (code.startsWith(prefix)) {
      return undefined;
    }
  }
  
  const branchMap: Record<string, string> = {
    'CS': 'CSE',
    'CST': 'CSE',
    'EC': 'ECE',
    'ECT': 'ECE',
    'EE': 'EEE',
    'ME': 'ME',
    'MEC': 'ME',
    'CE': 'CE',
    'CET': 'CE',
    'AE': 'AE',
    'IT': 'IT',
    'BT': 'BT'
  };
  
  const prefix = code.substring(0, 2);
  if (branchMap[prefix]) return branchMap[prefix];
  
  const prefix3 = code.substring(0, 3);
  if (branchMap[prefix3]) return branchMap[prefix3];
  
  return undefined;
}

/**
 * Extract subject code from text
 */
function extractSubjectCode(text: string): string | null {
  const match = text.toUpperCase().match(/\b[A-Z]{2,4}\d{3,4}\b/);
  return match ? match[0] : null;
}

type NoteIntent = 'preview' | 'download';

/**
 * Extract Google Drive file ID from various URL formats
 */
function extractGoogleDriveFileId(url: string): string | null {
  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileIdMatch) return fileIdMatch[1];

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  const openMatch = url.match(/\/open\?[^#?]*id=([a-zA-Z0-9_-]+)/);
  if (openMatch) return openMatch[1];

  return null;
}

/**
 * Normalize Google Drive links for preview or download
 */
function convertGoogleDriveLink(url: string, intent: NoteIntent = 'preview'): string {
  if (!url.includes('drive.google.com')) return url;

  const fileId = extractGoogleDriveFileId(url);
  if (!fileId) return url;

  if (intent === 'preview') {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  // Download intent
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Build proxied URL for preview/download intents
 */
export function getNoteProxyUrl(pdfUrl: string, intent: NoteIntent = 'preview'): string {
  const normalizedUrl = convertGoogleDriveLink(pdfUrl, intent);
  
  // Check if it's a GitHub raw URL
  const isGitHubRaw = (normalizedUrl.includes('github.com') && normalizedUrl.includes('/raw/')) || 
                       normalizedUrl.includes('raw.githubusercontent.com');
  
  // For Google Drive preview URLs, use them directly (no proxy needed)
  // Google Drive preview URLs are designed to be embedded and work fine in iframes
  if (intent === 'preview' && normalizedUrl.includes('drive.google.com') && normalizedUrl.includes('/preview')) {
    return normalizedUrl;
  }
  
  // For GitHub raw URLs in preview mode, use Google Docs Viewer
  // This is the simplest and most reliable way to display GitHub PDFs in iframes
  if (intent === 'preview' && isGitHubRaw) {
    const encodedUrl = encodeURIComponent(normalizedUrl);
    return `https://docs.google.com/viewer?url=${encodedUrl}&embedded=true`;
  }
  
  // For downloads and other URLs, use proxy
  const encoded = encodeURIComponent(normalizedUrl);

  if (typeof window !== 'undefined') {
    if (import.meta.env.PROD) {
      return `/api/proxy?url=${encoded}&intent=${intent}`;
    }
    return `http://localhost:3001/api/proxy?url=${encoded}&intent=${intent}`;
  }

  // Fallback (should not occur on client) - return normalized URL
  return normalizedUrl;
}

/**
 * Find all note page links from HTML
 */
function findAllNotePageLinks(html: string, baseUrl: string): string[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const links: string[] = [];
  
  const allLinks = doc.querySelectorAll('a[href]');
  
  allLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    let fullUrl: string;
    try {
      if (href.startsWith('http')) {
        fullUrl = href;
      } else if (href.startsWith('//')) {
        fullUrl = `https:${href}`;
      } else {
        fullUrl = new URL(href, baseUrl).href;
      }
    } catch {
      return;
    }
    
    const urlLower = fullUrl.toLowerCase();
    
    // Match ANY link that looks like a note page:
    // EXAMPLES of what we WANT to match:
    // ✅ /ktu-mat203-discrete-mathematical-structures/
    // ✅ /ktu-cst201-data-structures/
    // ✅ /ktu-cs301-theory-of-computation/
    // ✅ /ktu-discrete-mathematical-structures-mat203-notes/
    // ✅ /ktu-data-structures-cst201-notes/
    //
    // EXAMPLES of what we DON'T want:
    // ❌ /ktu-2024-scheme-notes/ (scheme page)
    // ❌ /ktu-s1-notes-2019-scheme/ (semester index)
    // ❌ /ktu-s3-cse-notes-2019-scheme/ (branch index)
    
    // EXCLUDE these patterns (NOT note pages):
    const isExcluded = urlLower.includes('scheme-notes') ||
                       urlLower.includes('syllabus') ||
                       urlLower.includes('/tag/') ||
                       urlLower.includes('question-papers') ||
                       urlLower.includes('lab-materials') ||
                       urlLower.includes('solved-questions') ||
                       urlLower.match(/\/ktu-s[1-8]-notes-\d{4}/) ||
                       urlLower.match(/\/ktu-s[1-8]-(cse|ece|eee|me|ce|it|civil|mech)-notes-\d{4}/);
    
    // INCLUDE only pages that look like actual subject pages
    // Must have /ktu- AND either:
    // 1. A subject code pattern (e.g., ec301, cst201, mat203)
    // 2. Or end with specific subject keywords + "-notes"
    const hasSubjectCode = /[a-z]{2,4}\d{3,4}/.test(urlLower);
    const hasNotesKeyword = urlLower.includes('-notes') && !urlLower.includes('-notes-20'); // Not scheme index
    
    const isNotePage = urlLower.includes('ktunotes.in') && 
                       urlLower.includes('/ktu-') &&
                       !isExcluded &&
                       (hasSubjectCode || hasNotesKeyword) &&
                       fullUrl.split('/').length >= 4; // Has actual path
    
    if (isNotePage && !links.includes(fullUrl)) {
      links.push(fullUrl);
    }
  });
  
  return links;
}

/**
 * Extract notes (PDFs) from individual note page
 */
async function extractNotesFromPage(url: string, scheme: string, searchTerm: string): Promise<Note[]> {
  try {
    console.log(`[extractNotesFromPage] Fetching: ${url.substring(0, 80)}...`);
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    
    if (!response.ok) {
      console.warn(`[extractNotesFromPage] Failed to fetch ${url}: ${response.status}`);
      return [];
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extract title and subject code
    const titleEl = doc.querySelector('h1, .entry-title, .post-title, title');
    const pageTitle = titleEl?.textContent?.trim() || 'KTU Notes';
    const subjectCode = extractSubjectCode(pageTitle) || extractSubjectCode(url) || 'Unknown';
    
    const notes: Note[] = [];
    
    // Find all links that might be PDFs or downloadable files
    const allLinks = doc.querySelectorAll('a[href]');
    
    allLinks.forEach((link, index) => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      let fullUrl: string;
      try {
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('//')) {
          fullUrl = `https:${href}`;
        } else {
          fullUrl = new URL(href, url).href;
        }
      } catch {
        return;
      }
      
      // Check if it's a downloadable file
      const isFile = fullUrl.endsWith('.pdf') ||
                     fullUrl.endsWith('.doc') ||
                     fullUrl.endsWith('.docx') ||
                     fullUrl.endsWith('.zip') ||
                     fullUrl.includes('drive.google.com');
      
      if (isFile) {
        const finalUrl = convertGoogleDriveLink(fullUrl);
        const linkText = link.textContent?.trim() || '';
        
        // Extract module number
        const moduleMatch = linkText.match(/\b(module|mod|set)\s*([1-6])\b/i) ||
                           fullUrl.match(/[Mm]odule[_\s-]?([1-6])/);
        const moduleNum = moduleMatch ? moduleMatch[2] || moduleMatch[1] : null;
        
        const note: Note = {
          id: `${Date.now()}-${index}-${Math.random()}`,
          title: linkText ? `${pageTitle} - ${linkText}` : (moduleNum ? `${pageTitle} - Module ${moduleNum}` : pageTitle),
          subjectCode: subjectCode,
          semester: inferSemesterFromSubjectCode(subjectCode) || undefined,
          branch: extractBranchFromSubjectCode(subjectCode),
          scheme: scheme,
          module: moduleNum || undefined,
          pdfUrl: finalUrl,
          detailUrl: url,
          source: 'KTUNotes.in'
        };
        
        notes.push(note);
      }
    });
    
    console.log(`[extractNotesFromPage] Extracted ${notes.length} notes from ${url.substring(0, 60)}...`);
    return notes;
    
  } catch (error) {
    console.error(`[extractNotesFromPage] Error fetching ${url}:`, error);
    return [];
  }
}

/**
 * Subject code to subject name mapping for RTPNotes (CSE S5-S8)
 * Based on actual subjects listed on rtpnotes.vercel.app and official KTU syllabus
 */
const RTPNOTES_SUBJECT_MAPPING: Record<string, string[]> = {
  // Semester 5
  'CST301': ['formal languages', 'automata theory', 'automata', 'flat', 'toc', 'theory of computation'],
  'CST303': ['computer network', 'computer networks', 'cn', 'networks'],
  'CST305': ['system software', 'systems software', 'ss'],
  'CST307': ['mpmc', 'microprocessors', 'microprocessor', 'microcontrollers', 'microcontroller'],
  'CST309': ['mss', 'management of software systems', 'management support systems', 'management', 'software systems'],
  'MCN301': ['disaster management', 'disaster'],
  'CSL331': ['system software lab', 'microprocessors lab', 'ss and mpmc lab'],
  'CSL333': ['database management systems lab', 'dbms lab', 'database lab'],
  
  // Semester 6
  'CST302': ['compiler', 'compiler design', 'cd'],
  'CST304': ['computer-graphic', 'computer graphics', 'cg', 'graphics', 'image processing'],
  'CST306': ['algorithm-analysis', 'algorithm', 'algorithms', 'algorithm analysis and design', 'design and analysis of algorithms', 'daa'],
  'CST322': ['data analytics', 'analytics'],
  'CST332': ['foundations of security', 'security in computing', 'security'],
  'CST342': ['automated verification', 'verification'],
  'CST352': ['ia32 architecture', 'architecture'],
  'CST362': ['python', 'python programming', 'programming in python'],
  'CST372': ['data and computer communication', 'computer communication', 'data communication'],
  'HUT300': ['industrial-economic', 'industrial economics', 'foreign trade', 'economics'],
  'CST308': ['comprehensive', 'comprehensive course work', 'comprehensive exam'],
  'CSL332': ['computer-network-lab', 'computer network lab', 'networking lab', 'cn lab', 'networks lab'],
  'CSD334': ['miniproject', 'mini project'],
  
  // Semester 7
  'CST401': ['ai', 'artificial intelligence', 'intelligence'],
  'CST413': ['machine learning', 'ml'],
  'CST423': ['cloud computing', 'cloud'],
  'CST433': ['security in computing', 'security'],
  'CST443': ['model based software development', 'model based software', 'software development'],
  'CST453': ['advanced topics in ia32 architecture', 'ia32 architecture', 'architecture'],
  'CST463': ['web-programming', 'web programming', 'web', 'web technologies', 'wt'],
  'CST473': ['natural language processing', 'nlp'],
  'CST421': ['mobile computing', 'introduction to mobile computing'],
  'CST425': ['deep learning', 'introduction to deep learning', 'dl', 'neural networks'],
  'CST435': ['computer graphics', 'cg', 'graphics'],
  'CST445': ['python for engineers', 'python'],
  'CST455': ['object oriented concepts', 'object oriented', 'ooc', 'oop'],
  'MCN401': ['industrial-safety', 'industrial safety engineering', 'industrial safety', 'safety'],
  'CSL411': ['compiler lab', 'compiler'],
  'CSQ413': ['seminar'],
  'CSD415': ['project', 'miniproject'],
  
  // Semester 8
  'CST402': ['distributed-computing', 'distributed computing', 'dc', 'distributed'],
  'CST412': ['deep-learning', 'deep learning', 'dl', 'neural networks'],
  'CST424': ['programming paradigms', 'paradigms'],
  'CST434': ['cryptography', 'crypto'],
  'CST444': ['soft computing', 'soft computing techniques'],
  'CST454': ['fuzzy set theory', 'fuzzy set theory and applications', 'fuzzy'],
  'CST464': ['embedded systems', 'embedded'],
  'CST474': ['computer vision', 'vision'],
  'CST414': ['formal methods', 'formal methods and tools in software engineering', 'software engineering'],
  'CST426': ['client server architecture', 'client server', 'csa'],
  'CST436': ['parallel computing', 'parallel'],
  'CST446': ['data compression', 'data compression techniques', 'compression'],
  'CST456': ['unified extended firmware interface', 'uefi', 'firmware'],
  'CST466': ['data-mining', 'data mining', 'mining'],
  'CST476': ['mobile computing', 'mobile'],
  'CST418': ['high performance computing', 'hpc', 'performance computing'],
  'CST428': ['block chain', 'blockchain technologies', 'blockchain', 'block chain'],
  'CST438': ['image processing', 'image processing technique', 'image processing techniques'],
  'CST448': ['internet of things', 'iot'],
  'CST458': ['software-testing', 'software testing', 'testing'],
  'CST468': ['bioinformatics', 'bio'],
  'CST478': ['computational linguistics', 'linguistics'],
  'CST404': ['comprehensive course viva', 'comprehensive viva', 'viva'],
  'CSD416': ['project phase ii', 'project phase 2', 'project'],
};

/**
 * Get subject name from subject code for RTPNotes
 */
function getSubjectNameFromCode(subjectCode: string): string[] | null {
  const code = subjectCode.toUpperCase();
  return RTPNOTES_SUBJECT_MAPPING[code] || null;
}

/**
 * Check if link text matches subject name
 */
function matchesSubjectName(linkText: string, subjectNames: string[]): boolean {
  const textLower = linkText.toLowerCase();
  return subjectNames.some(name => textLower.includes(name.toLowerCase()));
}

/**
 * Search RTPNotes by semester (S5-S8 for CSE) with optional subject code filter
 */
async function searchRTPNotes(semester: string, subjectCode?: string): Promise<Note[]> {
  const semesterNum = semester.replace(/[^5-8]/, '');
  if (!semesterNum || !['5', '6', '7', '8'].includes(semesterNum)) {
    return [];
  }

  const semesterUrl = NOTES_REPOSITORIES['RTPNotes'].semesters[semesterNum as '5' | '6' | '7' | '8'];
  if (!semesterUrl) return [];

  // Get subject names if subject code provided
  const subjectNames = subjectCode ? getSubjectNameFromCode(subjectCode) : null;
  const searchSubjectCode = subjectCode ? subjectCode.toUpperCase() : null;
  
  try {
    const searchInfo = searchSubjectCode 
      ? `RTPNotes Semester ${semesterNum} for ${searchSubjectCode}`
      : `RTPNotes Semester ${semesterNum}`;
    console.log(`[searchRTPNotes] 🔍 Searching ${searchInfo}: ${semesterUrl}`);
    
    // Step 1: Fetch semester page to find subject links
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(semesterUrl)}`;
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!response.ok) {
      console.log(`[searchRTPNotes] ⚠️ Failed to fetch: ${response.status}`);
      return [];
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const notes: Note[] = [];

    // Step 2: Find subject page links
    const subjectLinks: string[] = [];
    const allLinks = doc.querySelectorAll('a[href]');
    
    allLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      const linkText = link.textContent?.trim() || '';
      const combinedText = linkText.toLowerCase();
      
      let fullUrl: string;
      try {
        if (href.startsWith('http')) {
          fullUrl = href;
        } else if (href.startsWith('//')) {
          fullUrl = `https:${href}`;
        } else {
          fullUrl = new URL(href, semesterUrl).href;
        }
      } catch {
        return;
      }
      
      // If subject code provided, only add matching subject links
      if (searchSubjectCode && subjectNames) {
        if (matchesSubjectName(combinedText, subjectNames)) {
          // Check if it's not already a file link
          if (!fullUrl.match(/\.(pdf|doc|docx|zip)$/i) && !fullUrl.includes('drive.google.com')) {
            subjectLinks.push(fullUrl);
          }
        }
      } else {
        // No subject code - collect all subject page links (not file links)
        if (!fullUrl.match(/\.(pdf|doc|docx|zip)$/i) && 
            !fullUrl.includes('drive.google.com') &&
            fullUrl.includes('rtpnotes.vercel.app')) {
          subjectLinks.push(fullUrl);
        }
      }
    });

    // Step 3: Fetch each subject page and extract PDFs
    const pagesToFetch = searchSubjectCode && subjectLinks.length > 0 
      ? subjectLinks 
      : [semesterUrl]; // If no subject code or no matches, search semester page directly
    
    for (const pageUrl of pagesToFetch) {
      try {
        console.log(`[searchRTPNotes] 📄 Fetching subject page: ${pageUrl}`);
        
        const pageProxyUrl = `/api/proxy?url=${encodeURIComponent(pageUrl)}`;
        const pageResponse = await fetch(pageProxyUrl, {
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });

        if (!pageResponse.ok) {
          console.log(`[searchRTPNotes] ⚠️ Failed to fetch page: ${pageResponse.status}`);
          continue;
        }

        const pageHtml = await pageResponse.text();
        const pageDoc = parser.parseFromString(pageHtml, 'text/html');
        const pageLinks = pageDoc.querySelectorAll('a[href]');
        
        pageLinks.forEach((link, index) => {
          const href = link.getAttribute('href');
          if (!href) return;

          let fullUrl: string;
          try {
            if (href.startsWith('http')) {
              fullUrl = href;
            } else if (href.startsWith('//')) {
              fullUrl = `https:${href}`;
            } else {
              fullUrl = new URL(href, pageUrl).href;
            }
          } catch {
            return;
          }

          // Check if it's a downloadable file
          const isFile = fullUrl.endsWith('.pdf') ||
                         fullUrl.endsWith('.doc') ||
                         fullUrl.endsWith('.docx') ||
                         fullUrl.endsWith('.zip') ||
                         fullUrl.includes('drive.google.com') ||
                         fullUrl.includes('github.com') ||
                         fullUrl.includes('raw.githubusercontent.com');

          if (isFile) {
            const finalUrl = convertGoogleDriveLink(fullUrl, 'preview');
            const linkText = link.textContent?.trim() || '';
            
            // Use provided subject code
            const noteSubjectCode = searchSubjectCode || 'CSE';
            
            // Extract module number
            const moduleMatch = linkText.match(/\b(module|mod|set)\s*([1-6])\b/i) ||
                               fullUrl.match(/[Mm]odule[_\s-]?([1-6])/);
            const moduleNum = moduleMatch ? moduleMatch[2] || moduleMatch[1] : null;

            const note: Note = {
              id: `rtp-${semesterNum}-${Date.now()}-${index}-${Math.random()}`,
              title: linkText || `Semester ${semesterNum} Notes - ${noteSubjectCode}`,
              subjectCode: noteSubjectCode,
              semester: semesterNum,
              branch: 'CSE',
              scheme: '2019',
              module: moduleNum || undefined,
              pdfUrl: finalUrl,
              detailUrl: pageUrl,
              source: 'RTPNotes'
            };

            notes.push(note);
          }
        });
      } catch (error) {
        console.error(`[searchRTPNotes] Error fetching subject page ${pageUrl}:`, error);
      }
    }

    console.log(`[searchRTPNotes] ✅ Found ${notes.length} notes from RTPNotes S${semesterNum}${searchSubjectCode ? ` for ${searchSubjectCode}` : ''}`);
    return notes;
  } catch (error) {
    console.error(`[searchRTPNotes] Error:`, error);
    return [];
  }
}

/**
 * Main search function
 */
export async function searchNotes(keyword: string): Promise<Note[]> {
  if (!keyword.trim()) {
    return [];
  }
  
  const searchTerm = keyword.trim();
  const subjectCodeMatch = searchTerm.match(/\b([A-Z]{2,4}\d{3,4})\b/i);
  const subjectCode = subjectCodeMatch ? subjectCodeMatch[1].toLowerCase() : null;
  
  console.log(`[searchNotes] Searching for: "${searchTerm}", Subject code: ${subjectCode || 'none'}`);
  
  const allNotes: Note[] = [];
  const schemes = NOTES_REPOSITORIES['KTUNotes.in'].schemes;
  
  // Search each scheme
  for (const [scheme, schemeUrl] of Object.entries(schemes)) {
    try {
      console.log(`[searchNotes] 🔍 Searching scheme: ${scheme}`);
      
      // SKIP scheme page - go straight to semester pages
      // Extract branch and semester from subject code
      const branch = subjectCode ? extractBranchFromSubjectCode(subjectCode.toUpperCase()) : undefined;
      const semester = subjectCode ? inferSemesterFromSubjectCode(subjectCode.toUpperCase()) : undefined;
      
      console.log(`[searchNotes] 📌 Target: Semester=${semester || 'all'}, Branch=${branch || 'any'}`);
      
      // Construct semester URLs to search
      const semesterUrls: string[] = [];
      
      if (semester) {
        // Search specific semester only
        semesterUrls.push(`https://www.ktunotes.in/ktu-s${semester}-notes-${scheme}-scheme/`);
        
        if (branch) {
          // Search branch-specific page
          semesterUrls.push(`https://www.ktunotes.in/ktu-s${semester}-${branch.toLowerCase()}-notes-${scheme}-scheme/`);
        } else {
          // Common subject (MAT, PHY, etc.) - search popular branches
          const commonBranches = ['cse', 'ece', 'eee', 'me', 'ce'];
          for (const br of commonBranches) {
            semesterUrls.push(`https://www.ktunotes.in/ktu-s${semester}-${br}-notes-${scheme}-scheme/`);
          }
        }
      } else {
        // Search all semesters (1-8)
        for (let sem = 1; sem <= 8; sem++) {
          semesterUrls.push(`https://www.ktunotes.in/ktu-s${sem}-notes-${scheme}-scheme/`);
        }
      }
      
      console.log(`[searchNotes] 🔧 Will search ${semesterUrls.length} semester page(s)`);
      
      // Now search inside each semester page
      let filteredPages: string[] = [];
      
      for (const semesterUrl of semesterUrls) {
        try {
          console.log(`[searchNotes] 🔎 Fetching: ${semesterUrl}`);
          
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(semesterUrl)}`;
          const response = await fetch(proxyUrl, {
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          });
          
          if (!response.ok) {
            console.log(`[searchNotes] ⚠️ ${response.status} - skipping`);
            continue;
          }
          
          const html = await response.text();
          const subjectPages = findAllNotePageLinks(html, semesterUrl);
          console.log(`[searchNotes] Found ${subjectPages.length} subject page(s)`);
          
          // Filter by subject code or search term
          if (subjectCode) {
            // Try multiple variations of the subject code
            // EC301 → ec301, ect301, ec-301, etc.
            const codeVariations = [
              subjectCode, // ec301
              subjectCode.replace(/(\d+)/, 't$1'), // ect301
              subjectCode.replace(/(\d)/, '$1-'), // ec-301
              subjectCode.substring(0, 2) + 't' + subjectCode.substring(2) // ect301
            ].map(v => v.toLowerCase());
            
            const matching = subjectPages.filter(url => 
              codeVariations.some(variant => url.toLowerCase().includes(variant))
            );
            console.log(`[searchNotes] ✅ ${matching.length} match "${subjectCode}" from ${subjectPages.length} pages`);
            
            filteredPages.push(...matching);
          } else {
            const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
            const matching = subjectPages.filter(url => 
              searchWords.some(word => url.toLowerCase().includes(word.replace(/\s+/g, '-')))
            );
            console.log(`[searchNotes] ✅ ${matching.length} match search terms`);
            filteredPages.push(...matching);
          }
        } catch (error) {
          console.error(`[searchNotes] Error:`, error);
        }
      }
      
      // Extract notes from each page (limit to 10 pages per scheme)
      for (const pageUrl of filteredPages.slice(0, 10)) {
        const notes = await extractNotesFromPage(pageUrl, scheme, searchTerm);
        allNotes.push(...notes);
      }
      
      console.log(`[searchNotes] ✅ Found ${allNotes.length} total notes so far`);
      
    } catch (error) {
      console.error(`[searchNotes] Error searching scheme ${scheme}:`, error);
    }
  }
  
  // Also search RTPNotes if searching for CSE/CS in S5-S8
  // Check for CSE/CS keywords and semester S5-S8 in search term
  const hasCSE = /\b(cse|cs|computer\s*science)\b/i.test(searchTerm);
  const semesterMatch = searchTerm.match(/\b(s[5-8]|semester\s*[5-8])\b/i);
  const semesterNum = semesterMatch ? semesterMatch[0].match(/[5-8]/)?.[0] : null;
  
  if (subjectCode) {
    const branch = extractBranchFromSubjectCode(subjectCode.toUpperCase());
    const semester = inferSemesterFromSubjectCode(subjectCode.toUpperCase());
    
    // Check if it's CSE/CS branch and S5-S8 semester
    if ((branch === 'CSE' || branch === undefined) && semester && ['5', '6', '7', '8'].includes(semester)) {
      const subjectCodeUpper = subjectCode.toUpperCase();
      // Check if subject code exists in RTPNotes mapping
      if (getSubjectNameFromCode(subjectCodeUpper)) {
        console.log(`[searchNotes] 🔍 Also searching RTPNotes for CSE S${semester} - ${subjectCodeUpper}`);
        try {
          const rtpNotes = await searchRTPNotes(semester, subjectCode);
          allNotes.push(...rtpNotes);
        } catch (error) {
          console.error(`[searchNotes] Error searching RTPNotes:`, error);
        }
      } else {
        console.log(`[searchNotes] ⚠️ Subject code ${subjectCodeUpper} not found in RTPNotes mapping, skipping RTPNotes search`);
      }
    }
  } else if (hasCSE && semesterNum) {
    // If search term contains CSE and semester S5-S8, search RTPNotes (all subjects)
    console.log(`[searchNotes] 🔍 Searching RTPNotes for CSE Semester ${semesterNum}`);
    try {
      const rtpNotes = await searchRTPNotes(semesterNum);
      allNotes.push(...rtpNotes);
    } catch (error) {
      console.error(`[searchNotes] Error searching RTPNotes:`, error);
    }
  } else if (semesterNum) {
    // If just semester S5-S8 without subject code, also search RTPNotes (likely CSE, all subjects)
    console.log(`[searchNotes] 🔍 Searching RTPNotes for Semester ${semesterNum}`);
    try {
      const rtpNotes = await searchRTPNotes(semesterNum);
      allNotes.push(...rtpNotes);
    } catch (error) {
      console.error(`[searchNotes] Error searching RTPNotes:`, error);
    }
  }
  
  // Remove duplicates by PDF URL
  const uniqueNotes = Array.from(
    new Map(allNotes.map(note => [note.pdfUrl, note])).values()
  );
  
  console.log(`[searchNotes] 🎉 Final result: ${uniqueNotes.length} unique notes`);
  
  return uniqueNotes;
}

/**
 * Fetch note as file for downloading
 */
export async function fetchNoteAsFile(url: string): Promise<Blob> {
  // Use proxy to bypass CORS with download intent
  const proxyUrl = getNoteProxyUrl(url, 'download');
  const response = await fetch(proxyUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch note: ${response.statusText}`);
  }
  
  return await response.blob();
}

export default { searchNotes, fetchNoteAsFile, getNoteProxyUrl };
