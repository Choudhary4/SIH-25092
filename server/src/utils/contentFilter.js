/**
 * Content Filter Utility
 * 
 * This module provides content filtering and safety checks for forum posts.
 * It includes detection for:
 * - Self-harm and suicide ideation
 * - Profanity and inappropriate content
 * - Violence and threats
 * - Spam patterns
 * 
 * IMPORTANT: This is a basic implementation for demonstration purposes.
 * In production, consider using specialized services like:
 * - AWS Comprehend
 * - Google Cloud Natural Language API
 * - Azure Content Moderator
 * - Perspective API by Jigsaw
 */

// Critical phrases that indicate self-harm or suicide risk
const SELF_HARM_PHRASES = [
  'kill myself',
  'end my life',
  'want to die',
  'suicide',
  'suicidal',
  'harm myself',
  'hurt myself',
  'end it all',
  'not worth living',
  'better off dead',
  'take my own life',
  'don\'t want to live',
  'rather be dead',
  'life is meaningless',
  'nothing to live for',
  'cutting myself',
  'self harm',
  'overdose',
  'hanging myself',
  'jump off',
  'pills to die'
];

// Violence and threat-related phrases
const VIOLENCE_PHRASES = [
  'kill you',
  'murder',
  'beat you up',
  'hurt you',
  'destroy you',
  'violence',
  'fight me',
  'punch you',
  'kick your ass',
  'gonna get you',
  'make you pay',
  'revenge'
];

// Basic profanity list (subset for demonstration)
const PROFANITY_WORDS = [
  'damn',
  'hell',
  'crap',
  'stupid',
  'idiot',
  'moron',
  'dumb',
  'hate',
  'loser',
  'pathetic',
  'worthless',
  'useless',
  // Note: This is a very basic list. In production, use a comprehensive profanity database
];

// Spam indicators
const SPAM_PATTERNS = [
  /(.)\1{4,}/g, // Repeated characters (more than 4 times)
  /[A-Z]{5,}/g, // Excessive caps
  /(!{3,}|(\?{3,}))/g, // Multiple punctuation
  /(https?:\/\/[^\s]+)/g, // URLs (might be spam)
  /(\b\d{3,}\b)/g // Long numbers (might be phone numbers)
];

/**
 * Analyze content for self-harm indicators
 * @param {string} text - Text to analyze
 * @returns {object} Analysis result with flags and detected phrases
 */
const analyzeSelfHarm = (text) => {
  const normalizedText = text.toLowerCase();
  const detectedPhrases = [];
  let severity = 'none'; // none, low, medium, high
  
  for (const phrase of SELF_HARM_PHRASES) {
    if (normalizedText.includes(phrase.toLowerCase())) {
      detectedPhrases.push(phrase);
      
      // Assign severity based on directness of language
      if (['kill myself', 'end my life', 'suicide', 'take my own life'].includes(phrase)) {
        severity = 'high';
      } else if (['want to die', 'suicidal', 'better off dead'].includes(phrase)) {
        severity = severity === 'high' ? 'high' : 'medium';
      } else if (severity === 'none') {
        severity = 'low';
      }
    }
  }
  
  return {
    isFlagged: detectedPhrases.length > 0,
    severity,
    detectedPhrases,
    recommendation: severity === 'high' ? 'immediate_attention' : 
                   severity === 'medium' ? 'review_required' : 
                   severity === 'low' ? 'monitor' : 'none'
  };
};

/**
 * Analyze content for violence and threats
 * @param {string} text - Text to analyze
 * @returns {object} Analysis result
 */
const analyzeViolence = (text) => {
  const normalizedText = text.toLowerCase();
  const detectedPhrases = [];
  
  for (const phrase of VIOLENCE_PHRASES) {
    if (normalizedText.includes(phrase.toLowerCase())) {
      detectedPhrases.push(phrase);
    }
  }
  
  return {
    isFlagged: detectedPhrases.length > 0,
    detectedPhrases,
    severity: detectedPhrases.length > 2 ? 'high' : 
              detectedPhrases.length > 0 ? 'medium' : 'none'
  };
};

/**
 * Analyze content for profanity
 * @param {string} text - Text to analyze
 * @returns {object} Analysis result
 */
const analyzeProfanity = (text) => {
  const normalizedText = text.toLowerCase();
  const detectedWords = [];
  
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(normalizedText)) {
      detectedWords.push(word);
    }
  }
  
  return {
    isFlagged: detectedWords.length > 0,
    detectedWords,
    severity: detectedWords.length > 3 ? 'high' : 
              detectedWords.length > 1 ? 'medium' : 'low'
  };
};

/**
 * Analyze content for spam patterns
 * @param {string} text - Text to analyze
 * @returns {object} Analysis result
 */
const analyzeSpam = (text) => {
  const spamIndicators = [];
  let spamScore = 0;
  
  // Check for spam patterns
  for (const pattern of SPAM_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      spamIndicators.push({
        pattern: pattern.toString(),
        matches: matches.length
      });
      spamScore += matches.length;
    }
  }
  
  // Check for excessive repetition
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  const repeatedWords = Object.entries(wordCount)
    .filter(([word, count]) => count > 3 && word.length > 3)
    .map(([word, count]) => ({ word, count }));
  
  if (repeatedWords.length > 0) {
    spamScore += repeatedWords.length * 2;
    spamIndicators.push({ pattern: 'repeated_words', matches: repeatedWords });
  }
  
  return {
    isFlagged: spamScore > 3,
    spamScore,
    spamIndicators,
    severity: spamScore > 10 ? 'high' : 
              spamScore > 5 ? 'medium' : 'low'
  };
};

/**
 * Comprehensive content analysis
 * @param {string} title - Post title
 * @param {string} body - Post body
 * @returns {object} Complete analysis result
 */
const analyzeContent = (title, body) => {
  const fullText = `${title} ${body}`;
  
  const selfHarmAnalysis = analyzeSelfHarm(fullText);
  const violenceAnalysis = analyzeViolence(fullText);
  const profanityAnalysis = analyzeProfanity(fullText);
  const spamAnalysis = analyzeSpam(fullText);
  
  // Determine overall status
  let recommendedStatus = 'pending_moderation';
  let requiresImmediate = false;
  
  if (selfHarmAnalysis.severity === 'high' || violenceAnalysis.severity === 'high') {
    recommendedStatus = 'flagged';
    requiresImmediate = true;
  } else if (selfHarmAnalysis.isFlagged || violenceAnalysis.isFlagged || 
             spamAnalysis.severity === 'high') {
    recommendedStatus = 'flagged';
  } else if (profanityAnalysis.severity === 'high') {
    recommendedStatus = 'pending_moderation';
  }
  
  // Collect all flagged content
  const allFlaggedWords = [
    ...selfHarmAnalysis.detectedPhrases,
    ...violenceAnalysis.detectedPhrases,
    ...profanityAnalysis.detectedWords
  ];
  
  return {
    recommendedStatus,
    requiresImmediate,
    contentFlags: {
      selfHarm: selfHarmAnalysis.isFlagged,
      violence: violenceAnalysis.isFlagged,
      profanity: profanityAnalysis.isFlagged,
      spam: spamAnalysis.isFlagged,
      inappropriate: violenceAnalysis.isFlagged || profanityAnalysis.severity === 'high'
    },
    flaggedWords: allFlaggedWords,
    analysis: {
      selfHarm: selfHarmAnalysis,
      violence: violenceAnalysis,
      profanity: profanityAnalysis,
      spam: spamAnalysis
    },
    overallRisk: requiresImmediate ? 'high' : 
                 (selfHarmAnalysis.isFlagged || violenceAnalysis.isFlagged) ? 'medium' : 'low'
  };
};

/**
 * Quick safety check for immediate content filtering
 * @param {string} text - Text to check
 * @returns {boolean} True if content should be immediately flagged
 */
const isHighRiskContent = (text) => {
  const normalizedText = text.toLowerCase();
  
  const highRiskPhrases = [
    'kill myself',
    'end my life',
    'suicide',
    'take my own life',
    'want to die',
    'better off dead'
  ];
  
  return highRiskPhrases.some(phrase => normalizedText.includes(phrase));
};

/**
 * Clean text by removing or replacing inappropriate content
 * @param {string} text - Text to clean
 * @returns {string} Cleaned text
 */
const cleanText = (text) => {
  let cleanedText = text;
  
  // Replace profanity with asterisks
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
  }
  
  // Remove excessive punctuation
  cleanedText = cleanedText.replace(/[!?]{3,}/g, '!!');
  
  // Remove excessive caps (keep first letter if it's the start of a sentence)
  cleanedText = cleanedText.replace(/([A-Z]){4,}/g, (match) => {
    return match.charAt(0) + match.slice(1).toLowerCase();
  });
  
  return cleanedText.trim();
};

module.exports = {
  analyzeContent,
  analyzeSelfHarm,
  analyzeViolence,
  analyzeProfanity,
  analyzeSpam,
  isHighRiskContent,
  cleanText,
  SELF_HARM_PHRASES,
  VIOLENCE_PHRASES,
  PROFANITY_WORDS
};