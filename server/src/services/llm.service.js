const axios = require('axios');

/**
 * LLM Service - Pluggable AI Integration for Mental Health Chat Support
 * 
 * This service provides a flexible interface for integrating with various LLM providers
 * while maintaining safety standards for mental health applications.
 * 
 * SAFETY REQUIREMENTS:
 * - Never provide therapy or medical advice
 * - Always escalate crisis situations to professionals
 * - Maintain conversation logs for audit purposes
 * - Implement content filtering for harmful responses
 * 
 * INTEGRATION OPTIONS:
 * 1. OpenAI GPT API (production ready)
 * 2. Azure OpenAI Service (enterprise)
 * 3. Self-hosted models (Llama, Mistral via Ollama/vLLM)
 * 4. Hugging Face Inference API
 * 5. Google PaLM/Gemini API
 * 
 * TO REPLACE WITH PRODUCTION LLM:
 * 1. Set environment variables (API keys, endpoints)
 * 2. Implement provider-specific request formatting
 * 3. Add retry logic and error handling
 * 4. Configure prompt templates and safety guidelines
 * 5. Set up logging and monitoring
 */

class LLMService {
  constructor() {
    this.provider = this.determineProvider();
    this.conversationHistory = new Map(); // Simple in-memory storage
    
    // Crisis keywords that trigger immediate escalation
    this.crisisKeywords = [
      'kill myself', 'end my life', 'suicide', 'suicidal', 'want to die',
      'better off dead', 'no point living', 'hurt myself', 'self harm',
      'overdose', 'jump off', 'hang myself', 'cut myself', 'ending it all'
    ];

    // System prompt for mental health support
    this.systemPrompt = `You are a supportive AI assistant providing first-aid guidance for students experiencing mental health challenges. 

CRITICAL SAFETY RULES:
- You are NOT a therapist or counselor
- You CANNOT provide medical advice or diagnosis
- ALWAYS recommend professional help for serious concerns
- If someone mentions self-harm or suicide, immediately escalate
- Focus on immediate coping strategies and validation
- Encourage seeking help from counselors, trusted adults, or crisis lines

Your role is to:
1. Provide emotional validation and support
2. Suggest healthy coping strategies (breathing, grounding techniques)
3. Guide users to appropriate professional resources
4. Help users feel heard and less alone

Keep responses concise, empathetic, and always include professional help recommendations.`;
  }

  /**
   * Determine which LLM provider to use based on environment configuration
   */
  determineProvider() {
    if (process.env.OPENAI_API_KEY) {
      return 'openai';
    } else if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_KEY) {
      return 'azure';
    } else if (process.env.OLLAMA_ENDPOINT) {
      return 'ollama'; // Self-hosted via Ollama
    } else if (process.env.HUGGINGFACE_API_KEY) {
      return 'huggingface';
    }
    return 'fallback'; // Use canned responses
  }

  /**
   * Main query method - routes to appropriate LLM provider
   * @param {string} prompt - User's message
   * @param {Object} context - Additional context (user info, conversation history)
   * @returns {Object} { reply, confidence, suggestedActions }
   */
  async queryLLM(prompt, context = {}) {
    try {
      // Log the interaction for audit purposes
      this.logInteraction(prompt, context);

      // Check for crisis indicators first
      const crisisDetected = this.detectCrisisKeywords(prompt);
      
      if (crisisDetected) {
        return this.getCrisisResponse(prompt, context);
      }

      // Route to appropriate provider
      switch (this.provider) {
        case 'openai':
          return await this.queryOpenAI(prompt, context);
        case 'azure':
          return await this.queryAzureOpenAI(prompt, context);
        case 'ollama':
          return await this.queryOllama(prompt, context);
        case 'huggingface':
          return await this.queryHuggingFace(prompt, context);
        default:
          return this.getFallbackResponse(prompt, context);
      }

    } catch (error) {
      console.error('LLM Service Error:', error);
      return this.getErrorResponse(error);
    }
  }

  /**
   * OpenAI GPT Integration (Production Ready)
   * Requires: OPENAI_API_KEY environment variable
   */
  async queryOpenAI(prompt, context) {
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.getConversationHistory(context.sessionId || 'default'),
      { role: 'user', content: prompt }
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content;
    
    // Store conversation for context
    this.updateConversationHistory(context.sessionId || 'default', prompt, reply);

    return {
      reply,
      confidence: 0.85,
      suggestedActions: this.analyzeSuggestedActions(reply, prompt),
      provider: 'openai',
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    };
  }

  /**
   * Azure OpenAI Integration (Enterprise)
   * Requires: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_DEPLOYMENT_NAME
   */
  async queryAzureOpenAI(prompt, context) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || 'gpt-35-turbo';
    
    const messages = [
      { role: 'system', content: this.systemPrompt },
      ...this.getConversationHistory(context.sessionId || 'default'),
      { role: 'user', content: prompt }
    ];

    const response = await axios.post(
      `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages,
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'api-key': process.env.AZURE_OPENAI_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0].message.content;
    this.updateConversationHistory(context.sessionId || 'default', prompt, reply);

    return {
      reply,
      confidence: 0.85,
      suggestedActions: this.analyzeSuggestedActions(reply, prompt),
      provider: 'azure-openai',
      model: deploymentName
    };
  }

  /**
   * Ollama Self-Hosted Integration
   * Requires: OLLAMA_ENDPOINT environment variable
   * Models: llama2, mistral, codellama, etc.
   */
  async queryOllama(prompt, context) {
    const response = await axios.post(
      `${process.env.OLLAMA_ENDPOINT}/api/generate`,
      {
        model: process.env.OLLAMA_MODEL || 'llama2:7b-chat',
        prompt: `${this.systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 60000 // Self-hosted models may be slower
      }
    );

    const reply = response.data.response;
    this.updateConversationHistory(context.sessionId || 'default', prompt, reply);

    return {
      reply,
      confidence: 0.75, // Self-hosted models may have lower confidence
      suggestedActions: this.analyzeSuggestedActions(reply, prompt),
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama2:7b-chat'
    };
  }

  /**
   * Hugging Face Inference API Integration
   * Requires: HUGGINGFACE_API_KEY environment variable
   */
  async queryHuggingFace(prompt, context) {
    const model = process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-large';
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: `${this.systemPrompt}\n\nUser: ${prompt}\nAssistant:`,
        parameters: {
          max_length: 300,
          temperature: 0.7,
          do_sample: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data[0].generated_text.split('Assistant:')[1]?.trim() || 'I understand you\'re going through a difficult time. Please consider speaking with a counselor.';
    this.updateConversationHistory(context.sessionId || 'default', prompt, reply);

    return {
      reply,
      confidence: 0.70,
      suggestedActions: this.analyzeSuggestedActions(reply, prompt),
      provider: 'huggingface',
      model
    };
  }

  /**
   * Fallback responses when no LLM provider is configured
   * Uses rule-based responses and coping exercises
   */
  getFallbackResponse(prompt, context) {
    const lowerPrompt = prompt.toLowerCase();
    let reply = '';
    let copingExercise = null;

    // Rule-based response matching
    if (lowerPrompt.includes('anxious') || lowerPrompt.includes('anxiety')) {
      reply = "I understand you're feeling anxious. That's a very common experience for students. Anxiety can feel overwhelming, but there are ways to manage it.";
      copingExercise = this.getBreathingExercise();
    } else if (lowerPrompt.includes('depressed') || lowerPrompt.includes('sad') || lowerPrompt.includes('down')) {
      reply = "I hear that you're feeling really down right now. Those feelings are valid, and it's important that you don't have to face them alone.";
      copingExercise = this.getGroundingExercise();
    } else if (lowerPrompt.includes('stress') || lowerPrompt.includes('overwhelmed')) {
      reply = "Feeling stressed and overwhelmed is something many students experience. It sounds like you're dealing with a lot right now.";
      copingExercise = this.getStressReliefExercise();
    } else if (lowerPrompt.includes('lonely') || lowerPrompt.includes('alone')) {
      reply = "Feeling lonely can be really difficult, especially as a student. Your feelings are completely understandable.";
      copingExercise = this.getConnectionExercise();
    } else {
      reply = "Thank you for sharing what you're going through. It takes courage to reach out when you're struggling.";
      copingExercise = this.getMindfulnessExercise();
    }

    // Always add professional help recommendation
    reply += " I want you to know that talking to a professional counselor can provide you with personalized support and strategies. Consider reaching out to your college counseling center or a trusted adult.";

    const response = {
      reply,
      confidence: 0.60,
      suggestedActions: ['seek_counseling', 'coping_strategies'],
      provider: 'fallback',
      copingExercise
    };

    this.updateConversationHistory(context.sessionId || 'default', prompt, reply);
    return response;
  }

  /**
   * Crisis response for high-risk situations
   */
  getCrisisResponse(prompt, context) {
    const reply = `I'm very concerned about what you've shared. Your safety is the most important thing right now. Please reach out for immediate help:

🚨 Emergency: Call 911
📞 Crisis Hotline: 988 (Suicide & Crisis Lifeline)
💬 Crisis Text: Text HOME to 741741

You don't have to face this alone. There are people who want to help you through this difficult time. Please contact emergency services or a crisis hotline right away.`;

    return {
      reply,
      confidence: 1.0,
      suggestedActions: ['crisis_escalation', 'emergency_contact', 'immediate_help'],
      provider: this.provider,
      crisisDetected: true,
      requiresImmediateAction: true
    };
  }

  /**
   * Error response for service failures
   */
  getErrorResponse(error) {
    return {
      reply: "I'm sorry, I'm having trouble responding right now. Please don't let this stop you from seeking help. Consider talking to a counselor, trusted adult, or calling a crisis line if you need immediate support.",
      confidence: 0.0,
      suggestedActions: ['seek_counseling', 'try_again_later'],
      provider: 'error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable'
    };
  }

  /**
   * Detect crisis keywords in user input
   */
  detectCrisisKeywords(prompt) {
    const lowerPrompt = prompt.toLowerCase();
    return this.crisisKeywords.some(keyword => lowerPrompt.includes(keyword));
  }

  /**
   * Analyze response to suggest appropriate actions
   */
  analyzeSuggestedActions(reply, originalPrompt) {
    const actions = [];
    const lowerReply = reply.toLowerCase();
    const lowerPrompt = originalPrompt.toLowerCase();

    if (lowerPrompt.includes('anxious') || lowerReply.includes('anxiety')) {
      actions.push('breathing_exercise', 'anxiety_resources');
    }
    if (lowerPrompt.includes('stress') || lowerReply.includes('stress')) {
      actions.push('stress_management', 'time_management');
    }
    if (lowerReply.includes('counselor') || lowerReply.includes('professional')) {
      actions.push('seek_counseling');
    }
    if (lowerPrompt.includes('lonely') || lowerReply.includes('connect')) {
      actions.push('social_connection', 'peer_support');
    }

    // Always suggest professional help
    if (!actions.includes('seek_counseling')) {
      actions.push('seek_counseling');
    }

    return actions;
  }

  /**
   * Coping exercise generators
   */
  getBreathingExercise() {
    return {
      type: 'breathing',
      title: '4-7-8 Breathing Exercise',
      instructions: [
        'Sit comfortably and close your eyes',
        'Breathe in through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat 3-4 times'
      ],
      duration: '2-3 minutes'
    };
  }

  getGroundingExercise() {
    return {
      type: 'grounding',
      title: '5-4-3-2-1 Grounding Technique',
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ],
      duration: '3-5 minutes'
    };
  }

  getStressReliefExercise() {
    return {
      type: 'stress_relief',
      title: 'Progressive Muscle Relaxation',
      instructions: [
        'Start with your toes - tense for 5 seconds, then relax',
        'Move up to your calves, thighs, abdomen',
        'Continue with arms, shoulders, face',
        'Notice the difference between tension and relaxation',
        'Take deep breaths throughout'
      ],
      duration: '10-15 minutes'
    };
  }

  getConnectionExercise() {
    return {
      type: 'connection',
      title: 'Reaching Out Exercise',
      instructions: [
        'Think of one person you trust',
        'Consider sending them a simple message',
        'Join a study group or campus activity',
        'Visit the counseling center',
        'Remember: asking for help is a sign of strength'
      ],
      duration: 'Ongoing'
    };
  }

  getMindfulnessExercise() {
    return {
      type: 'mindfulness',
      title: 'Simple Mindfulness Practice',
      instructions: [
        'Sit quietly and focus on your breathing',
        'Notice thoughts without judging them',
        'Gently return attention to your breath',
        'Start with just 2-3 minutes',
        'Practice regularly for best results'
      ],
      duration: '2-10 minutes'
    };
  }

  /**
   * Conversation history management
   */
  getConversationHistory(sessionId) {
    return this.conversationHistory.get(sessionId) || [];
  }

  updateConversationHistory(sessionId, userMessage, assistantReply) {
    const history = this.conversationHistory.get(sessionId) || [];
    history.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantReply }
    );
    
    // Keep only last 10 exchanges to manage memory
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.conversationHistory.set(sessionId, history);
  }

  /**
   * Audit logging for compliance and safety monitoring
   */
  logInteraction(prompt, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sessionId: context.sessionId,
      userId: context.userId,
      prompt: prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt,
      provider: this.provider,
      crisisDetected: this.detectCrisisKeywords(prompt)
    };

    // In production, this should go to a secure audit log
    console.log('LLM Interaction:', logEntry);
  }

  /**
   * Clear conversation history (for privacy)
   */
  clearConversation(sessionId) {
    this.conversationHistory.delete(sessionId);
  }
}

// Export singleton instance
module.exports = new LLMService();