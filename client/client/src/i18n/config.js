import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        screening: 'Mental Health Screening',
        chat: 'AI Chat Support',
        booking: 'Book Appointment',
        forum: 'Community Forum',
        admin: 'Admin Dashboard'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Something went wrong',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        search: 'Search',
        filter: 'Filter',
        clear: 'Clear',
        of: 'of',
        navigate: 'Navigate'
      },
      // Home page
      home: {
        welcome: 'Welcome to Mann-Mitra Platform',
        subtitle: 'Your journey to better mental health starts here',
        getStarted: 'Get Started',
        features: {
          screening: 'Mental Health Assessment',
          chat: '24/7 AI Support',
          booking: 'Professional Counseling',
          forum: 'Community Support'
        }
      },
      // Auth
      auth: {
        login: 'Login',
        signup: 'Sign Up',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?'
      },
      // Screening
      screening: {
        title: 'Mental Health Screening',
        subtitle: 'This screening will help us understand how you\'ve been feeling',
        instructions: 'Please answer each question based on how you have been feeling over the past two weeks.',
        startScreening: 'Start Screening',
        questionProgress: 'Question {{current}} of {{total}}',
        previousQuestion: 'Previous Question',
        nextQuestion: 'Next Question',
        playAudio: 'Play question audio',
        pauseAudio: 'Pause audio',
        submitScreening: 'Submit Screening',
        completing: 'Completing screening...',
        progress: 'Progress',
        keyboardHint: 'Keyboard Shortcuts',
        selectAnswer: 'Select answer',
        instructions: {
          title: 'Instructions',
          description: 'Answer based on how you\'ve felt over the past 2 weeks'
        },
        keyboardHints: {
          title: 'Keyboard Shortcuts',
          options: 'Press 1-4 to select answers',
          next: 'Press Enter or → to continue',
          previous: 'Press ← to go back',
          audio: 'Press Space to play/pause audio'
        },
        phq9: {
          title: 'PHQ-9 Depression Screening',
          instruction: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
          questions: {
            q1: 'Little interest or pleasure in doing things',
            q2: 'Feeling down, depressed, or hopeless',
            q3: 'Trouble falling or staying asleep, or sleeping too much',
            q4: 'Feeling tired or having little energy',
            q5: 'Poor appetite or overeating',
            q6: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down',
            q7: 'Trouble concentrating on things, such as reading the newspaper or watching television',
            q8: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
            q9: 'Thoughts that you would be better off dead, or of hurting yourself in some way'
          },
          answers: {
            0: 'Not at all',
            1: 'Several days',
            2: 'More than half the days',
            3: 'Nearly every day'
          },
          results: {
            minimal: 'Minimal Depression',
            mild: 'Mild Depression',
            moderate: 'Moderate Depression',
            moderatelySevere: 'Moderately Severe Depression',
            severe: 'Severe Depression'
          }
        }
      },
      // Crisis Management
      crisis: {
        immediate: {
          title: 'Immediate Crisis Support',
          subtitle: 'Your safety is our priority',
          message: 'Your responses indicate you may be experiencing thoughts of self-harm. Please reach out for immediate support.'
        },
        escalation: {
          title: 'Crisis Support Available',
          subtitle: 'Additional support recommended',
          message: 'Your responses suggest you may benefit from additional mental health support and crisis resources.'
        },
        contactCounselor: 'Connect with Counselor Now',
        contactingCounselor: 'Connecting...',
        contactCounselorDesc: 'Speak with a trained mental health professional immediately',
        emergencyContacts: 'Emergency Support Resources',
        contacts: {
          suicidePrevention: 'National Suicide Prevention Lifeline',
          suicidePreventionDesc: '24/7 crisis support and suicide prevention',
          crisisText: 'Crisis Text Line',
          crisisTextDesc: 'Free, 24/7 support via text message',
          emergency: 'Emergency Services',
          emergencyDesc: 'For immediate life-threatening emergencies',
          mentalHealthHotline: 'SAMHSA Mental Health Hotline',
          mentalHealthHotlineDesc: 'Treatment referral and information service'
        },
        safetyResources: {
          title: 'Immediate Safety Steps',
          stayWith: 'Stay with someone you trust',
          removeHarmful: 'Remove any harmful objects from your environment',
          seekImmediate: 'Seek immediate professional help',
          followUp: 'Follow up with a mental health professional'
        },
        acknowledgeAndContinue: 'I understand and want to continue',
        viewMoreResources: 'View More Resources',
        disclaimer: 'This screening is not a substitute for professional medical advice, diagnosis, or treatment.'
      },
      // Chat
      chat: {
        title: 'AI First-Aid Chat',
        aiFirstAid: 'AI Mental Health First-Aid',
        online: 'Online',
        offline: 'Offline',
        system: 'System',
        aiAssistant: 'AI Assistant',
        welcomeMessage: 'Hello! I\'m your AI mental health first-aid assistant. I\'m here to provide immediate support and coping strategies. How are you feeling today?',
        inputPlaceholder: 'Type your message here...',
        inputLabel: 'Chat message input',
        sendMessage: 'Send message',
        connectionError: 'Connection error. Please check your internet connection.',
        sendError: 'Failed to send message. Please try again.',
        connectionLost: 'Connection lost. Trying to reconnect...',
        counselorContacted: 'A counselor has been notified and will contact you shortly. Please stay safe.',
        actions: {
          breathing_exercise: '🌬️ Breathing Exercise',
          grounding_technique: '🌱 Grounding Technique',
          crisis_escalation: '🚨 Get Help Now',
          grounding_5things: '👀 5 Things I Can See',
          grounding_4things: '👂 4 Things I Can Hear',
          grounding_3things: '👋 3 Things I Can Touch'
        },
        breathingExercise: {
          instruction: 'Let\'s do a breathing exercise together. This can help you feel calmer and more centered.',
          steps: 'Follow the breathing pattern',
          cycle: 'Breathe in for 4 seconds → Hold for 4 seconds → Breathe out for 6 seconds'
        },
        grounding: {
          instruction: 'Let\'s try a grounding technique to help you feel more present and connected to the moment. Choose one of the exercises below:'
        }
      },
      // Booking
      booking: {
        title: 'Book Appointment',
        subtitle: 'Schedule a session with one of our licensed mental health professionals',
        steps: {
          selectCounsellor: 'Select Counsellor',
          selectSlot: 'Select Slot',
          confirmBooking: 'Confirm Booking'
        },
        selectCounsellor: {
          title: 'Choose Your Counsellor'
        },
        selectSlot: {
          title: 'Select Available Slot',
          counsellor: 'Counsellor'
        },
        confirmBooking: {
          title: 'Confirm Your Booking',
          button: 'Confirm Booking'
        },
        summary: {
          title: 'Booking Summary',
          counsellor: 'Counsellor',
          date: 'Date',
          time: 'Time',
          duration: 'Duration'
        },
        privateNotes: {
          label: 'Private Notes (Optional)',
          description: 'These notes will be encrypted and only visible to your counsellor',
          placeholder: 'Share any specific concerns or topics you\'d like to discuss...'
        },
        loading: {
          counsellors: 'Loading counsellors...',
          slots: 'Loading available slots...'
        },
        noCounsellors: {
          title: 'No Counsellors Available',
          message: 'Please try again later or contact support for assistance.'
        },
        noSlots: {
          title: 'No Available Slots',
          message: 'This counsellor has no available slots at the moment. Please try another counsellor.'
        },
        errors: {
          loadCounsellors: 'Failed to load counsellors. Please try again.',
          loadSlots: 'Failed to load available slots. Please try again.',
          bookingFailed: 'Failed to create booking. Please try again.'
        },
        success: {
          title: 'Booking Confirmed!',
          message: 'Your appointment has been successfully booked. You will receive a confirmation email shortly.',
          autoRedirect: 'Returning to booking page in a few seconds...'
        },
        minutes: 'minutes',
        yearsExperience: 'years experience',
        confirming: 'Confirming...'
      },
      // Forum
      forum: {
        title: 'Community Forum',
        subtitle: 'Connect with others, share experiences, and find support in our safe community space',
        anonymousNote: 'All posts are anonymous to protect your privacy',
        newPost: 'New Post',
        anonymous: 'Anonymous',
        stats: {
          totalThreads: '{{count}} threads',
          page: 'Page {{current}} of {{total}}'
        },
        timeAgo: {
          justNow: 'Just now',
          hoursAgo: '{{count}} hours ago',
          yesterday: 'Yesterday'
        },
        replies: '{{count}} replies',
        categories: {
          general: 'General Discussion',
          depression: 'Depression',
          anxiety: 'Anxiety',
          stress: 'Stress Management',
          relationships: 'Relationships',
          academic: 'Academic Pressure',
          family: 'Family Issues',
          workplace: 'Workplace Stress',
          self_help: 'Self-Help',
          support: 'Peer Support'
        },
        loading: {
          threads: 'Loading threads...'
        },
        noThreads: {
          title: 'No Discussions Yet',
          message: 'Be the first to start a conversation in our community',
          createFirst: 'Create First Post'
        },
        newPost: {
          title: 'Create New Post',
          category: 'Category',
          selectCategory: 'Select a category',
          titleLabel: 'Title',
          titlePlaceholder: 'What would you like to discuss?',
          contentLabel: 'Content',
          contentPlaceholder: 'Share your thoughts, experiences, or questions...',
          moderationNotice: 'Your post will be reviewed by moderators before being published',
          submitting: 'Submitting...',
          submit: 'Submit Post'
        },
        errors: {
          loadThreads: 'Failed to load threads. Please try again.',
          emptyFields: 'Please fill in all required fields.',
          postFailed: 'Failed to create post. Please try again.'
        }
      },
      // Moderator
      moderator: {
        title: 'Moderation Console',
        subtitle: 'Review and moderate community posts',
        refresh: 'Refresh',
        actionRequired: 'Action Required',
        stats: {
          pending: 'Pending Review',
          approved: 'Approved',
          rejected: 'Rejected',
          todayProcessed: 'Processed Today',
          totalPendingPosts: '{{count}} pending posts',
          page: 'Page {{current}} of {{total}}'
        },
        actions: {
          approve: 'Approve',
          reject: 'Reject'
        },
        loading: {
          posts: 'Loading pending posts...'
        },
        noPendingPosts: {
          title: 'No Pending Posts',
          message: 'All posts have been reviewed. Great job!'
        },
        moderation: {
          approveTitle: 'Approve Post',
          rejectTitle: 'Reject Post',
          reasonLabel: 'Moderation Reason',
          reasonPlaceholder: 'Provide a reason for your decision...',
          processing: 'Processing...'
        },
        accessDenied: {
          title: 'Access Denied',
          message: 'You do not have permission to access the moderation console.'
        },
        errors: {
          accessDenied: 'Access denied. You must be a moderator to view this page.',
          checkRole: 'Unable to verify your role. Please try again.',
          loadPosts: 'Failed to load pending posts. Please try again.',
          reasonRequired: 'Please provide a reason for your decision.',
          moderationFailed: 'Failed to process moderation decision. Please try again.'
        }
      },
      // Admin Dashboard
      adminDashboard: {
        title: 'Admin Dashboard',
        subtitle: 'Monitor system health and user analytics',
        refresh: 'Refresh',
        export: 'Export CSV',
        dateFilters: {
          last7days: 'Last 7 days',
          last30days: 'Last 30 days',
          last90days: 'Last 90 days',
          lastYear: 'Last year'
        },
        stats: {
          totalUsers: 'Total Users',
          totalScreenings: 'Total Screenings',
          averageScore: 'Average Score',
          completionRate: 'Completion Rate',
          registeredUsers: 'Registered users',
          phqAssessments: 'PHQ-9 assessments',
          phqAverage: 'PHQ-9 average',
          assessmentCompletion: 'Assessment completion'
        },
        charts: {
          severityDistribution: 'PHQ-9 Severity Distribution',
          dailyTrend: 'Daily Screenings Trend',
          started: 'Started',
          completed: 'Completed'
        },
        urgentAlerts: {
          title: 'Urgent/Crisis Alerts',
          subtitle: 'High-priority screenings requiring immediate attention',
          columns: {
            userId: 'User ID',
            score: 'Score',
            severity: 'Severity',
            created: 'Created',
            timeToResponse: 'Time to Response',
            status: 'Status'
          },
          noAlerts: 'No urgent alerts',
          allAddressed: 'All high-priority cases have been addressed',
          pending: 'Pending'
        },
        severity: {
          minimal: 'None-Minimal (0-4)',
          mild: 'Mild (5-9)',
          moderate: 'Moderate (10-14)',
          moderatelySevere: 'Moderately Severe (15-19)',
          severe: 'Severe (20-27)'
        },
        loading: 'Loading dashboard data...',
        errors: {
          loadFailed: 'Failed to load dashboard data. Please try again.'
        }
      }
    }
  },
  hi: {
    translation: {
      // Navigation
      nav: {
        home: 'होम',
        screening: 'मानसिक स्वास्थ्य स्क्रीनिंग',
        chat: 'AI चैट सहायता',
        booking: 'अपॉइंटमेंट बुक करें',
        forum: 'कम्युनिटी फोरम',
        admin: 'एडमिन डैशबोर्ड'
      },
      // Common
      common: {
        loading: 'लोड हो रहा है...',
        error: 'कुछ गलत हुआ',
        submit: 'जमा करें',
        cancel: 'रद्द करें',
        save: 'सेव करें',
        delete: 'डिलीट करें',
        edit: 'संपादित करें',
        back: 'वापस',
        next: 'अगला',
        previous: 'पिछला',
        search: 'खोजें',
        filter: 'फिल्टर',
        clear: 'क्लियर',
        of: 'का',
        navigate: 'नेविगेट'
      },
      // Home page
      home: {
        welcome: 'Mann-Mitra प्लेटफॉर्म में आपका स्वागत है',
        subtitle: 'बेहतर मानसिक स्वास्थ्य की आपकी यात्रा यहां से शुरू होती है',
        getStarted: 'शुरू करें',
        features: {
          screening: 'मानसिक स्वास्थ्य आकलन',
          chat: '24/7 AI सहायता',
          booking: 'पेशेवर परामर्श',
          forum: 'कम्युनिटी सहायता'
        }
      },
      // Auth
      auth: {
        login: 'लॉगिन',
        signup: 'साइन अप',
        logout: 'लॉगआउट',
        email: 'ईमेल',
        password: 'पासवर्ड',
        forgotPassword: 'पासवर्ड भूल गए?',
        noAccount: "खाता नहीं है?",
        haveAccount: 'पहले से खाता है?'
      },
      // Screening
      screening: {
        title: 'मानसिक स्वास्थ्य स्क्रीनिंग',
        subtitle: 'यह स्क्रीनिंग हमें यह समझने में मदद करेगी कि आप कैसा महसूस कर रहे हैं',
        instructions: 'कृपया प्रत्येक प्रश्न का उत्तर इस आधार पर दें कि आप पिछले दो सप्ताह में कैसा महसूस कर रहे हैं।',
        startScreening: 'स्क्रीनिंग शुरू करें',
        questionProgress: 'प्रश्न {{current}} का {{total}}',
        previousQuestion: 'पिछला प्रश्न',
        nextQuestion: 'अगला प्रश्न',
        playAudio: 'प्रश्न ऑडियो चलाएं',
        pauseAudio: 'ऑडियो रोकें',
        submitScreening: 'स्क्रीनिंग जमा करें',
        completing: 'स्क्रीनिंग पूरी कर रहे हैं...',
        progress: 'प्रगति',
        keyboardHint: 'कीबोर्ड शॉर्टकट',
        selectAnswer: 'उत्तर चुनें',
        instructions: {
          title: 'निर्देश',
          description: 'पिछले 2 सप्ताह में आपने कैसा महसूस किया है, इसके आधार पर उत्तर दें'
        },
        keyboardHints: {
          title: 'कीबोर्ड शॉर्टकट',
          options: 'उत्तर चुनने के लिए 1-4 दबाएं',
          next: 'जारी रखने के लिए Enter या → दबाएं',
          previous: 'वापस जाने के लिए ← दबाएं',
          audio: 'ऑडियो चलाने/रोकने के लिए Space दबाएं'
        },
        phq9: {
          title: 'PHQ-9 अवसाद स्क्रीनिंग',
          instruction: 'पिछले 2 सप्ताह में, आप निम्नलिखित समस्याओं से कितनी बार परेशान हुए हैं?',
          questions: {
            q1: 'काम करने में कम रुचि या खुशी',
            q2: 'उदास, अवसादग्रस्त, या निराश महसूस करना',
            q3: 'सोने में परेशानी या बहुत ज्यादा सोना',
            q4: 'थकान महसूस करना या कम ऊर्जा होना',
            q5: 'भूख न लगना या बहुत ज्यादा खाना',
            q6: 'अपने बारे में बुरा महसूस करना - या यह कि आप असफल हैं या आपने अपने या अपने परिवार को निराश किया है',
            q7: 'अखबार पढ़ने या टेलीविजन देखने जैसी चीजों पर ध्यान केंद्रित करने में परेशानी',
            q8: 'इतनी धीमी गति से चलना या बोलना कि दूसरे लोग देख सकें। या इसके विपरीत - इतना बेचैन या परेशान होना कि आप सामान्य से कहीं अधिक घूम रहे हैं',
            q9: 'यह विचार कि आप मर जाएं तो बेहतर होगा, या किसी तरह से खुद को नुकसान पहुंचाने के विचार'
          },
          answers: {
            0: 'बिल्कुल नहीं',
            1: 'कई दिन',
            2: 'आधे से अधिक दिन',
            3: 'लगभग हर दिन'
          },
          results: {
            minimal: 'न्यूनतम अवसाद',
            mild: 'हल्का अवसाद',
            moderate: 'मध्यम अवसाद',
            moderatelySevere: 'मध्यम से गंभीर अवसाद',
            severe: 'गंभीर अवसाद'
          }
        }
      },
      // Crisis Management
      crisis: {
        immediate: {
          title: 'तत्काल संकट सहायता',
          subtitle: 'आपकी सुरक्षा हमारी प्राथमिकता है',
          message: 'आपके उत्तर बताते हैं कि आप स्वयं को नुकसान पहुंचाने के विचारों का अनुभव कर रहे हैं। कृपया तत्काल सहायता लें।'
        },
        escalation: {
          title: 'संकट सहायता उपलब्ध',
          subtitle: 'अतिरिक्त सहायता की सिफारिश',
          message: 'आपके उत्तर सुझाते हैं कि आपको अतिरिक्त मानसिक स्वास्थ्य सहायता और संकट संसाधनों से लाभ हो सकता है।'
        },
        contactCounselor: 'अभी परामर्शदाता से संपर्क करें',
        contactingCounselor: 'कनेक्ट कर रहे हैं...',
        contactCounselorDesc: 'तुरंत एक प्रशिक्षित मानसिक स्वास्थ्य पेशेवर से बात करें',
        emergencyContacts: 'आपातकालीन सहायता संसाधन',
        contacts: {
          suicidePrevention: 'राष्ट्रीय आत्महत्या रोकथाम लाइफलाइन',
          suicidePreventionDesc: '24/7 संकट सहायता और आत्महत्या रोकथाम',
          crisisText: 'संकट टेक्स्ट लाइन',
          crisisTextDesc: 'टेक्स्ट संदेश के माध्यम से मुफ्त, 24/7 सहायता',
          emergency: 'आपातकालीन सेवाएं',
          emergencyDesc: 'तत्काल जीवन-घातक आपातकाल के लिए',
          mentalHealthHotline: 'SAMHSA मानसिक स्वास्थ्य हॉटलाइन',
          mentalHealthHotlineDesc: 'उपचार रेफरल और सूचना सेवा'
        },
        safetyResources: {
          title: 'तत्काल सुरक्षा कदम',
          stayWith: 'किसी विश्वसनीय व्यक्ति के साथ रहें',
          removeHarmful: 'अपने वातावरण से कोई भी हानिकारक वस्तु हटाएं',
          seekImmediate: 'तत्काल पेशेवर सहायता लें',
          followUp: 'मानसिक स्वास्थ्य पेशेवर से फॉलो अप करें'
        },
        acknowledgeAndContinue: 'मैं समझता हूं और आगे बढ़ना चाहता हूं',
        viewMoreResources: 'अधिक संसाधन देखें',
        disclaimer: 'यह स्क्रीनिंग पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।'
      },
      // Chat
      chat: {
        title: 'AI प्राथमिक चिकित्सा चैट',
        aiFirstAid: 'AI मानसिक स्वास्थ्य प्राथमिक चिकित्सा',
        online: 'ऑनलाइन',
        offline: 'ऑफलाइन',
        system: 'सिस्टम',
        aiAssistant: 'AI सहायक',
        welcomeMessage: 'नमस्ते! मैं आपका AI मानसिक स्वास्थ्य प्राथमिक चिकित्सा सहायक हूं। मैं तत्काल सहायता और मुकाबला करने की रणनीतियां प्रदान करने के लिए यहां हूं। आज आप कैसा महसूस कर रहे हैं?',
        inputPlaceholder: 'यहां अपना संदेश टाइप करें...',
        inputLabel: 'चैट संदेश इनपुट',
        sendMessage: 'संदेश भेजें',
        connectionError: 'कनेक्शन त्रुटि। कृपया अपना इंटरनेट कनेक्शन जांचें।',
        sendError: 'संदेश भेजने में विफल। कृपया पुनः प्रयास करें।',
        connectionLost: 'कनेक्शन खो गया। पुनः कनेक्ट करने की कोशिश कर रहे हैं...',
        counselorContacted: 'एक परामर्शदाता को सूचित कर दिया गया है और वे जल्द ही आपसे संपर्क करेंगे। कृपया सुरक्षit रहें।',
        actions: {
          breathing_exercise: '🌬️ सांस लेने का अभ्यास',
          grounding_technique: '🌱 ग्राउंडिंग तकनीक',
          crisis_escalation: '🚨 अभी मदद लें',
          grounding_5things: '👀 5 चीजें जो मैं देख सकता हूं',
          grounding_4things: '👂 4 चीजें जो मैं सुन सकता हूं',
          grounding_3things: '👋 3 चीजें जिन्हें मैं छू सकता हूं'
        },
        breathingExercise: {
          instruction: 'आइए एक साथ सांस लेने का अभ्यास करते हैं। यह आपको शांत और अधिक केंद्रित महसूस करने में मदद कर सकता है।',
          steps: 'सांस लेने के पैटर्न का अनुसरण करें',
          cycle: '4 सेकंड के लिए सांस लें → 4 सेकंड के लिए रोकें → 6 सेकंड के लिए सांस छोड़ें'
        },
        grounding: {
          instruction: 'आइए एक ग्राउंडिंग तकनीक का उपयोग करते हैं जो आपको अधिक उपस्थित और क्षण से जुड़ा हुआ महसूस करने में मदद करेगी। नीचे दिए गए अभ्यासों में से एक चुनें:'
        }
      },
      // Booking
      booking: {
        title: 'अपॉइंटमेंट बुक करें',
        subtitle: 'हमारे लाइसेंसशुदा मानसिक स्वास्थ्य पेशेवरों के साथ एक सत्र शेड्यूल करें',
        steps: {
          selectCounsellor: 'परामर्शदाता चुनें',
          selectSlot: 'स्लॉट चुनें',
          confirmBooking: 'बुकिंग की पुष्टि करें'
        },
        selectCounsellor: {
          title: 'अपना परामर्शदाता चुनें'
        },
        selectSlot: {
          title: 'उपलब्ध स्लॉट चुनें',
          counsellor: 'परामर्शदाता'
        },
        confirmBooking: {
          title: 'अपनी बुकिंग की पुष्टि करें',
          button: 'बुकिंग की पुष्टि करें'
        },
        summary: {
          title: 'बुकिंग सारांश',
          counsellor: 'परामर्शदाता',
          date: 'तारीख',
          time: 'समय',
          duration: 'अवधि'
        },
        privateNotes: {
          label: 'निजी नोट्स (वैकल्पिक)',
          description: 'ये नोट्स एन्क्रिप्टेड होंगे और केवल आपके परामर्शदाता को दिखाई देंगे',
          placeholder: 'कोई विशिष्ट चिंता या विषय साझा करें जिस पर आप चर्चा करना चाहते हैं...'
        },
        loading: {
          counsellors: 'परामर्शदाता लोड हो रहे हैं...',
          slots: 'उपलब्ध स्लॉट लोड हो रहे हैं...'
        },
        noCounsellors: {
          title: 'कोई परामर्शदाता उपलब्ध नहीं',
          message: 'कृपया बाद में पुनः प्रयास करें या सहायता के लिए संपर्क करें।'
        },
        noSlots: {
          title: 'कोई उपलब्ध स्लॉट नहीं',
          message: 'इस परामर्शदाता के पास इस समय कोई उपलब्ध स्लॉट नहीं है। कृपया दूसरा परामर्शदाता आज़माएं।'
        },
        errors: {
          loadCounsellors: 'परामर्शदाता लोड करने में विफल। कृपया पुनः प्रयास करें।',
          loadSlots: 'उपलब्ध स्लॉट लोड करने में विफल। कृपया पुनः प्रयास करें।',
          bookingFailed: 'बुकिंग बनाने में विफल। कृपया पुनः प्रयास करें।'
        },
        success: {
          title: 'बुकिंग की पुष्टि हो गई!',
          message: 'आपकी अपॉइंटमेंट सफलतापूर्वक बुक हो गई है। आपको जल्द ही एक पुष्टिकरण ईमेल प्राप्त होगा।',
          autoRedirect: 'कुछ सेकंड में बुकिंग पेज पर वापस आ रहे हैं...'
        },
        minutes: 'मिनट',
        yearsExperience: 'साल का अनुभव',
        confirming: 'पुष्टि कर रहे हैं...'
      },
      // Forum
      forum: {
        title: 'सामुदायिक मंच',
        subtitle: 'दूसरों से जुड़ें, अनुभव साझा करें, और हमारे सुरक्षित समुदायिक स्थान में सहायता पाएं',
        anonymousNote: 'आपकी गोपनीयता की सुरक्षा के लिए सभी पोस्ट गुमनाम हैं',
        newPost: 'नई पोस्ट',
        anonymous: 'गुमनाम',
        stats: {
          totalThreads: '{{count}} चर्चाएं',
          page: 'पृष्ठ {{current}} / {{total}}'
        },
        timeAgo: {
          justNow: 'अभी',
          hoursAgo: '{{count}} घंटे पहले',
          yesterday: 'कल'
        },
        replies: '{{count}} उत्तर',
        categories: {
          general: 'सामान्य चर्चा',
          depression: 'अवसाद',
          anxiety: 'चिंता',
          stress: 'तनाव प्रबंधन',
          relationships: 'रिश्ते',
          academic: 'शैक्षणिक दबाव',
          family: 'पारिवारिक समस्याएं',
          workplace: 'कार्यक्षेत्र का तनाव',
          self_help: 'स्व-सहायता',
          support: 'साथी समर्थन'
        },
        loading: {
          threads: 'चर्चाएं लोड हो रही हैं...'
        },
        noThreads: {
          title: 'अभी तक कोई चर्चा नहीं',
          message: 'हमारे समुदाय में बातचीत शुरू करने वाले पहले व्यक्ति बनें',
          createFirst: 'पहली पोस्ट बनाएं'
        },
        newPost: {
          title: 'नई पोस्ट बनाएं',
          category: 'श्रेणी',
          selectCategory: 'एक श्रेणी चुनें',
          titleLabel: 'शीर्षक',
          titlePlaceholder: 'आप क्या चर्चा करना चाहते हैं?',
          contentLabel: 'सामग्री',
          contentPlaceholder: 'अपने विचार, अनुभव, या प्रश्न साझा करें...',
          moderationNotice: 'प्रकाशित होने से पहले आपकी पोस्ट की मॉडरेटर द्वारा समीक्षा की जाएगी',
          submitting: 'सबमिट की जा रही है...',
          submit: 'पोस्ट सबमिट करें'
        },
        errors: {
          loadThreads: 'चर्चाएं लोड करने में विफल। कृपया पुनः प्रयास करें।',
          emptyFields: 'कृपया सभी आवश्यक फ़ील्ड भरें।',
          postFailed: 'पोस्ट बनाने में विफल। कृपया पुनः प्रयास करें।'
        }
      },
      // Moderator
      moderator: {
        title: 'मॉडरेशन कंसोल',
        subtitle: 'सामुदायिक पोस्ट की समीक्षा और मॉडरेशन करें',
        refresh: 'रिफ्रेश',
        actionRequired: 'कार्रवाई आवश्यक',
        stats: {
          pending: 'समीक्षा के लिए लंबित',
          approved: 'अनुमोदित',
          rejected: 'अस्वीकृत',
          todayProcessed: 'आज प्रसंस्कृत',
          totalPendingPosts: '{{count}} लंबित पोस्ट',
          page: 'पृष्ठ {{current}} / {{total}}'
        },
        actions: {
          approve: 'अनुमोदित करें',
          reject: 'अस्वीकार करें'
        },
        loading: {
          posts: 'लंबित पोस्ट लोड हो रही हैं...'
        },
        noPendingPosts: {
          title: 'कोई लंबित पोस्ट नहीं',
          message: 'सभी पोस्ट की समीक्षा हो गई है। बहुत बढ़िया काम!'
        },
        moderation: {
          approveTitle: 'पोस्ट अनुमोदित करें',
          rejectTitle: 'पोस्ट अस्वीकार करें',
          reasonLabel: 'मॉडरेशन कारण',
          reasonPlaceholder: 'अपने निर्णय के लिए कारण प्रदान करें...',
          processing: 'प्रसंस्करण...'
        },
        accessDenied: {
          title: 'पहुंच मना',
          message: 'आपको मॉडरेशन कंसोल तक पहुंचने की अनुमति नहीं है।'
        },
        errors: {
          accessDenied: 'पहुंच मना। इस पृष्ठ को देखने के लिए आपको मॉडरेटर होना चाहिए।',
          checkRole: 'आपकी भूमिका की पुष्टि करने में असमर्थ। कृपया पुनः प्रयास करें।',
          loadPosts: 'लंबित पोस्ट लोड करने में विफल। कृपया पुनः प्रयास करें।',
          reasonRequired: 'कृपया अपने निर्णय के लिए कारण प्रदान करें।',
          moderationFailed: 'मॉडरेशन निर्णय को प्रसंस्कृत करने में विफल। कृपया पुनः प्रयास करें।'
        }
      },
      // Admin Dashboard
      adminDashboard: {
        title: 'एडमिन डैशबोर्ड',
        subtitle: 'सिस्टम स्वास्थ्य और उपयोगकर्ता विश्लेषण की निगरानी करें',
        refresh: 'रिफ्रेश',
        export: 'CSV निर्यात करें',
        dateFilters: {
          last7days: 'पिछले 7 दिन',
          last30days: 'पिछले 30 दिन',
          last90days: 'पिछले 90 दिन',
          lastYear: 'पिछला साल'
        },
        stats: {
          totalUsers: 'कुल उपयोगकर्ता',
          totalScreenings: 'कुल स्क्रीनिंग',
          averageScore: 'औसत स्कोर',
          completionRate: 'पूर्णता दर',
          registeredUsers: 'पंजीकृत उपयोगकर्ता',
          phqAssessments: 'PHQ-9 मूल्यांकन',
          phqAverage: 'PHQ-9 औसत',
          assessmentCompletion: 'मूल्यांकन पूर्णता'
        },
        charts: {
          severityDistribution: 'PHQ-9 गंभीरता वितरण',
          dailyTrend: 'दैनिक स्क्रीनिंग प्रवृत्ति',
          started: 'शुरू किया गया',
          completed: 'पूर्ण किया गया'
        },
        urgentAlerts: {
          title: 'तत्काल/संकट अलर्ट',
          subtitle: 'तत्काल ध्यान देने की आवश्यकता वाली उच्च-प्राथमिकता स्क्रीनिंग',
          columns: {
            userId: 'उपयोगकर्ता ID',
            score: 'स्कोर',
            severity: 'गंभीरता',
            created: 'बनाया गया',
            timeToResponse: 'प्रतिक्रिया का समय',
            status: 'स्थिति'
          },
          noAlerts: 'कोई तत्काल अलर्ट नहीं',
          allAddressed: 'सभी उच्च-प्राथमिकता मामलों को संबोधित किया गया है',
          pending: 'लंबित'
        },
        severity: {
          minimal: 'कोई नहीं-न्यूनतम (0-4)',
          mild: 'हल्का (5-9)',
          moderate: 'मध्यम (10-14)',
          moderatelySevere: 'मध्यम रूप से गंभीर (15-19)',
          severe: 'गंभीर (20-27)'
        },
        loading: 'डैशबोर्ड डेटा लोड हो रहा है...',
        errors: {
          loadFailed: 'डैशबोर्ड डेटा लोड करने में विफल। कृपया पुनः प्रयास करें।'
        }
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    keySeparator: '.',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

export default i18n