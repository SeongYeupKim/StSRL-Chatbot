import OpenAI from 'openai';
import { SRLComponent, SRLFeedback } from '@/types/srl';
import { getPromptById } from '@/data/prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FeedbackContext {
  promptId: string;
  response: string;
  component: SRLComponent;
  week: number;
  previousResponses?: string[];
}

export async function generateOpenAIFeedback(context: FeedbackContext): Promise<SRLFeedback> {
  const prompt = getPromptById(context.promptId);
  if (!prompt) {
    throw new Error(`Prompt with id ${context.promptId} not found`);
  }

  const systemPrompt = createSystemPrompt(context.component, prompt.week);
  const userPrompt = createUserPrompt(context);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const feedbackText = completion.choices[0]?.message?.content || '';
    
    // Parse the structured response
    const parsedFeedback = parseFeedbackResponse(feedbackText, context);
    
    return {
      promptId: context.promptId,
      response: context.response,
      feedback: parsedFeedback.feedback,
      suggestions: parsedFeedback.suggestions,
      nextSteps: parsedFeedback.nextSteps
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    // Fallback to basic feedback if API fails
    return generateFallbackFeedback(context);
  }
}

function createSystemPrompt(component: SRLComponent, week: number): string {
  const componentDescriptions = {
    metacognition: "Metacognition involves students' awareness and understanding of their own learning processes, including planning, monitoring, and evaluating their learning strategies.",
    strategy: "Learning strategies refer to the specific techniques and methods students use to acquire, organize, and retain information effectively.",
    motivation: "Motivation encompasses students' intrinsic drive, self-efficacy, interest, and engagement with the learning material.",
    content: "Content understanding involves students' comprehension and ability to connect new information with existing knowledge.",
    management: "Management refers to students' ability to organize their time, resources, and learning environment effectively."
  };

  return `You are a supportive SRL learning coach helping a student in Week ${week}.

Focus on the ${component} component of SRL: ${componentDescriptions[component]}

CRITICAL RULES:
1. **ACKNOWLEDGE THEIR RESPONSE** - Reference what they said specifically
2. **PROVIDE MODERATE FEEDBACK** - 3-4 sentences with helpful insights
3. **GIVE 2-3 ACTIONABLE SUGGESTIONS** - Practical tips they can implement
4. **ALWAYS END WITH THE SAME QUESTION** - "Would you like to discuss this topic more, or are you satisfied with this prompt? If you're satisfied, you can press the 'Finish Chatting' button below."

Your feedback should be:
- Moderate length (3-4 sentences)
- Encouraging and supportive
- Specific to their response
- Include 2-3 actionable suggestions
- Always ask the same follow-up question with button guidance

Provide your response in the following JSON format:
{
  "feedback": "Moderate length response that acknowledges their answer and provides helpful insights",
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "nextSteps": ["Next step 1", "Next step 2"],
  "followUpQuestion": "Would you like to discuss this topic more, or are you satisfied with this prompt? If you're satisfied, you can press the 'Finish Chatting' button below."
}

Keep it conversational and helpful, but not overwhelming.`;
}

function createUserPrompt(context: FeedbackContext): string {
  const prompt = getPromptById(context.promptId);
  if (!prompt) return '';

  return `Student Response: "${context.response}"

Prompt Question: "${prompt.question}"
SRL Component: ${context.component}
Week: ${context.week}

Provide a brief, encouraging response that:
1. Acknowledges what they said
2. Gives one simple suggestion
3. Always ends with: "Would you like to discuss this topic more, or are you satisfied with this prompt?"

Keep it short and simple.`;
}

function parseFeedbackResponse(response: string, context: FeedbackContext): {
  feedback: string;
  suggestions: string[];
  nextSteps: string[];
} {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response);
    return {
      feedback: parsed.feedback || 'Thank you for your response!',
      suggestions: parsed.suggestions || [],
      nextSteps: parsed.nextSteps || []
    };
  } catch (error) {
    // If JSON parsing fails, extract content manually
    const lines = response.split('\n').filter(line => line.trim());
    
    let feedback = 'Thank you for your response!';
    const suggestions: string[] = [];
    const nextSteps: string[] = [];
    
    let currentSection = 'feedback';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('suggestion') || line.includes('•')) {
        currentSection = 'suggestions';
        const suggestion = line.replace(/^[•\-\*]\s*/, '').trim();
        if (suggestion) suggestions.push(suggestion);
      } else if (line.toLowerCase().includes('next') || line.toLowerCase().includes('step')) {
        currentSection = 'nextSteps';
        const step = line.replace(/^[•\-\*]\s*/, '').trim();
        if (step) nextSteps.push(step);
      } else if (currentSection === 'feedback') {
        feedback = line.trim();
      }
    }
    
    return { feedback, suggestions, nextSteps };
  }
}

function generateFallbackFeedback(context: FeedbackContext): SRLFeedback {
  const basicFeedback = {
    metacognition: "Thanks for sharing your thoughts on learning! It's great that you're reflecting on your learning process. Consider what specific strategies have been most effective for you and why they work well.",
    strategy: "Great job thinking about your study methods! It's important to understand what works best for you. Try experimenting with one new strategy this week and see how it affects your learning.",
    motivation: "Your motivation is key to success! It's wonderful that you're engaged with the material. Try connecting what you're learning to your personal interests and future goals.",
    content: "Good work understanding the content! It's important to build connections between new and existing knowledge. Try to relate this material to what you already know or have experienced.",
    management: "Time management is crucial for academic success! It's great that you're thinking about organization. Consider creating a structured study schedule that works with your natural rhythms."
  };

  return {
    promptId: context.promptId,
    response: context.response,
    feedback: basicFeedback[context.component] || "Thank you for your response! I appreciate you taking the time to reflect on your learning.",
    suggestions: [
      "Try one new learning strategy this week",
      "Reflect on what works best for you"
    ],
    nextSteps: [
      "Monitor your progress with the new approach",
      "Adjust your strategies based on what you learn"
    ],
    followUpQuestion: "Would you like to discuss this topic more, or are you satisfied with this prompt? If you're satisfied, you can press the 'Finish Chatting' button below."
  };
}

export async function generateFollowUpQuestionOpenAI(
  component: SRLComponent, 
  week: number, 
  previousResponse?: string
): Promise<string> {
  const systemPrompt = `You are a supportive SRL learning coach. Generate a thoughtful follow-up question that:

1. **DIRECTLY REFERENCES** the student's previous response
2. **ACKNOWLEDGES** what they shared
3. **ENCOURAGES DEEPER REFLECTION** on ${component}
4. **IS CONVERSATIONAL** and warm
5. **HELPS THEM THINK MORE** about their learning process

IMPORTANT: 
- If their response was short (like "yes", "got an A", "Metacognition"), ask for more details
- If they seem confused, help clarify what you're asking
- Be specific about what you want to know more about
- Use a warm, curious tone
- Make it feel like a natural continuation of the conversation

Keep the question conversational and engaging (1-2 sentences). Start with a transition like "I'm curious..." or "That's interesting! Can you tell me more about..."`;

  const userPrompt = previousResponse 
    ? `Student's previous response: "${previousResponse}"\n\nGenerate a follow-up question that naturally continues the conversation.`
    : `Generate a follow-up question for a student in week ${week} focusing on ${component}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 120
    });

    return completion.choices[0]?.message?.content || generateFallbackFollowUp(component, week);
  } catch (error) {
    console.error('OpenAI API error for follow-up:', error);
    return generateFallbackFollowUp(component, week);
  }
}

function generateFallbackFollowUp(component: SRLComponent, week: number): string {
  const fallbackQuestions = {
    metacognition: "I'm curious - what specific strategies or approaches have been working well for you so far?",
    strategy: "That's interesting! Can you tell me more about which study methods you've found most helpful, and why they work for you?",
    motivation: "Great! What aspects of this course are you most looking forward to learning about?",
    content: "I'm curious - how do you see this week's material connecting to what you've learned before?",
    management: "Thanks for sharing! How has your study schedule been working out for you this week?"
  };

  return fallbackQuestions[component] || "I'd love to hear more about your learning experience. What would you like to work on or discuss?";
}
