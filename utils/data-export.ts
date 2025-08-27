
import { ChatMessage, UserSession } from '@/types/srl';
import { getPromptById } from '@/data/prompts';

export interface ExportData {
  userId: string;
  sessionId: string;
  startDate: string;
  endDate: string;
  totalMessages: number;
  responses: ResponseData[];
  srlComponentStats: SRLComponentStats;
  weeklyProgress: WeeklyProgress[];
}

export interface ResponseData {
  promptId: string;
  week: number;
  component: string;
  question: string;
  response: string;
  feedback: string;
  timestamp: string;
}

export interface SRLComponentStats {
  metacognition: number;
  strategy: number;
  motivation: number;
  content: number;
  management: number;
}

export interface WeeklyProgress {
  week: number;
  promptsCompleted: number;
  averageResponseLength: number;
  componentsCovered: string[];
}

export function exportSessionData(session: UserSession): ExportData {
  const responses: ResponseData[] = [];
  const componentStats: SRLComponentStats = {
    metacognition: 0,
    strategy: 0,
    motivation: 0,
    content: 0,
    management: 0
  };

  const weeklyData: Map<number, { responses: string[], components: Set<string> }> = new Map();

  // Process chat messages to extract responses
  session.chatHistory.forEach(message => {
    if (message.sender === 'user' && message.promptId && message.response) {
      const prompt = getPromptById(message.promptId);
      if (prompt) {
        // Find corresponding feedback message
        const feedbackMessage = session.chatHistory.find(m => 
          m.sender === 'bot' && m.promptId === message.promptId && m.feedback
        );

        responses.push({
          promptId: message.promptId,
          week: prompt.week,
          component: prompt.component,
          question: prompt.question,
          response: message.response,
          feedback: feedbackMessage?.feedback || '',
          timestamp: new Date(message.timestamp).toISOString()
        });

        // Update component stats
        componentStats[prompt.component]++;

        // Update weekly data
        if (!weeklyData.has(prompt.week)) {
          weeklyData.set(prompt.week, { responses: [], components: new Set() });
        }
        const weekData = weeklyData.get(prompt.week)!;
        weekData.responses.push(message.response);
        weekData.components.add(prompt.component);
      }
    }
  });

  // Calculate weekly progress
  const weeklyProgress: WeeklyProgress[] = Array.from(weeklyData.entries()).map(([week, data]) => ({
    week,
    promptsCompleted: data.responses.length,
    averageResponseLength: data.responses.reduce((sum, response) => sum + response.length, 0) / data.responses.length,
    componentsCovered: Array.from(data.components)
  }));

  return {
    userId: session.userId,
    sessionId: session.id,
    startDate: new Date(session.createdAt).toISOString(),
    endDate: new Date(session.lastActive).toISOString(),
    totalMessages: session.chatHistory.length,
    responses,
    srlComponentStats: componentStats,
    weeklyProgress
  };
}

export function exportToCSV(data: ExportData): string {
  const headers = [
    'User ID',
    'Session ID',
    'Week',
    'Component',
    'Question',
    'Response',
    'Feedback',
    'Timestamp'
  ];

  const rows = data.responses.map(response => [
    data.userId,
    data.sessionId,
    response.week,
    response.component,
    `"${response.question.replace(/"/g, '""')}"`,
    `"${response.response.replace(/"/g, '""')}"`,
    `"${response.feedback.replace(/"/g, '""')}"`,
    response.timestamp
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return csvContent;
}

export function exportToJSON(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function generateReport(data: ExportData): string {
  const totalResponses = data.responses.length;
  const totalWeeks = data.weeklyProgress.length;
  const avgResponseLength = data.responses.reduce((sum, r) => sum + r.response.length, 0) / totalResponses;

  const mostActiveComponent = Object.entries(data.srlComponentStats)
    .sort(([,a], [,b]) => b - a)[0][0];

  const report = `
SRL Learning Assistant - Student Report
=====================================

Student ID: ${data.userId}
Session Period: ${new Date(data.startDate).toLocaleDateString()} - ${new Date(data.endDate).toLocaleDateString()}

Activity Summary:
- Total Messages: ${data.totalMessages}
- Prompts Completed: ${totalResponses}
- Weeks Active: ${totalWeeks}
- Average Response Length: ${Math.round(avgResponseLength)} characters

SRL Component Engagement:
- Metacognition: ${data.srlComponentStats.metacognition} responses
- Strategy: ${data.srlComponentStats.strategy} responses
- Motivation: ${data.srlComponentStats.motivation} responses
- Content: ${data.srlComponentStats.content} responses
- Management: ${data.srlComponentStats.management} responses

Most Active Component: ${mostActiveComponent}

Weekly Progress:
${data.weeklyProgress.map(wp => 
  `Week ${wp.week}: ${wp.promptsCompleted} prompts, ${wp.componentsCovered.join(', ')} components`
).join('\n')}

Recommendations:
${generateRecommendations(data)}
`;

  return report;
}

function generateRecommendations(data: ExportData): string {
  const recommendations: string[] = [];
  
  // Check for component balance
  const componentCounts = Object.values(data.srlComponentStats);
  const minCount = Math.min(...componentCounts);
  const maxCount = Math.max(...componentCounts);
  
  if (maxCount - minCount > 2) {
    recommendations.push("- Consider focusing more on components with fewer responses");
  }
  
  // Check for weekly consistency
  if (data.weeklyProgress.length < 4) {
    recommendations.push("- Try to engage with prompts more consistently across weeks");
  }
  
  // Check response quality
  const avgLength = data.responses.reduce((sum, r) => sum + r.response.length, 0) / data.responses.length;
  if (avgLength < 50) {
    recommendations.push("- Consider providing more detailed responses for better learning reflection");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("- Excellent engagement! Continue with current learning practices");
  }
  
  return recommendations.join('\n');
}
