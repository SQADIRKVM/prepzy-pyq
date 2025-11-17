// Notes Search Service for KTU Notes
import notesSourcesConfig from '@/config/notesSources.json';

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

// Load repositories from config file
const NOTES_REPOSITORIES = notesSourcesConfig.repositories;

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
 * Find all note page links from HTML (generic for any source)
 */
function findAllNotePageLinks(html: string, baseUrl: string, sourceDomain?: string): string[] {
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
    const domain = sourceDomain || new URL(baseUrl).hostname;
    
    // Check if URL belongs to the source domain
    if (!urlLower.includes(domain.replace('www.', ''))) {
      return;
    }
    
    // Special handling for KeralaNotes.com URL pattern
    // Pattern: /YYYY/MM/KTU-S1-S2-Subject-Name-Notes-New-Scheme.html
    const isKeralaNotes = urlLower.includes('keralanotes.com');
    const isKeralaNotesPattern = isKeralaNotes && 
                                 urlLower.match(/\/\d{4}\/\d{2}\/ktu-[s\d]+-.*-notes.*\.html/);
    
    // EXCLUDE these patterns (NOT note pages):
    const isExcluded = urlLower.includes('scheme-notes') ||
                       urlLower.includes('syllabus') ||
                       urlLower.includes('/tag/') ||
                       urlLower.includes('question-papers') ||
                       urlLower.includes('lab-materials') ||
                       urlLower.includes('solved-questions') ||
                       (urlLower.match(/\/ktu-s[1-8]-notes-\d{4}/) && !isKeralaNotes) ||
                       urlLower.match(/\/ktu-s[1-8]-(cse|ece|eee|me|ce|it|civil|mech)-notes-\d{4}/);
    
    // INCLUDE pages that look like actual subject/note pages
    // Must have either:
    // 1. A subject code pattern (e.g., ec301, cst201, mat203)
    // 2. Or end with specific subject keywords + "-notes"
    // 3. Or contain common note-related keywords
    // 4. Or match KeralaNotes.com pattern
    const hasSubjectCode = /[a-z]{2,4}\d{3,4}/.test(urlLower);
    const hasNotesKeyword = urlLower.includes('-notes') && !urlLower.includes('-notes-20');
    const hasNoteKeywords = /(notes|study|material|module|lecture)/i.test(urlLower);
    
    const isNotePage = !isExcluded &&
                       (hasSubjectCode || hasNotesKeyword || hasNoteKeywords || isKeralaNotesPattern) &&
                       fullUrl.split('/').length >= 4 && // Has actual path
                       (fullUrl.endsWith('.pdf') || fullUrl.endsWith('.html') || !fullUrl.match(/\.(jpg|jpeg|png|gif|css|js)$/i)); // Not image/CSS/JS
    
    if (isNotePage && !links.includes(fullUrl)) {
      links.push(fullUrl);
    }
  });
  
  return links;
}

/**
 * Extract notes (PDFs) from individual note page
 */
async function extractNotesFromPage(url: string, scheme: string, searchTerm: string, sourceName: string = 'KTUNotes.in'): Promise<Note[]> {
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
    
    // Try to extract subject code from search term first (most reliable)
    const searchTermSubjectCode = searchTerm ? extractSubjectCode(searchTerm) : null;
    const pageSubjectCode = extractSubjectCode(pageTitle) || extractSubjectCode(url);
    const subjectCode = searchTermSubjectCode || pageSubjectCode || 'Unknown';
    
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
                     fullUrl.includes('drive.google.com') ||
                     fullUrl.includes('github.com') ||
                     fullUrl.includes('raw.githubusercontent.com');
      
      if (isFile) {
        const finalUrl = convertGoogleDriveLink(fullUrl);
        let linkText = link.textContent?.trim() || '';
        
        // Try to get better context from parent elements (for Google Drive links)
        if ((!linkText || linkText.toLowerCase().includes('view') || linkText.toLowerCase().includes('usp=')) && fullUrl.includes('drive.google.com')) {
          // Check parent element for better text
          const parent = link.parentElement;
          if (parent) {
            const parentText = parent.textContent?.trim() || '';
            // If parent has more descriptive text, use it
            if (parentText && parentText.length > linkText.length && !parentText.toLowerCase().includes('usp=')) {
              linkText = parentText;
            }
          }
          
          // Check sibling elements
          const prevSibling = link.previousElementSibling;
          if (prevSibling && (!linkText || linkText.toLowerCase().includes('view'))) {
            const siblingText = prevSibling.textContent?.trim() || '';
            if (siblingText && !siblingText.toLowerCase().includes('usp=') && siblingText.length < 100) {
              linkText = siblingText;
            }
          }
        }
        
        // Extract filename from URL for better title extraction
        let filename = fullUrl.split('/').pop() || '';
        
        // Remove query parameters and fragments (e.g., ?usp=sharing, #page=1)
        filename = filename.split('?')[0].split('#')[0];
        
        // For Google Drive URLs, try to extract better filename
        if (fullUrl.includes('drive.google.com')) {
          // Google Drive share links: /file/d/FILE_ID/view?usp=sharing
          const fileIdMatch = fullUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
          if (fileIdMatch && (filename.includes('view') || filename.includes('usp'))) {
            // Don't use "view" or query params as filename
            filename = '';
          }
        }
        
        const filenameWithoutExt = filename.replace(/\.(pdf|doc|docx|zip)$/i, '');
        
        // Check if link text is generic (DOWNLOAD, Click here, etc.)
        const genericLinkTexts = ['download', 'click here', 'here', 'view', 'open', 'get', 'link', 'file'];
        const isGenericLinkText = genericLinkTexts.some(generic => 
          linkText.toLowerCase().trim() === generic || 
          linkText.toLowerCase().trim().startsWith(generic + ' ') ||
          linkText.toLowerCase().includes('usp=sharing') ||
          linkText.toLowerCase().includes('view?') ||
          linkText.toLowerCase().includes('?usp=')
        );
        
        // Clean link text - remove query parameters and fragments
        let cleanLinkText = linkText.split('?')[0].split('#')[0].trim();
        
        // If cleaned text is still generic or contains query params, treat as generic
        const isStillGeneric = genericLinkTexts.some(generic => 
          cleanLinkText.toLowerCase() === generic ||
          cleanLinkText.toLowerCase().startsWith(generic + ' ') ||
          cleanLinkText.toLowerCase().endsWith(' ' + generic)
        ) || cleanLinkText.includes('usp=') || cleanLinkText.includes('view?') || cleanLinkText.toLowerCase() === 'view';
        
        // Use filename if link text is generic, empty, or contains query params
        // If no filename available and link text is generic, skip adding it to title
        // Also check if filename itself is generic (like "view")
        const filenameIsGeneric = filenameWithoutExt && genericLinkTexts.some(generic => 
          filenameWithoutExt.toLowerCase() === generic
        );
        
        const effectiveLinkText = (isGenericLinkText || isStillGeneric || !cleanLinkText) && filenameWithoutExt && !filenameIsGeneric
          ? filenameWithoutExt 
          : (isStillGeneric || filenameIsGeneric ? '' : cleanLinkText);
        
        // Try to extract subject code from multiple sources
        // Priority: search term > link text > filename > URL > page title
        const searchTermSubjectCode = searchTerm ? extractSubjectCode(searchTerm) : null;
        
        // For KTU Assist, prioritize search term subject code to avoid wrong assignments
        let extractedSubjectCode: string | null = null;
        
        if (sourceName === 'KTU Assist' && searchTermSubjectCode) {
          // For KTU Assist, use search term subject code as primary source
          // Then verify it exists in the PDF metadata
          extractedSubjectCode = searchTermSubjectCode;
          
          // Verify the code exists in link text, filename, or URL
          const codeUpper = searchTermSubjectCode.toUpperCase();
          const codeLower = codeUpper.toLowerCase();
          const inLinkText = effectiveLinkText.toUpperCase().includes(codeUpper) || 
                            effectiveLinkText.toLowerCase().includes(codeLower);
          const inFilename = filenameWithoutExt.toUpperCase().includes(codeUpper) ||
                             filenameWithoutExt.toLowerCase().includes(codeLower);
          const inUrl = fullUrl.toUpperCase().includes(codeUpper) ||
                       fullUrl.toLowerCase().includes(codeLower);
          
          // If search term code is not found anywhere in the PDF, try to extract from PDF
          if (!inLinkText && !inFilename && !inUrl) {
            // Extract from PDF metadata instead
            extractedSubjectCode = extractSubjectCode(effectiveLinkText) || 
                                  extractSubjectCode(filenameWithoutExt) ||
                                  extractSubjectCode(fullUrl) || 
                                  extractSubjectCode(pageTitle) || 
                                  searchTermSubjectCode; // Fallback to search term
          }
        } else {
          // For other sources, use normal extraction
          extractedSubjectCode = searchTermSubjectCode ||
                                 extractSubjectCode(effectiveLinkText) || 
                                 extractSubjectCode(filenameWithoutExt) ||
                                 extractSubjectCode(fullUrl) || 
                                 extractSubjectCode(pageTitle) || 
                                 subjectCode;
        }
        
        // If still "Unknown", try to extract from filename
        if ((!extractedSubjectCode || extractedSubjectCode === 'Unknown') && fullUrl) {
          const filenameCode = extractSubjectCode(filename);
          if (filenameCode) {
            extractedSubjectCode = filenameCode;
          } else {
            // Try to extract from URL path segments
            const urlParts = fullUrl.split('/');
            for (const part of urlParts.reverse()) {
              const partCode = extractSubjectCode(part);
              if (partCode) {
                extractedSubjectCode = partCode;
                break;
              }
            }
          }
        }
        
        // Final fallback
        if (!extractedSubjectCode || extractedSubjectCode === 'Unknown') {
          extractedSubjectCode = searchTermSubjectCode || 'Unknown';
        }
        
        // For KTU Assist, skip notes that don't match the search term subject code
        // This prevents wrong PDFs from being included
        if (sourceName === 'KTU Assist' && searchTermSubjectCode) {
          const codeUpper = searchTermSubjectCode.toUpperCase();
          const extractedUpper = extractedSubjectCode.toUpperCase();
          
          // Check if extracted code matches search term
          const codeMatches = extractedUpper === codeUpper ||
                             extractedUpper.includes(codeUpper) ||
                             codeUpper.includes(extractedUpper);
          
          // Also check if the code appears in the PDF URL or filename
          const urlUpper = fullUrl.toUpperCase();
          const filenameUpper = filenameWithoutExt.toUpperCase();
          const codeInUrl = urlUpper.includes(codeUpper) || filenameUpper.includes(codeUpper);
          
          // If subject code doesn't match and code is not in URL/filename, skip this note
          if (!codeMatches && !codeInUrl) {
            console.log(`[extractNotesFromPage] KTU Assist: Skipping note - extracted "${extractedUpper}" but searching for "${codeUpper}"`);
            return; // Skip this note
          }
        }
        
        // Extract module number from link text, filename, or URL
        const moduleMatch = effectiveLinkText.match(/\b(module|mod|set)\s*([1-6])\b/i) ||
                           filenameWithoutExt.match(/\b(module|mod|set)\s*([1-6])\b/i) ||
                           filenameWithoutExt.match(/[Mm]odule[_\s-]?([1-6])/) ||
                           filenameWithoutExt.match(/[Mm][_\s-]?([1-6])\b/) ||
                           fullUrl.match(/[Mm]odule[_\s-]?([1-6])/);
        const moduleNum = moduleMatch ? (moduleMatch[2] || moduleMatch[1]) : null;
        
        // Construct note title: combine page title with link text
        // Format: "KTU PH100 Engineering Physics A Notes - module 1"
        let noteTitle = pageTitle;
        
        // Extract subject code from page title for better formatting
        const titleSubjectCode = extractSubjectCode(pageTitle) || extractedSubjectCode;
        
        // Clean up page title - format it properly
        // Example: "KTU Engineering Physics A Notes 2019 New scheme | PH100" 
        // Should become: "KTU PH100 Engineering Physics A Notes"
        
        // Remove scheme/year info
        noteTitle = noteTitle.replace(/\s*(2019|2020|2021|2022|2023|2024|2025)\s*(New\s*)?[Ss]cheme/gi, '');
        noteTitle = noteTitle.replace(/\s*New\s*[Ss]cheme/gi, '');
        
        // Remove "| PH100" or "| PH 100" pattern and extract subject code
        noteTitle = noteTitle.replace(/\s*\|\s*([A-Z]{2,4}\s*\d{3,4})\s*$/i, '');
        
        // Remove extra whitespace
        noteTitle = noteTitle.replace(/\s+/g, ' ').trim();
        
        // If we have a subject code, ensure it's in the title (preferably after "KTU")
        if (titleSubjectCode && titleSubjectCode !== 'Unknown') {
          const titleUpper = noteTitle.toUpperCase();
          const codeUpper = titleSubjectCode.toUpperCase();
          
          // If subject code is not in title, add it after "KTU"
          if (!titleUpper.includes(codeUpper)) {
            if (noteTitle.toUpperCase().startsWith('KTU')) {
              noteTitle = `KTU ${titleSubjectCode} ${noteTitle.substring(3).trim()}`;
            } else {
              noteTitle = `KTU ${titleSubjectCode} ${noteTitle}`;
            }
          } else {
            // Ensure "KTU" prefix if not present
            if (!noteTitle.toUpperCase().startsWith('KTU')) {
              noteTitle = `KTU ${noteTitle}`;
            }
          }
        } else {
          // Ensure "KTU" prefix if not present
          if (!noteTitle.toUpperCase().startsWith('KTU')) {
            noteTitle = `KTU ${noteTitle}`;
          }
        }
        
        // If we have effective link text (filename or actual link text), append it with " - "
        if (effectiveLinkText && effectiveLinkText.trim()) {
          const effectiveLinkTextLower = effectiveLinkText.toLowerCase().trim();
          const pageTitleLower = noteTitle.toLowerCase();
          
          // Skip if it's still generic after using filename
          const isStillGeneric = genericLinkTexts.some(generic => 
            effectiveLinkTextLower === generic || 
            effectiveLinkTextLower.startsWith(generic + ' ') ||
            effectiveLinkTextLower.includes('usp=') ||
            effectiveLinkTextLower.includes('view?')
          );
          
          // Only append if:
          // 1. Not generic
          // 2. Not already in page title
          // 3. Not the same as page title
          // 4. Not empty or just whitespace
          if (!isStillGeneric && 
              effectiveLinkText.trim().length > 0 &&
              !pageTitleLower.includes(effectiveLinkTextLower) && 
              effectiveLinkTextLower !== pageTitleLower) {
            noteTitle = `${noteTitle} - ${effectiveLinkText}`;
          }
        }
        
        // If we have module number but it's not in the title, add it
        if (moduleNum && !noteTitle.toLowerCase().includes(`module ${moduleNum}`)) {
          // Check if title already ends with something, if not add module
          if (!noteTitle.includes(' - ')) {
            noteTitle = `${noteTitle} - Module ${moduleNum}`;
          } else {
            // Module might already be in the link text part
            const parts = noteTitle.split(' - ');
            const lastPart = parts[parts.length - 1];
            if (!lastPart.toLowerCase().includes(`module ${moduleNum}`)) {
              noteTitle = `${noteTitle} - Module ${moduleNum}`;
            }
          }
        }
        
        // Fallback: if page title is generic, use effective link text with subject code
        if ((noteTitle === 'KTU Notes' || noteTitle === 'KTU') && effectiveLinkText) {
          if (extractedSubjectCode && extractedSubjectCode !== 'Unknown') {
            noteTitle = `KTU ${extractedSubjectCode} ${effectiveLinkText}`;
          } else {
            noteTitle = effectiveLinkText;
          }
        }
        
        const note: Note = {
          id: `${Date.now()}-${index}-${Math.random()}`,
          title: noteTitle,
          subjectCode: extractedSubjectCode,
          semester: inferSemesterFromSubjectCode(extractedSubjectCode) || undefined,
          branch: extractBranchFromSubjectCode(extractedSubjectCode),
          scheme: scheme,
          module: moduleNum || undefined,
          pdfUrl: finalUrl,
          detailUrl: url,
          source: sourceName
        };
        
        notes.push(note);
      }
    });
    
    // For KTU Assist, filter notes by subject code if search term has one
    // KTU Assist pages often have multiple subjects, so we need strict filtering
    if (sourceName === 'KTU Assist' && searchTerm) {
      const searchSubjectCode = extractSubjectCode(searchTerm);
      if (searchSubjectCode) {
        const codeUpper = searchSubjectCode.toUpperCase();
        const codeLower = codeUpper.toLowerCase();
        
        // Strict filtering: PDF must contain the exact subject code
        const filteredNotes = notes.filter(note => {
          const titleUpper = note.title.toUpperCase();
          const subjectCodeUpper = note.subjectCode.toUpperCase();
          const pdfUrlUpper = note.pdfUrl.toUpperCase();
          
          // Extract numeric part and prefix
          const numericPart = codeUpper.match(/\d+/)?.[0];
          const codePrefix = codeUpper.match(/^[A-Z]+/)?.[0];
          
          // Check 1: Exact subject code match (most reliable)
          const exactMatch = titleUpper.includes(codeUpper) ||
                            subjectCodeUpper === codeUpper ||
                            pdfUrlUpper.includes(codeUpper) ||
                            titleUpper.includes(codeLower) ||
                            pdfUrlUpper.includes(codeLower);
          
          if (exactMatch) {
            return true;
          }
          
          // Check 2: Both prefix and numeric part must be present together
          // This prevents false matches (e.g., PH100 shouldn't match CST202)
          if (codePrefix && numericPart) {
            const hasPrefix = titleUpper.includes(codePrefix) || pdfUrlUpper.includes(codePrefix);
            const hasNumeric = titleUpper.includes(numericPart) || pdfUrlUpper.includes(numericPart);
            
            // Both must be present, and subject code should match
            if (hasPrefix && hasNumeric) {
              // Additional check: make sure it's not a different subject
              // For example, PH100 should not match if we see CST202
              const wrongSubjectPattern = /[A-Z]{2,4}\d{3,4}/g;
              const titleCodes = titleUpper.match(wrongSubjectPattern) || [];
              const urlCodes = pdfUrlUpper.match(wrongSubjectPattern) || [];
              const allCodes = [...titleCodes, ...urlCodes, subjectCodeUpper];
              
              // If we find the exact code, it's a match
              if (allCodes.includes(codeUpper)) {
                return true;
              }
              
              // If we find a different subject code, it's NOT a match
              const otherCodes = allCodes.filter(c => c !== codeUpper && c.length >= 4);
              if (otherCodes.length > 0) {
                // Check if any other code is more prominent
                const otherCodeCount = otherCodes.filter(c => 
                  titleUpper.split(c).length > 1 || pdfUrlUpper.split(c).length > 1
                ).length;
                
                // If another code appears multiple times, likely not a match
                if (otherCodeCount > 0) {
                  return false;
                }
              }
            }
          }
          
          return false;
        });
        
        console.log(`[extractNotesFromPage] KTU Assist: Filtered ${filteredNotes.length} notes matching "${codeUpper}" from ${notes.length} total`);
        
        // If no matches found, log for debugging
        if (filteredNotes.length === 0 && notes.length > 0) {
          console.log(`[extractNotesFromPage] KTU Assist: No notes matched "${codeUpper}". Sample note subject codes:`, 
            notes.slice(0, 3).map(n => n.subjectCode));
        }
        
        return filteredNotes;
      }
    }
    
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
/**
 * Get subject name from subject code for RTPNotes
 * Loads from JSON config file
 */
function getSubjectNameFromCode(subjectCode: string): string[] | null {
  const code = subjectCode.toUpperCase();
  const rtpMappings = notesSourcesConfig.subjectMappings?.RTPNotes;
  if (!rtpMappings) return null;
  
  // Search through all semesters
  for (const semesterKey in rtpMappings) {
    const semesterMappings = rtpMappings[semesterKey as keyof typeof rtpMappings];
    if (semesterMappings && code in semesterMappings) {
      return semesterMappings[code as keyof typeof semesterMappings] as string[];
    }
  }
  
  return null;
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

  const rtpRepo = NOTES_REPOSITORIES['RTPNotes' as keyof typeof NOTES_REPOSITORIES] as any;
  const semesterUrl = rtpRepo?.semesters?.[semesterNum as '5' | '6' | '7' | '8'];
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
  
  // Extract branch and semester from subject code (for all sources)
  const branch = subjectCode ? extractBranchFromSubjectCode(subjectCode.toUpperCase()) : undefined;
  const semester = subjectCode ? inferSemesterFromSubjectCode(subjectCode.toUpperCase()) : undefined;
  
  // Iterate through all repositories from config
  const repoEntries = Object.entries(NOTES_REPOSITORIES);
  console.log(`[searchNotes] 📚 Total repositories to search: ${repoEntries.length}`);
  
  for (const [repoKey, repo] of repoEntries) {
    const repoData = repo as any;
    const repoType = repoData?.type;
    const repoName = repoData?.name || repoKey;
    
    console.log(`[searchNotes] 🔍 Searching repository: ${repoName} (${repoType})`);
    
    // Skip RTPNotes - handled separately below
    if (repoKey === 'RTPNotes') {
      console.log(`[searchNotes] ⏭️ Skipping RTPNotes (will be handled separately)`);
      continue;
    }
    
    // Handle scheme-based repositories
    if (repoType === 'scheme-based' && repoData?.schemes) {
      const schemes = repoData.schemes;
      
      // Search each scheme
      for (const [scheme, schemeUrl] of Object.entries(schemes)) {
        try {
          console.log(`[searchNotes] 🔍 Searching ${repoName} - scheme: ${scheme}`);
          
          const baseUrl = repoData.baseUrl || '';
          const baseDomain = new URL(baseUrl).hostname.replace('www.', '');
          
          console.log(`[searchNotes] 📌 Target: Semester=${semester || 'all'}, Branch=${branch || 'any'}`);
          
          // For KTUNotes.in, use the existing semester URL pattern
          // For other sources, try to fetch the scheme page directly and extract links
          const urlsToSearch: string[] = [];
          
          if (repoKey === 'KTUNotes.in') {
            // KTUNotes.in specific pattern
            if (semester) {
              urlsToSearch.push(`https://www.ktunotes.in/ktu-s${semester}-notes-${scheme}-scheme/`);
              if (branch) {
                urlsToSearch.push(`https://www.ktunotes.in/ktu-s${semester}-${branch.toLowerCase()}-notes-${scheme}-scheme/`);
              } else {
                const commonBranches = ['cse', 'ece', 'eee', 'me', 'ce'];
                for (const br of commonBranches) {
                  urlsToSearch.push(`https://www.ktunotes.in/ktu-s${semester}-${br}-notes-${scheme}-scheme/`);
                }
              }
            } else {
              for (let sem = 1; sem <= 8; sem++) {
                urlsToSearch.push(`https://www.ktunotes.in/ktu-s${sem}-notes-${scheme}-scheme/`);
              }
            }
          } else {
            // For other sources, use the scheme URL directly
            urlsToSearch.push(schemeUrl as string);
            
            // Also check special pages if available
            if (repoData.specialPages) {
              for (const [key, specialUrl] of Object.entries(repoData.specialPages)) {
                urlsToSearch.push(specialUrl as string);
              }
            }
          }
      
          console.log(`[searchNotes] 🔧 Will search ${urlsToSearch.length} page(s) from ${repoName}`);
          
          // For non-KTUNotes sources, extract PDFs directly from pages
          // They might not have separate subject pages
          for (const searchUrl of urlsToSearch) {
            try {
              console.log(`[searchNotes] 🔎 Fetching: ${searchUrl}`);
              
              const proxyUrl = `/api/proxy?url=${encodeURIComponent(searchUrl)}`;
              const response = await fetch(proxyUrl, {
                headers: {
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
              });
              
              if (!response.ok) {
                console.log(`[searchNotes] ⚠️ ${response.status} - skipping ${searchUrl}`);
                continue;
              }
              
              const html = await response.text();
              const listingParser = new DOMParser();
              const listingDoc = listingParser.parseFromString(html, 'text/html');
              
              // For KTU Assist, skip direct extraction when searching by subject code
              const skipDirectNotes = repoKey === 'KTUAssist.in' && !!subjectCode;
              if (skipDirectNotes) {
                console.log('[searchNotes] ⏭️ Skipping direct PDF extraction for KTU Assist when searching by subject code to avoid mismatched notes');
              }

              // First, try to extract PDFs directly from this page (unless skipped)
              const directNotes = skipDirectNotes 
                ? [] 
                : await extractNotesFromPage(searchUrl, scheme, searchTerm, repoName);
              
              // Filter direct notes by subject code if provided
              let filteredDirectNotes = directNotes;
              if (subjectCode && directNotes.length > 0) {
                const codeUpper = subjectCode.toUpperCase();
                const codeVariations = [
                  subjectCode.toLowerCase(),
                  codeUpper.toLowerCase(),
                  subjectCode.replace(/(\d+)/, 't$1').toLowerCase(),
                  subjectCode.replace(/(\d)/, '$1-').toLowerCase(),
                  subjectCode.substring(0, 2) + 't' + subjectCode.substring(2).toLowerCase(),
                  // Also try without 't' insertion variations
                  subjectCode.replace('t', '').toLowerCase(),
                  codeUpper.replace('T', '').toLowerCase()
                ];
                
                // More flexible matching - check title, subjectCode, pdfUrl, and also check if subject code appears anywhere
                filteredDirectNotes = directNotes.filter(note => {
                  const titleLower = note.title.toLowerCase();
                  const subjectCodeLower = note.subjectCode.toLowerCase();
                  const pdfUrlLower = note.pdfUrl.toLowerCase();
                  
                  // Check if any variation matches in title, subject code, or URL
                  const matchesVariation = codeVariations.some(variant => 
                    titleLower.includes(variant) ||
                    subjectCodeLower.includes(variant) ||
                    pdfUrlLower.includes(variant)
                  );
                  
                  // Also check if the numeric part matches (e.g., 401 from CST401)
                  const numericPart = subjectCode.match(/\d+/)?.[0];
                  const matchesNumeric = numericPart && (
                    titleLower.includes(numericPart) ||
                    pdfUrlLower.includes(numericPart)
                  );
                  
                  // Check if subject code pattern exists (e.g., CST, CS, etc.)
                  const codePrefix = subjectCode.match(/^[a-z]+/)?.[0];
                  const matchesPrefix = codePrefix && (
                    titleLower.includes(codePrefix) ||
                    pdfUrlLower.includes(codePrefix)
                  );
                  
                  return matchesVariation || (matchesNumeric && matchesPrefix);
                });
                
                console.log(`[searchNotes] ✅ Found ${filteredDirectNotes.length} direct PDFs matching "${subjectCode}" from ${repoName} (out of ${directNotes.length} total)`);
                
                // If no exact matches but we have PDFs, include all PDFs (they might still be relevant)
                // This helps when PDFs don't have subject codes in filenames
                if (filteredDirectNotes.length === 0 && directNotes.length > 0 && directNotes.length <= 50) {
                  console.log(`[searchNotes] ⚠️ No exact matches for "${subjectCode}", but including all ${directNotes.length} PDFs from ${repoName} for manual review`);
                  filteredDirectNotes = directNotes;
                }
              } else if (directNotes.length > 0) {
                console.log(`[searchNotes] ✅ Found ${directNotes.length} direct PDFs from ${repoName}`);
              }
              
              // Always add filtered direct notes if we have any
              if (filteredDirectNotes.length > 0) {
                allNotes.push(...filteredDirectNotes);
                console.log(`[searchNotes] ✅ Added ${filteredDirectNotes.length} notes from ${repoName}`);
              }
              
              // Also try to find subject pages (even if we found direct PDFs, there might be more on subject pages)
              // For KTU Assist with subject code searches, always use subject pages
              const shouldSearchSubjectPages = skipDirectNotes || filteredDirectNotes.length < 5;
              if (shouldSearchSubjectPages) {
                const subjectPages = findAllNotePageLinks(html, searchUrl, baseDomain);
                console.log(`[searchNotes] Found ${subjectPages.length} note page(s) from ${repoName}`);
              
                // Filter by subject code or search term
                let filteredPages: string[] = [];
                if (subjectCode) {
                  if (repoKey === 'KeralaNotes.com') {
                    const subjectPagesSet = new Set(subjectPages);
                    const subjectCodeUpper = subjectCode.toUpperCase();
                    const spacedCode = subjectCodeUpper.replace(/(\d+)/, ' $1');
                    const codeWithSpace = subjectCodeUpper.replace(/([A-Z]+)(\d+)/, '$1 $2');
                    const keralaMatches: string[] = [];
                    
                    listingDoc.querySelectorAll('a[href]').forEach(link => {
                      const href = link.getAttribute('href');
                      if (!href) return;
                      
                      let fullUrl: string;
                      try {
                        if (href.startsWith('http')) {
                          fullUrl = href;
                        } else if (href.startsWith('//')) {
                          fullUrl = `https:${href}`;
                        } else {
                          fullUrl = new URL(href, searchUrl).href;
                        }
                      } catch {
                        return;
                      }
                      
                      if (!subjectPagesSet.has(fullUrl)) return;
                      
                      const linkText = link.textContent?.toUpperCase() || '';
                      const parentText = link.parentElement?.textContent?.toUpperCase() || '';
                      const combinedText = `${linkText} ${parentText}`.replace(/\s+/g, ' ');
                      
                      const matchesCode = combinedText.includes(subjectCodeUpper) ||
                                          combinedText.includes(spacedCode) ||
                                          combinedText.includes(codeWithSpace);
                      
                      if (matchesCode && !keralaMatches.includes(fullUrl)) {
                        keralaMatches.push(fullUrl);
                      }
                    });
                    
                    console.log(`[searchNotes] ✅ Kerala Notes matched ${keralaMatches.length} pages for "${subjectCodeUpper}" via anchor text`);
                    filteredPages.push(...keralaMatches);
                  } else {
                    const codeVariations = [
                      subjectCode,
                      subjectCode.replace(/(\d+)/, 't$1'),
                      subjectCode.replace(/(\d)/, '$1-'),
                      subjectCode.substring(0, 2) + 't' + subjectCode.substring(2)
                    ].map(v => v.toLowerCase());
                    
                    const matching = subjectPages.filter(url => 
                      codeVariations.some(variant => url.toLowerCase().includes(variant))
                    );
                    console.log(`[searchNotes] ✅ ${matching.length} match "${subjectCode}" from ${subjectPages.length} pages`);
                    filteredPages.push(...matching);
                  }
                } else {
                  const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(w => w.length >= 3);
                  const matching = subjectPages.filter(url => 
                    searchWords.some(word => url.toLowerCase().includes(word.replace(/\s+/g, '-')))
                  );
                  console.log(`[searchNotes] ✅ ${matching.length} match search terms`);
                  filteredPages.push(...matching);
                }
                
                // Extract notes from subject pages (limit to 10 pages per scheme)
                for (const pageUrl of filteredPages.slice(0, 10)) {
                  const notes = await extractNotesFromPage(pageUrl, scheme, searchTerm, repoName);
                  allNotes.push(...notes);
                }
              }
            } catch (error) {
              console.error(`[searchNotes] Error fetching ${searchUrl}:`, error);
            }
          }
          
          console.log(`[searchNotes] ✅ Found ${allNotes.length} total notes so far`);
          
        } catch (error) {
          console.error(`[searchNotes] Error searching ${repoName} scheme ${scheme}:`, error);
        }
      }
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
