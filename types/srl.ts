export type SRLComponent = 'metacognition' | 'strategy' | 'motivation' | 'content' | 'management';

export interface SRLPrompt {
  id: string;
  week: number;
  component: SRLComponent;
  title: string;
  question: string;
  type: 'multiple-choice' | 'open-ended' | 'slider' | 'yes-no' | 'acknowledgement';
  options?: string[];
  minValue?: number;
  maxValue?: number;
  description?: string;
}

export interface ChatMessage {
  id: string;
  timestamp: Date;
  sender: 'user' | 'bot';
  content: string;
  promptId?: string;
  response?: string;
  feedback?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  currentWeek: number;
  chatHistory: ChatMessage[];
  responses: Record<string, any>;
  createdAt: Date;
  lastActive: Date;
}

export interface SRLFeedback {
  promptId: string;
  response: string;
  feedback: string;
  suggestions: string[];
  nextSteps: string[];
}

export interface WeekData {
  week: number;
  prompts: SRLPrompt[];
  theme: string;
  description: string;
}
