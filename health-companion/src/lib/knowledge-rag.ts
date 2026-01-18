/**
 * Knowledge RAG (Retrieval Augmented Generation)
 *
 * Local RAG implementation that:
 * 1. Loads and indexes markdown files from /knowledge/sources/
 * 2. Searches relevant documents based on query keywords
 * 3. Returns context for AI prompts with citations
 */

import fs from 'fs';
import path from 'path';

export interface KnowledgeChunk {
  id: string;
  content: string;
  source: string;
  title: string;
  category: string;
  section?: string;
  keywords: string[];
}

export interface Citation {
  source: string;
  title: string;
  snippet: string;
}

export interface RAGResult {
  context: string;
  citations: Citation[];
  relevantChunks: KnowledgeChunk[];
}

// Cache for loaded knowledge base
let knowledgeBase: KnowledgeChunk[] | null = null;

/**
 * Extract keywords from text for indexing
 */
function extractKeywords(text: string): string[] {
  // Common medical and health terms that are significant
  const significantTerms = new Set([
    'pain', 'chest', 'heart', 'attack', 'stroke', 'breathing', 'breath',
    'fever', 'temperature', 'blood', 'pressure', 'symptoms', 'emergency',
    'cold', 'flu', 'cough', 'headache', 'nausea', 'vomiting', 'diarrhea',
    'medication', 'medicine', 'drug', 'dose', 'dosage', 'antibiotic',
    'allergy', 'allergic', 'anaphylaxis', 'swelling', 'rash', 'hives',
    'diabetes', 'cholesterol', 'infection', 'inflammation', 'chronic',
    'acute', 'severe', 'mild', 'moderate', 'urgent', 'critical',
    'treatment', 'diagnosis', 'prevention', 'recovery', 'risk',
    'red', 'flag', 'warning', 'sign', 'symptom', 'cause', 'effect',
    'cardiac', 'respiratory', 'gastrointestinal', 'neurological',
    'fatigue', 'weakness', 'dizziness', 'unconscious', 'seizure',
    'diet', 'nutrition', 'exercise', 'sleep', 'stress', 'hydration',
    'acetaminophen', 'ibuprofen', 'aspirin', 'paracetamol', 'tylenol',
    'liver', 'kidney', 'stomach', 'lung', 'brain', 'arm', 'leg'
  ]);

  // Normalize and tokenize
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);

  // Extract significant words and bigrams
  const keywords: string[] = [];

  // Single significant words
  words.forEach(word => {
    if (significantTerms.has(word)) {
      keywords.push(word);
    }
  });

  // Add common bigrams/phrases
  const textLower = text.toLowerCase();
  const phrases = [
    'chest pain', 'heart attack', 'blood pressure', 'high fever',
    'shortness of breath', 'difficulty breathing', 'red flag',
    'emergency room', 'seek medical', 'consult doctor',
    'common cold', 'influenza', 'flu symptoms', 'cold symptoms',
    'medication safety', 'drug interaction', 'side effect',
    'allergic reaction', 'food allergy', 'severe allergic'
  ];

  phrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      keywords.push(phrase);
    }
  });

  return [...new Set(keywords)];
}

/**
 * Extract a meaningful topic from chunk content
 * Looks for condition/topic names in the content rather than using generic section headers
 */
function extractTopicFromContent(content: string): string | null {
  // Look for patterns like "(Link: www.nhs.uk/) Topic Name" or just topic names
  const topicPatterns = [
    /\(Link:[^)]+\)\s*([A-Z][a-z]+(?:\s+[a-z]+)*)/,  // After links
    /^([A-Z][a-z]+(?:\s+(?:and|or|of|the|in|for)?\s*[a-z]+)*)\s+(?:is|are|can|may|include|causes?)/m,  // Topic at start of sentence
    /About\s+([A-Z][a-z]+(?:\s+[A-Za-z]+)*)/,  // "About Topic"
    /^#\s*([A-Z][a-z]+(?:\s+[A-Za-z]+)*)/m,  // Markdown heading
  ];

  for (const pattern of topicPatterns) {
    const match = content.match(pattern);
    if (match && match[1] && match[1].length > 3 && match[1].length < 50) {
      // Clean up the topic
      const topic = match[1].trim();
      // Skip generic words
      if (!['The', 'This', 'That', 'These', 'Those', 'Some', 'Many', 'Most'].includes(topic)) {
        return topic;
      }
    }
  }

  return null;
}

/**
 * Get human-readable category name
 */
function getReadableCategoryName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes('category a') || lower.includes('category_a')) return 'Common Symptoms';
  if (lower.includes('category b') || lower.includes('category_b')) return 'Prevention & Lifestyle';
  if (lower.includes('category c') || lower.includes('category_c')) return 'Emergency Signs';
  if (lower.includes('category d') || lower.includes('category_d')) return 'Medication Safety';
  if (lower.includes('category e') || lower.includes('category_e')) return 'Prevention & Lifestyle';
  if (lower.includes('emergency') || lower.includes('red_flag')) return 'Emergency Signs';
  if (lower.includes('medication') || lower.includes('drug')) return 'Medication Safety';
  if (lower.includes('flu') || lower.includes('cold')) return 'Common Symptoms';
  if (lower.includes('chest') || lower.includes('pain')) return 'Emergency Signs';
  return 'Health Information';
}

/**
 * Parse a markdown file into knowledge chunks
 */
function parseMarkdownFile(filePath: string, content: string): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  const fileName = path.basename(filePath, '.md');

  // Determine category from file name or content
  let category = 'General';
  if (fileName.toLowerCase().includes('emergency') || fileName.toLowerCase().includes('red_flag')) {
    category = 'Emergency';
  } else if (fileName.toLowerCase().includes('medication') || fileName.toLowerCase().includes('drug')) {
    category = 'Medication';
  } else if (fileName.toLowerCase().includes('flu') || fileName.toLowerCase().includes('cold')) {
    category = 'Symptoms';
  } else if (fileName.toLowerCase().includes('chest') || fileName.toLowerCase().includes('pain')) {
    category = 'Emergency';
  } else if (fileName.toLowerCase().includes('category')) {
    // Handle Category files
    if (fileName.includes('A')) category = 'Symptoms';
    if (fileName.includes('B') || fileName.includes('E')) category = 'Lifestyle';
    if (fileName.includes('C')) category = 'Emergency';
    if (fileName.includes('D')) category = 'Medication';
  }

  // Get human-readable title for the source
  const readableTitle = getReadableCategoryName(fileName);

  // Split content by sections (## headings)
  const sections = content.split(/^##\s+/m);

  sections.forEach((section, index) => {
    if (!section.trim()) return;

    // For first section (before any ## heading), use as intro
    const isIntro = index === 0 && !content.startsWith('##');

    let sectionContent = section;

    if (!isIntro) {
      // Remove the section header line (e.g., "Chunk 1")
      const lines = section.split('\n');
      sectionContent = lines.slice(1).join('\n');
    }

    // Skip very short sections
    if (sectionContent.trim().length < 50) return;

    // Extract a meaningful topic from the content itself
    const extractedTopic = extractTopicFromContent(sectionContent);
    const sectionTitle = extractedTopic || readableTitle;

    // Create chunk
    const chunk: KnowledgeChunk = {
      id: `${fileName}-${index}`,
      content: sectionContent.trim().substring(0, 1500), // Limit chunk size
      source: fileName + '.md',
      title: readableTitle,  // Use readable category name
      category: category,
      section: sectionTitle,  // Use extracted topic or readable title
      keywords: extractKeywords(section)
    };

    chunks.push(chunk);
  });

  // If no sections found, create single chunk from whole content
  if (chunks.length === 0 && content.trim().length > 50) {
    chunks.push({
      id: `${fileName}-0`,
      content: content.trim().substring(0, 2000),
      source: fileName + '.md',
      title: readableTitle,
      category: category,
      keywords: extractKeywords(content)
    });
  }

  return chunks;
}

/**
 * Load and index all knowledge documents
 */
export async function loadKnowledgeBase(): Promise<KnowledgeChunk[]> {
  if (knowledgeBase) {
    return knowledgeBase;
  }

  const chunks: KnowledgeChunk[] = [];

  // Path to knowledge sources (works in both dev and production)
  const knowledgePath = path.join(process.cwd(), 'knowledge', 'sources');

  try {
    // Check if directory exists
    if (!fs.existsSync(knowledgePath)) {
      console.warn('Knowledge sources directory not found:', knowledgePath);
      return [];
    }

    // Read all markdown files
    const files = fs.readdirSync(knowledgePath).filter(f => f.endsWith('.md'));

    for (const file of files) {
      try {
        const filePath = path.join(knowledgePath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const fileChunks = parseMarkdownFile(filePath, content);
        chunks.push(...fileChunks);
      } catch (error) {
        console.error(`Error parsing ${file}:`, error);
      }
    }

    console.log(`Loaded ${chunks.length} knowledge chunks from ${files.length} files`);
    knowledgeBase = chunks;
    return chunks;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return [];
  }
}

/**
 * Calculate relevance score between query and chunk
 */
function calculateRelevance(query: string, chunk: KnowledgeChunk): number {
  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);
  let score = 0;

  // Keyword matching (highest weight)
  queryKeywords.forEach(keyword => {
    if (chunk.keywords.includes(keyword)) {
      score += 10;
    }
    // Partial match in content
    if (chunk.content.toLowerCase().includes(keyword)) {
      score += 5;
    }
  });

  // Direct phrase matching
  const queryWords = queryLower.split(/\s+/);
  queryWords.forEach(word => {
    if (word.length > 3 && chunk.content.toLowerCase().includes(word)) {
      score += 2;
    }
  });

  // Boost for title/section match
  if (chunk.title.toLowerCase().includes(queryLower.split(' ')[0])) {
    score += 8;
  }
  if (chunk.section && chunk.section.toLowerCase().includes(queryLower.split(' ')[0])) {
    score += 5;
  }

  // Category-based boosting for emergency queries
  const emergencyTerms = ['emergency', 'urgent', 'severe', 'critical', 'red flag', 'warning'];
  const hasEmergencyTerm = emergencyTerms.some(term => queryLower.includes(term));
  if (hasEmergencyTerm && chunk.category === 'Emergency') {
    score += 15;
  }

  return score;
}

/**
 * Search knowledge base for relevant documents
 */
export async function searchKnowledge(query: string, topK: number = 3): Promise<RAGResult> {
  const chunks = await loadKnowledgeBase();

  if (chunks.length === 0) {
    return { context: '', citations: [], relevantChunks: [] };
  }

  // Score all chunks
  const scoredChunks = chunks.map(chunk => ({
    chunk,
    score: calculateRelevance(query, chunk)
  }));

  // Sort by score and take top K
  const topChunks = scoredChunks
    .filter(sc => sc.score > 5) // Minimum relevance threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(sc => sc.chunk);

  if (topChunks.length === 0) {
    return { context: '', citations: [], relevantChunks: [] };
  }

  // Build context string
  const contextParts = topChunks.map(chunk => {
    const sectionInfo = chunk.section ? ` > ${chunk.section}` : '';
    return `[Source: ${chunk.source}${sectionInfo}]\n${chunk.content}`;
  });

  const context = `RELEVANT MEDICAL KNOWLEDGE:\n\n${contextParts.join('\n\n---\n\n')}`;

  // Build citations
  const citations: Citation[] = topChunks.map(chunk => ({
    source: chunk.source,
    title: chunk.section ? `${chunk.title} - ${chunk.section}` : chunk.title,
    snippet: chunk.content.substring(0, 150) + '...'
  }));

  return {
    context,
    citations,
    relevantChunks: topChunks
  };
}

/**
 * Clear the knowledge base cache (useful for reloading)
 */
export function clearKnowledgeCache(): void {
  knowledgeBase = null;
}
