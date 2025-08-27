import { SRLPrompt } from '@/types/srl';

export const srlPrompts: SRLPrompt[] = [
  // Week 1 - Introduction to SRL
  {
    id: 'w1-meta-1',
    week: 1,
    component: 'metacognition',
    title: 'Learning Goals Assessment',
    question: 'What are your main learning goals for this course?',
    type: 'open-ended',
    description: 'Reflect on what you hope to achieve and learn in this course.'
  },
  {
    id: 'w1-strategy-1',
    week: 1,
    component: 'strategy',
    title: 'Study Strategy Awareness',
    question: 'Which study strategies do you currently use most often?',
    type: 'multiple-choice',
    options: [
      'Rereading notes/textbooks',
      'Creating flashcards',
      'Practice problems',
      'Group study sessions',
      'Teaching others',
      'Other'
    ]
  },

  // Week 2 - Metacognition Focus
  {
    id: 'w2-meta-1',
    week: 2,
    component: 'metacognition',
    title: 'Self-Monitoring Check',
    question: 'How well do you think you understood the material from this week?',
    type: 'slider',
    minValue: 1,
    maxValue: 10,
    description: 'Rate your understanding on a scale of 1-10.'
  },
  {
    id: 'w2-motivation-1',
    week: 2,
    component: 'motivation',
    title: 'Confidence Level',
    question: 'How confident do you feel about your ability to succeed in this course?',
    type: 'slider',
    minValue: 1,
    maxValue: 10
  },

  // Week 3 - Strategy Development
  {
    id: 'w3-strategy-1',
    week: 3,
    component: 'strategy',
    title: 'Active Learning Strategies',
    question: 'Have you tried any new study strategies this week?',
    type: 'yes-no'
  },
  {
    id: 'w3-management-1',
    week: 3,
    component: 'management',
    title: 'Time Management',
    question: 'How many hours did you spend studying for this course this week?',
    type: 'open-ended'
  },

  // Week 4 - Motivation and Engagement
  {
    id: 'w4-motivation-1',
    week: 4,
    component: 'motivation',
    title: 'Interest Level',
    question: 'How interested are you in the current course material?',
    type: 'slider',
    minValue: 1,
    maxValue: 10
  },
  {
    id: 'w4-content-1',
    week: 4,
    component: 'content',
    title: 'Content Connection',
    question: 'Can you connect this week\'s material to something you already know?',
    type: 'open-ended'
  },

  // Week 5 - Deep Learning
  {
    id: 'w5-strategy-1',
    week: 5,
    component: 'strategy',
    title: 'Elaboration Strategy',
    question: 'What questions do you have about this week\'s material?',
    type: 'open-ended'
  },
  {
    id: 'w5-meta-1',
    week: 5,
    component: 'metacognition',
    title: 'Learning Process Reflection',
    question: 'What was the most challenging part of learning this week\'s material?',
    type: 'open-ended'
  },

  // Week 6 - Assessment Preparation
  {
    id: 'w6-management-1',
    week: 6,
    component: 'management',
    title: 'Exam Preparation',
    question: 'How are you preparing for upcoming assessments?',
    type: 'multiple-choice',
    options: [
      'Regular review sessions',
      'Practice tests',
      'Study groups',
      'Office hours',
      'Not started yet',
      'Other'
    ]
  },
  {
    id: 'w6-motivation-1',
    week: 6,
    component: 'motivation',
    title: 'Stress Level',
    question: 'How stressed do you feel about upcoming assessments?',
    type: 'slider',
    minValue: 1,
    maxValue: 10
  },

  // Week 7 - Mid-semester Reflection
  {
    id: 'w7-meta-1',
    week: 7,
    component: 'metacognition',
    title: 'Mid-semester Assessment',
    question: 'How would you rate your overall progress in this course so far?',
    type: 'slider',
    minValue: 1,
    maxValue: 10
  },
  {
    id: 'w7-strategy-1',
    week: 7,
    component: 'strategy',
    title: 'Strategy Effectiveness',
    question: 'Which study strategies have been most effective for you?',
    type: 'open-ended'
  },

  // Week 8 - Adaptation and Growth
  {
    id: 'w8-motivation-1',
    week: 8,
    component: 'motivation',
    title: 'Growth Mindset',
    question: 'Do you believe your abilities can improve with effort?',
    type: 'yes-no'
  },
  {
    id: 'w8-management-1',
    week: 8,
    component: 'management',
    title: 'Study Environment',
    question: 'Where do you study most effectively?',
    type: 'multiple-choice',
    options: [
      'Library',
      'Home',
      'Coffee shop',
      'Study room',
      'Outdoors',
      'Other'
    ]
  },

  // Week 9 - Advanced Strategies
  {
    id: 'w9-strategy-1',
    week: 9,
    component: 'strategy',
    title: 'Interleaving Practice',
    question: 'Have you tried mixing different types of problems in your practice?',
    type: 'yes-no'
  },
  {
    id: 'w9-content-1',
    week: 9,
    component: 'content',
    title: 'Concept Integration',
    question: 'How do the concepts from different weeks connect to each other?',
    type: 'open-ended'
  },

  // Week 10 - Self-Efficacy
  {
    id: 'w10-motivation-1',
    week: 10,
    component: 'motivation',
    title: 'Self-Efficacy Check',
    question: 'How confident are you in your ability to complete the remaining course requirements?',
    type: 'slider',
    minValue: 1,
    maxValue: 10
  },
  {
    id: 'w10-meta-1',
    week: 10,
    component: 'metacognition',
    title: 'Learning Transfer',
    question: 'How can you apply what you\'ve learned to other courses or real-world situations?',
    type: 'open-ended'
  },

  // Week 11 - Final Preparation
  {
    id: 'w11-management-1',
    week: 11,
    component: 'management',
    title: 'Final Exam Preparation',
    question: 'What is your plan for preparing for the final exam?',
    type: 'open-ended'
  },
  {
    id: 'w11-strategy-1',
    week: 11,
    component: 'strategy',
    title: 'Review Strategy',
    question: 'How will you review all the material from the semester?',
    type: 'multiple-choice',
    options: [
      'Create comprehensive notes',
      'Practice with old exams',
      'Study groups',
      'Individual review sessions',
      'Tutoring',
      'Other'
    ]
  },

  // Week 12 - Course Reflection
  {
    id: 'w12-meta-1',
    week: 12,
    component: 'metacognition',
    title: 'Overall Learning Reflection',
    question: 'What have you learned about yourself as a learner in this course?',
    type: 'open-ended'
  },
  {
    id: 'w12-motivation-1',
    week: 12,
    component: 'motivation',
    title: 'Future Learning Goals',
    question: 'What learning strategies will you continue to use in future courses?',
    type: 'open-ended'
  }
];

export const getPromptsByWeek = (week: number): SRLPrompt[] => {
  return srlPrompts.filter(prompt => prompt.week === week);
};

export const getPromptById = (id: string): SRLPrompt | undefined => {
  return srlPrompts.find(prompt => prompt.id === id);
};
