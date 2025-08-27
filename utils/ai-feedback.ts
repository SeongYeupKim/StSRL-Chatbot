import { SRLComponent, SRLFeedback } from '@/types/srl';
import { getPromptById } from '@/data/prompts';

interface FeedbackTemplate {
  metacognition: {
    positive: string[];
    constructive: string[];
    suggestions: string[];
  };
  strategy: {
    positive: string[];
    constructive: string[];
    suggestions: string[];
  };
  motivation: {
    positive: string[];
    constructive: string[];
    suggestions: string[];
  };
  content: {
    positive: string[];
    constructive: string[];
    suggestions: string[];
  };
  management: {
    positive: string[];
    constructive: string[];
    suggestions: string[];
  };
}

const feedbackTemplates: FeedbackTemplate = {
  metacognition: {
    positive: [
      "Excellent metacognitive awareness! You're showing strong self-reflection skills.",
      "Great job monitoring your understanding. This kind of self-awareness is key to effective learning.",
      "Your ability to reflect on your learning process demonstrates strong metacognitive skills."
    ],
    constructive: [
      "Consider spending more time reflecting on your learning process.",
      "Try to be more specific about what you understand and what you don't.",
      "Practice asking yourself 'why' questions about your learning."
    ],
    suggestions: [
      "Keep a learning journal to track your understanding",
      "Use the 'think-aloud' method when studying",
      "Regularly assess your comprehension before moving forward"
    ]
  },
  strategy: {
    positive: [
      "You're using effective learning strategies! This shows good strategic thinking.",
      "Great choice of study methods. You're actively engaging with the material.",
      "Your strategic approach to learning is well-developed."
    ],
    constructive: [
      "Consider trying some new study strategies to enhance your learning.",
      "Think about how you can make your study sessions more active.",
      "Reflect on which strategies work best for different types of content."
    ],
    suggestions: [
      "Try spaced repetition for better retention",
      "Use elaboration techniques like explaining concepts to others",
      "Practice interleaving different topics during study sessions"
    ]
  },
  motivation: {
    positive: [
      "Your motivation and confidence are strong! This positive mindset will help you succeed.",
      "Great attitude toward learning. Your enthusiasm is a valuable asset.",
      "You're showing excellent self-efficacy and growth mindset."
    ],
    constructive: [
      "Consider what aspects of the course you find most interesting.",
      "Try to connect the material to your personal goals and interests.",
      "Remember that challenges are opportunities for growth."
    ],
    suggestions: [
      "Set specific, achievable learning goals",
      "Reward yourself for progress and effort",
      "Connect course material to your future career or interests"
    ]
  },
  content: {
    positive: [
      "Excellent content understanding! You're making meaningful connections.",
      "Great job connecting new concepts to your existing knowledge.",
      "Your grasp of the material shows deep learning."
    ],
    constructive: [
      "Try to make more connections between different concepts.",
      "Consider how this material relates to real-world applications.",
      "Think about how this content fits into the bigger picture."
    ],
    suggestions: [
      "Create concept maps to visualize relationships",
      "Apply concepts to real-world scenarios",
      "Teach the material to someone else to test your understanding"
    ]
  },
  management: {
    positive: [
      "Excellent time management and organization! You're using your resources effectively.",
      "Great planning and preparation. Your systematic approach will pay off.",
      "You're showing strong self-regulation in managing your learning environment."
    ],
    constructive: [
      "Consider creating a more structured study schedule.",
      "Think about how you can optimize your study environment.",
      "Try to plan ahead more to avoid last-minute cramming."
    ],
    suggestions: [
      "Use a planner or digital calendar for study sessions",
      "Create a dedicated study space free from distractions",
      "Break large tasks into smaller, manageable chunks"
    ]
  }
};

export function generateFeedback(
  promptId: string,
  response: string,
  component: SRLComponent
): SRLFeedback {
  const prompt = getPromptById(promptId);
  if (!prompt) {
    throw new Error(`Prompt with id ${promptId} not found`);
  }

  // Analyze response based on component type
  const responseAnalysis = analyzeResponse(response, component);
  
  // Select appropriate feedback template
  const template = feedbackTemplates[component];
  
  // Generate feedback based on analysis
  let feedback = '';
  let suggestions: string[] = [];
  
  if (responseAnalysis.isPositive) {
    feedback = template.positive[Math.floor(Math.random() * template.positive.length)];
    suggestions = template.suggestions.slice(0, 2); // Take first 2 suggestions
  } else {
    feedback = template.constructive[Math.floor(Math.random() * template.constructive.length)];
    suggestions = template.suggestions; // Take all suggestions for improvement
  }

  // Generate next steps
  const nextSteps = generateNextSteps(component, prompt.week);

  return {
    promptId,
    response,
    feedback,
    suggestions,
    nextSteps
  };
}

function analyzeResponse(response: string, component: SRLComponent): { isPositive: boolean } {
  // Simple analysis based on response length and content
  // In a real implementation, this would use more sophisticated NLP
  
  const responseLength = response.length;
  const hasKeywords = response.toLowerCase().includes('understand') || 
                     response.toLowerCase().includes('learn') ||
                     response.toLowerCase().includes('improve') ||
                     response.toLowerCase().includes('practice');
  
  // For now, use simple heuristics
  if (component === 'metacognition') {
    return { isPositive: responseLength > 20 && hasKeywords };
  } else if (component === 'strategy') {
    return { isPositive: responseLength > 15 };
  } else if (component === 'motivation') {
    return { isPositive: responseLength > 10 && !response.toLowerCase().includes('no') };
  } else if (component === 'content') {
    return { isPositive: responseLength > 25 };
  } else {
    return { isPositive: responseLength > 10 };
  }
}

function generateNextSteps(component: SRLComponent, week: number): string[] {
  const baseSteps = [
    "Continue reflecting on your learning process",
    "Try implementing the suggested strategies",
    "Monitor your progress over the next week"
  ];

  const componentSteps = {
    metacognition: [
      "Practice self-questioning while studying",
      "Keep a learning reflection journal",
      "Set specific learning goals for next week"
    ],
    strategy: [
      "Experiment with one new study strategy",
      "Evaluate the effectiveness of your current methods",
      "Adapt your strategies based on the content type"
    ],
    motivation: [
      "Connect course material to your personal interests",
      "Celebrate small wins and progress",
      "Remind yourself of your long-term goals"
    ],
    content: [
      "Create connections between different topics",
      "Apply concepts to real-world situations",
      "Teach the material to someone else"
    ],
    management: [
      "Create a detailed study schedule for next week",
      "Optimize your study environment",
      "Plan ahead for upcoming assignments"
    ]
  };

  return [...baseSteps, ...componentSteps[component]];
}

export function generateFollowUpQuestion(component: SRLComponent, week: number): string {
  const followUpQuestions = {
    metacognition: [
      "What specific strategies helped you understand the material this week?",
      "How did you know when you had mastered a concept?",
      "What questions do you still have about your learning process?"
    ],
    strategy: [
      "Which study method was most effective for you this week?",
      "How did you adapt your strategies to different types of content?",
      "What new strategy would you like to try next week?"
    ],
    motivation: [
      "What aspects of the course are you most excited about?",
      "How do you maintain your motivation when facing challenges?",
      "What goals are you setting for next week?"
    ],
    content: [
      "How does this week's material connect to previous weeks?",
      "What real-world applications can you think of for these concepts?",
      "What would you like to explore further about this topic?"
    ],
    management: [
      "How did your study schedule work for you this week?",
      "What obstacles did you face in managing your time?",
      "How can you improve your study environment?"
    ]
  };

  const questions = followUpQuestions[component];
  return questions[Math.floor(Math.random() * questions.length)];
}
