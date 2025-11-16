// services/interviewService.ts

export interface InterviewQuestion {
  id: string;
  text: string;
  category: 'experience' | 'scenario' | 'technical' | 'motivation';
  difficulty: 'easy' | 'medium' | 'hard';
  tips: string[];
}

export interface InterviewFeedback {
  score: number;
  clarity: number;
  confidence: number;
  relevance: number;
  feedback: string;
  improvements: string[];
}

export interface InterviewSession {
  id: string;
  questions: InterviewQuestion[];
  answers: { [questionId: string]: string };
  feedback: { [questionId: string]: InterviewFeedback };
  overallScore: number;
  startTime: Date;
  endTime?: Date;
}

// Questions d'interview pour l'aviation
const aviationQuestions: InterviewQuestion[] = [
  {
    id: '1',
    text: "Tell us about your previous experience in customer service and how it prepares you for a flight attendant role.",
    category: 'experience',
    difficulty: 'medium',
    tips: [
      "Focus on specific customer service experiences",
      "Relate skills to flight attendant responsibilities",
      "Mention handling difficult situations"
    ]
  },
  {
    id: '2',
    text: "How would you handle a passenger who is refusing to follow safety instructions?",
    category: 'scenario',
    difficulty: 'hard',
    tips: [
      "Emphasize safety as the top priority",
      "Describe de-escalation techniques",
      "Mention involving senior crew if necessary"
    ]
  },
  {
    id: '3',
    text: "Why do you want to work for our airline specifically?",
    category: 'motivation',
    difficulty: 'easy',
    tips: [
      "Research the airline's values and reputation",
      "Connect your personal values to the company",
      "Mention specific routes or services you admire"
    ]
  },
  {
    id: '4',
    text: "Describe a time you worked successfully in a team under pressure.",
    category: 'experience',
    difficulty: 'medium',
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on teamwork and communication",
      "Highlight positive outcomes"
    ]
  },
  {
    id: '5',
    text: "What do you know about emergency procedures on an aircraft?",
    category: 'technical',
    difficulty: 'hard',
    tips: [
      "Mention basic safety equipment locations",
      "Discuss evacuation procedures",
      "Emphasize the importance of following protocols"
    ]
  },
  {
    id: '6',
    text: "How would you assist a passenger with a fear of flying?",
    category: 'scenario',
    difficulty: 'medium',
    tips: [
      "Show empathy and understanding",
      "Describe calming techniques",
      "Mention providing information to reduce anxiety"
    ]
  },
  {
    id: '7',
    text: "Where do you see yourself in 5 years in the aviation industry?",
    category: 'motivation',
    difficulty: 'easy',
    tips: [
      "Show ambition but also commitment",
      "Mention potential career progression",
      "Connect to the airline's growth opportunities"
    ]
  },
  {
    id: '8',
    text: "What languages do you speak and how would that help in this role?",
    category: 'experience',
    difficulty: 'easy',
    tips: [
      "List all languages and proficiency levels",
      "Connect to passenger communication",
      "Mention cultural awareness benefits"
    ]
  }
];

// Démarrer une nouvelle session d'interview
export const startInterviewSession = async (questionCount: number = 5): Promise<InterviewSession> => {
  // Sélectionner des questions aléatoires
  const shuffled = [...aviationQuestions].sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, questionCount);

  return {
    id: `session_${Date.now()}`,
    questions: selectedQuestions,
    answers: {},
    feedback: {},
    overallScore: 0,
    startTime: new Date()
  };
};

// Analyser une réponse avec AI simulée
export const analyzeAnswer = async (
  question: InterviewQuestion,
  answer: string
): Promise<InterviewFeedback> => {
  // Simuler le traitement AI (1-2 secondes)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Générer un feedback basé sur la longueur et le contenu de la réponse
  const answerLength = answer.length;
  const hasKeywords = checkAnswerKeywords(question.category, answer);
  
  const baseScore = Math.min(100, Math.floor(answerLength / 3) + (hasKeywords ? 30 : 10) + Math.random() * 20);
  
  return {
    score: baseScore,
    clarity: Math.min(10, Math.floor(baseScore / 10)),
    confidence: Math.min(10, Math.floor((baseScore + 10) / 10)),
    relevance: Math.min(10, Math.floor((baseScore + 5) / 10)),
    feedback: generateFeedback(question.category, baseScore, answer),
    improvements: generateImprovements(question.category, baseScore)
  };
};

// Vérifier les mots-clés dans la réponse
const checkAnswerKeywords = (category: string, answer: string): boolean => {
  const keywords: { [key: string]: string[] } = {
    experience: ['experience', 'worked', 'team', 'customer', 'service', 'situation'],
    scenario: ['would', 'handle', 'safety', 'passenger', 'calm', 'professional'],
    technical: ['safety', 'emergency', 'procedures', 'equipment', 'evacuation'],
    motivation: ['passionate', 'values', 'career', 'growth', 'airline', 'dream']
  };
  
  const categoryKeywords = keywords[category] || [];
  return categoryKeywords.some(keyword => 
    answer.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Générer le feedback
const generateFeedback = (category: string, score: number, answer: string): string => {
  if (score >= 80) {
    const excellentFeedbacks = [
      "Excellent answer! You provided specific examples and demonstrated strong understanding.",
      "Outstanding response that shows great preparation and relevant experience.",
      "Very professional answer that addresses all aspects of the question effectively."
    ];
    return excellentFeedbacks[Math.floor(Math.random() * excellentFeedbacks.length)];
  } else if (score >= 60) {
    const goodFeedbacks = [
      "Good answer with solid points. Consider adding more specific examples.",
      "Well-structured response. Try to elaborate more on your experiences.",
      "Good foundation. Practice being more concise and focused in your delivery."
    ];
    return goodFeedbacks[Math.floor(Math.random() * goodFeedbacks.length)];
  } else {
    const needsWorkFeedbacks = [
      "This answer needs more depth and specific examples from your experience.",
      "Try to structure your answer more clearly and provide concrete examples.",
      "Consider practicing this type of question more to improve your response quality."
    ];
    return needsWorkFeedbacks[Math.floor(Math.random() * needsWorkFeedbacks.length)];
  }
};

// Générer les suggestions d'amélioration
const generateImprovements = (category: string, score: number): string[] => {
  const baseImprovements = [
    "Practice speaking more slowly and clearly",
    "Use the STAR method (Situation, Task, Action, Result) for experience questions",
    "Include specific metrics or outcomes when possible"
  ];

  const categoryImprovements: { [key: string]: string[] } = {
    experience: [
      "Provide more detailed examples from your work history",
      "Focus on transferable skills relevant to aviation",
      "Quantify your achievements when possible"
    ],
    scenario: [
      "Structure your answer: assess, act, follow-up",
      "Always prioritize safety in your responses",
      "Show empathy while maintaining professionalism"
    ],
    technical: [
      "Review basic aircraft safety procedures",
      "Familiarize yourself with common emergency equipment",
      "Understand crew coordination during emergencies"
    ],
    motivation: [
      "Research the specific airline's values and culture",
      "Connect your personal goals with company objectives",
      "Show long-term commitment to the industry"
    ]
  };

  return [
    ...baseImprovements.slice(0, 1 + Math.floor(Math.random() * 2)),
    ...(categoryImprovements[category] || []).slice(0, 1)
  ];
};

// Calculer le score global
export const calculateOverallScore = (feedback: { [questionId: string]: InterviewFeedback }): number => {
  const scores = Object.values(feedback).map(f => f.score);
  return scores.length > 0 
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
};