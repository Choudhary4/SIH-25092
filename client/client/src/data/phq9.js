// PHQ-9 Questions Data Structure
// Patient Health Questionnaire-9 for depression screening

export const phq9Questions = [
  {
    id: 'phq9_1',
    key: 'q1',
    audioId: 'phq9_1_audio'
  },
  {
    id: 'phq9_2', 
    key: 'q2',
    audioId: 'phq9_2_audio'
  },
  {
    id: 'phq9_3',
    key: 'q3',
    audioId: 'phq9_3_audio'
  },
  {
    id: 'phq9_4',
    key: 'q4',
    audioId: 'phq9_4_audio'
  },
  {
    id: 'phq9_5',
    key: 'q5',
    audioId: 'phq9_5_audio'
  },
  {
    id: 'phq9_6',
    key: 'q6',
    audioId: 'phq9_6_audio'
  },
  {
    id: 'phq9_7',
    key: 'q7',
    audioId: 'phq9_7_audio'
  },
  {
    id: 'phq9_8',
    key: 'q8',
    audioId: 'phq9_8_audio'
  },
  {
    id: 'phq9_9',
    key: 'q9',
    audioId: 'phq9_9_audio'
  }
]

// Answer options with scoring
export const PHQ9_ANSWERS = [
  {
    value: 0,
    key: 'notAtAll',
    score: 0
  },
  {
    value: 1,
    key: 'severalDays',
    score: 1
  },
  {
    value: 2,
    key: 'moreThanHalf',
    score: 2
  },
  {
    value: 3,
    key: 'nearlyEveryDay',
    score: 3
  }
]

// Scoring interpretation
export const PHQ9_SCORING = {
  minimal: { min: 0, max: 4, severity: 'minimal', risk: 'low' },
  mild: { min: 5, max: 9, severity: 'mild', risk: 'low' },
  moderate: { min: 10, max: 14, severity: 'moderate', risk: 'medium' },
  moderatelySevere: { min: 15, max: 19, severity: 'moderately_severe', risk: 'high' },
  severe: { min: 20, max: 27, severity: 'severe', risk: 'high' }
}

// Crisis indicators - question 9 (thoughts of hurting) with high scores
export const CRISIS_INDICATORS = {
  question9Score: 2, // Score of 2 or 3 on question 9 indicates crisis
  totalScoreThreshold: 15 // Total score of 15+ also indicates high risk
}

// Helper functions
export const calculatePHQ9Score = (answers) => {
  return Object.values(answers).reduce((total, answer) => {
    return total + (typeof answer === 'number' ? answer : 0)
  }, 0)
}

export const interpretPHQ9Score = (score) => {
  for (const [key, range] of Object.entries(PHQ9_SCORING)) {
    if (score >= range.min && score <= range.max) {
      return { category: key, ...range }
    }
  }
  return PHQ9_SCORING.minimal
}

export const checkCrisisRisk = (answers, totalScore) => {
  const question9Answer = answers['phq9_9'] || 0
  
  // High risk if question 9 score is 2 or 3, OR total score is very high
  const hasThoughtsOfHarm = question9Answer >= CRISIS_INDICATORS.question9Score
  const hasHighTotalScore = totalScore >= CRISIS_INDICATORS.totalScoreThreshold
  
  if (hasThoughtsOfHarm) {
    return {
      crisis: true,
      type: 'immediate',
      reason: 'thoughts_of_harm',
      priority: 'urgent'
    }
  }
  
  if (hasHighTotalScore) {
    return {
      crisis: true,
      type: 'escalation',
      reason: 'severe_depression',
      priority: 'high'
    }
  }
  
  return {
    crisis: false,
    type: 'none',
    reason: null,
    priority: 'normal'
  }
}

// Mock audio URLs (replace with actual audio files)
export const AUDIO_URLS = {
  phq9_1_audio: '/audio/phq9/question_1.mp3',
  phq9_2_audio: '/audio/phq9/question_2.mp3',
  phq9_3_audio: '/audio/phq9/question_3.mp3',
  phq9_4_audio: '/audio/phq9/question_4.mp3',
  phq9_5_audio: '/audio/phq9/question_5.mp3',
  phq9_6_audio: '/audio/phq9/question_6.mp3',
  phq9_7_audio: '/audio/phq9/question_7.mp3',
  phq9_8_audio: '/audio/phq9/question_8.mp3',
  phq9_9_audio: '/audio/phq9/question_9.mp3'
}

export default {
  phq9Questions,
  PHQ9_ANSWERS,
  PHQ9_SCORING,
  CRISIS_INDICATORS,
  AUDIO_URLS,
  calculatePHQ9Score,
  interpretPHQ9Score,
  checkCrisisRisk
}