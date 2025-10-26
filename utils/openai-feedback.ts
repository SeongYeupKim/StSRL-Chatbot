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
  conversationHistory?: Array<{ role: 'user' | 'bot'; content: string }>;
}

export async function generateOpenAIFeedback(context: FeedbackContext): Promise<SRLFeedback> {
  const prompt = getPromptById(context.promptId);
  if (!prompt) {
    throw new Error(`Prompt with id ${context.promptId} not found`);
  }

  const systemPrompt = createSystemPrompt(context.component, prompt.week);
  const userPrompt = createUserPrompt(context);

  try {
    const messages: any[] = [
      {
        role: "system",
        content: systemPrompt
      }
    ];

    // Add conversation history if available
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      messages.push(...context.conversationHistory.map(msg => ({
        role: msg.role === 'bot' ? 'assistant' : 'user',
        content: msg.content
      })));
    }

    messages.push({
      role: "user",
      content: userPrompt
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
      max_tokens: 200
    });

    const feedbackText = completion.choices[0]?.message?.content || '';
    
    // Parse the structured response
    const parsedFeedback = parseFeedbackResponse(feedbackText, context);
    
    return {
      promptId: context.promptId,
      response: context.response,
      feedback: parsedFeedback.feedback,
      suggestions: parsedFeedback.suggestions || [],
      nextSteps: parsedFeedback.nextSteps || []
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

  return `You are an expert SRL (Self-Regulated Learning) coach having a natural, thoughtful conversation with a student in Week ${week}.

CURRENT FOCUS: ${component} - ${componentDescriptions[component]}

YOUR PRIMARY GOAL:
Help this student EXPERIENCE self-regulated learning through natural dialogue, not lectures. Make them discover insights about their own learning processes.

HOW TO ACHIEVE THIS:

1. **BE CONVERSATIONAL, NOT ROBOTIC**
   - Write like a thoughtful human coach, not a formal instructor
   - Use their name or refer to what they said specifically
   - React naturally to what they share

2. **GUIDE DISCOVERY, DON'T TELL**
   - Instead of: "You should use metacognitive strategies"
   - Say: "I'm curious - when you think about how you learn, what patterns do you notice?"
   - Help them discover answers through questions

3. **CONNECT TO REAL EXPERIENCES**
   - Reference things they mentioned (if any in conversation history)
   - Make it personal: "You mentioned struggling with X - what strategies did you try?"
   - Relate to actual learning situations, not abstract concepts

4. **ENCOURAGE SRL BEHAVIORS**
   - Prompt planning: "How do you decide what to tackle first?"
   - Prompt monitoring: "How do you know if your approach is working?"
   - Prompt evaluating: "What would you do differently next time?"
   - Prompt adapting: "When something doesn't work, how do you adjust?"

5. **BE NATURALLY INTERESTED**
   - Ask follow-up questions that show genuine curiosity
   - Build on what they share
   - Create a back-and-forth dialogue, not interrogation

YOUR RESPONSE STYLE:
- Natural, conversational tone (like talking to a friend who cares)
- 2-3 sentences max
- Acknowledge what they said specifically
- Ask ONE thoughtful follow-up question that helps them reflect on their learning
- No academic jargon unless they use it first

EXAMPLE RESPONSES:

Student: "I just read my notes over and over"
Good: "That's a common approach! I'm curious - how do you know if that's actually working for you? Like, what tells you that the material is really sticking?"
Bad: "Metacognitive monitoring involves evaluating the effectiveness of learning strategies..."

Student: "I get overwhelmed with assignments"
Good: "That sounds tough. When you feel overwhelmed, what helps you decide where to start? Is there a system you've noticed works better?"
Bad: "Time management is an important component of self-regulated learning..."

Remember: You're helping them EXPERIENCE and DISCOVER self-regulated learning through conversation, not teaching them about it academically.`;
}

function createUserPrompt(context: FeedbackContext): string {
  const prompt = getPromptById(context.promptId);
  if (!prompt) return '';

  return `Student Response: "${context.response}"

Prompt Question: "${prompt.question}"
SRL Component: ${context.component}
Week: ${context.week}

Provide a thoughtful response (2-3 sentences) that:
1. Acknowledges their specific experience and insights
2. Asks a deep, reflective question that encourages metacognitive thinking about their learning process
3. Helps them reflect on HOW they learn, strategies they use, or their self-regulation

Be an expert SRL coach - help them think deeply about their learning, not just surface-level responses.`;
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
    metacognition: "Thanks for sharing your thoughts on learning! It's great that you're reflecting on your learning process. What specific metacognitive strategies have been most effective for you, and how do you plan, monitor, and evaluate your learning?",
    strategy: "Great job thinking about your study methods! It's important to understand what works best for you. How do you choose which learning strategies to use, and how do you know if they're effective?",
    motivation: "Your motivation is key to success! It's wonderful that you're engaged with the material. How do you maintain your motivation when facing challenging topics, and what strategies help you stay engaged?",
    content: "Good work understanding the content! It's important to build connections between new and existing knowledge. How do you actively make connections between what you're learning now and what you already know?",
    management: "Time management is crucial for academic success! It's great that you're thinking about organization. How do you prioritize tasks and manage your time effectively while maintaining balance?"
  };

  const componentFeedback = basicFeedback[context.component] || "Thank you for sharing your thoughts! This reflection on your learning process is valuable.";
  
  return {
    promptId: context.promptId,
    response: context.response,
    feedback: componentFeedback,
    suggestions: [],
    nextSteps: []
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
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 100
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

export async function generateCompletionMessage(conversationHistory: Array<{ role: 'user' | 'bot'; content: string }>): Promise<string> {
  const systemPrompt = `You are a supportive learning coach. Generate a brief, encouraging completion message based on the student's conversation.

The message should:
- Be 3-4 personalized, actionable tips
- Reference specific things they discussed in their responses
- Give concrete suggestions for applying self-regulated learning
- Be encouraging and empowering
- Use natural, conversational language

FORMAT:
Use hanging indents (indented bullet points) or simple numbered lists, not dashes or symbols.
Keep each tip to one concise sentence.

Example format:
1. Try [specific action based on their discussion]
2. Consider [personalized strategy mentioned]
3. Remember to [their reflection point] as you continue learning

Keep it SHORT and focused.`;

  const conversationSummary = conversationHistory
    .filter(msg => msg.role === 'user')
    .slice(-3) // Take last 3 user responses
    .map(msg => msg.content)
    .join('\n\n');

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Based on this conversation:\n\n${conversationSummary}\n\nGenerate a brief completion message with 3-4 personalized tips.` }
      ],
      temperature: 0.7,
      max_tokens: 150
    });

    return completion.choices[0]?.message?.content || generateFallbackCompletionMessage();
  } catch (error) {
    console.error('OpenAI API error for completion message:', error);
    return generateFallbackCompletionMessage();
  }
}

function generateFallbackCompletionMessage(): string {
  return `Great work completing your session! Here are some tips to keep improving:
• Apply what you've reflected on this week
• Try implementing one new strategy you discussed  
• Come back next week for more guided reflection
• Keep building your self-regulated learning skills!`;
}
