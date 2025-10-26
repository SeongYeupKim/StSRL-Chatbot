'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Calendar, MessageSquare } from 'lucide-react';
import { ChatMessage, SRLPrompt } from '@/types/srl';
import { getPromptsByWeek } from '@/data/prompts';
import { generateFeedback, generateFollowUpQuestion } from '@/utils/ai-feedback';
import ChatBubble from './ChatBubble';
import PromptCard from './PromptCard';
import WeekSelector from './WeekSelector';

interface ChatInterfaceProps {
  userId: string;
  firstName?: string;
  studentId?: string;
}

export default function ChatInterface({ userId, firstName, studentId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<SRLPrompt | null>(null);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionMessage, setCompletionMessage] = useState<string>('');
  const [showWeekSelector, setShowWeekSelector] = useState(true);
  const [sessionId] = useState<string>(`session_${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat with welcome message
    if (messages.length === 0) {
      const displayName = firstName || userId;
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        timestamp: new Date(),
        sender: 'bot',
        content: `Hello ${displayName}! I'm SPARK, your Self-Regulated Learning Assistant. I'm here to help you develop better learning skills. Which week are you currently in?`
      };
      setMessages([welcomeMessage]);
    }
  }, [userId, firstName, messages.length]);

  const handleWeekSelection = (week: number) => {
    setCurrentWeek(week);
    setShowWeekSelector(false);
    
    const weekPrompts = getPromptsByWeek(week);
    if (weekPrompts.length > 0) {
      // Select first prompt of the week
      const firstPrompt = weekPrompts[0];
      setCurrentPrompt(firstPrompt);
      
      const weekMessage: ChatMessage = {
        id: `week-${week}`,
        timestamp: new Date(),
        sender: 'bot',
        content: `Great! You're in Week ${week}. Let me provide you with a learning prompt to help you reflect on your self-regulated learning.`,
        promptId: firstPrompt.id
      };
      
      setMessages(prev => [...prev, weekMessage]);
    }
  };

  const handlePromptResponse = async (response: string) => {
    if (!currentPrompt) return;

    // Add user response to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      timestamp: new Date(),
      sender: 'user',
      content: response,
      promptId: currentPrompt.id,
      response: response
    };

    setMessages(prev => [...prev, userMessage]);
    setIsWaitingForResponse(true);

    // Generate AI feedback using OpenAI API
    try {
      const apiResponse = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: currentPrompt.id,
          response: response,
          component: currentPrompt.component,
          week: currentPrompt.week,
          previousResponse: messages[messages.length - 1]?.response,
          conversationHistory: messages.slice(-2).map(msg => ({
            role: msg.sender === 'bot' ? 'bot' : 'user',
            content: msg.content
          }))
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        const { feedback } = data;
        
        // Use the natural flowing feedback
        const combinedContent = feedback.feedback;
        
        // Add single combined feedback message
        const feedbackMessage: ChatMessage = {
          id: `feedback-${Date.now()}`,
          timestamp: new Date(),
          sender: 'bot',
          content: combinedContent,
          promptId: currentPrompt.id,
          feedback: feedback.feedback
        };

        setMessages(prev => [...prev, feedbackMessage]);
        setIsWaitingForResponse(false);
      } else {
        throw new Error('API request failed');
      }

    } catch (error) {
      console.error('Error generating feedback:', error);
      // Fallback to basic feedback
      const fallbackMessage: ChatMessage = {
        id: `feedback-${Date.now()}`,
        timestamp: new Date(),
        sender: 'bot',
        content: "Thanks for your response! Consider trying one new learning strategy this week and reflecting on what works best for you. Keep up the great work! Would you like to discuss this topic more, or are you satisfied with this prompt?",
        promptId: currentPrompt.id
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setIsWaitingForResponse(false);
    }
  };

  const handleUserMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      timestamp: new Date(),
      sender: 'user',
      content: content
    };

    setMessages(prev => [...prev, userMessage]);

    // Check if this is a response to the "continue or end" question
    const lastBotMessage = messages[messages.length - 1];
    if (lastBotMessage?.sender === 'bot' && lastBotMessage.content.includes('Would you like to discuss this topic more, or are you satisfied with this prompt?')) {
      // Handle the yes/no response
      const lowerContent = content.toLowerCase();
      if (lowerContent.includes('no') || lowerContent.includes('satisfied') || lowerContent.includes('end') || lowerContent.includes('stop')) {
        // End the conversation and archive data
        const endMessage: ChatMessage = {
          id: `end-${Date.now()}`,
          timestamp: new Date(),
          sender: 'bot',
          content: "Perfect! Thank you for engaging with this learning prompt. Your responses have been saved for your learning journey. Feel free to come back anytime for more SRL support!"
        };
        setMessages(prev => [...prev, endMessage]);
        
        // Archive the session data
        const sessionData = {
          id: sessionId,
          userId: studentId || userId, // Use studentId if available, otherwise fallback to userId
          currentWeek: currentWeek || 1,
          chatHistory: messages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          responses: {},
          createdAt: new Date(Date.now() - 60000), // 1 minute ago
          lastActive: new Date()
        };
        
        try {
          await fetch('/api/archive', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session: sessionData }),
          });
        } catch (error) {
          console.error('Failed to archive session:', error);
        }
        
        setCurrentPrompt(null); // Clear the current prompt
        return;
      } else if (lowerContent.includes('yes') || lowerContent.includes('more') || lowerContent.includes('continue')) {
        // Continue with deeper conversation
        const continueMessage: ChatMessage = {
          id: `continue-${Date.now()}`,
          timestamp: new Date(),
          sender: 'bot',
          content: "Great! Let's dive deeper into this topic. What specific aspect would you like to explore more about your learning process?"
        };
        setMessages(prev => [...prev, continueMessage]);
        return;
      }
    }

    // Default AI response for general conversation
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        timestamp: new Date(),
        sender: 'bot',
        content: "I'm here to support your self-regulated learning journey. Would you like to work on a specific learning prompt, or do you have questions about study strategies?"
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    handleUserMessage(content);
  };

  const handleFinishChat = async () => {
    // Show completion UI immediately
    setIsCompleted(true);
    
    // End the conversation and archive data immediately
    const endMessage: ChatMessage = {
      id: `end-${Date.now()}`,
      timestamp: new Date(),
      sender: 'bot',
      content: "Perfect! Thank you for engaging with this learning prompt. Your responses have been saved for your learning journey. Feel free to come back anytime for more SRL support!"
    };
    setMessages(prev => [...prev, endMessage]);
    
    // Archive the session data
    const sessionData = {
      id: sessionId,
      userId: studentId || userId, // Use studentId if available, otherwise fallback to userId
      currentWeek: currentWeek || 1,
      chatHistory: messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })),
      responses: {},
      createdAt: new Date(Date.now() - 60000), // 1 minute ago
      lastActive: new Date()
    };
    
    try {
      await fetch('/api/archive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: sessionData }),
      });
    } catch (error) {
      console.error('Failed to archive session:', error);
    }
    
    setCurrentPrompt(null); // Clear the current prompt
    
    // Show loading message while generating personalized feedback
    setCompletionMessage('Generating your personalized feedback...\n\nPlease wait a moment.');
    
    // Generate adaptive completion message in the background
    setTimeout(async () => {
      try {
        const response = await fetch('/api/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversationHistory: messages
              .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
              .slice(-6)
              .map(msg => ({
                role: msg.sender === 'bot' ? 'bot' : 'user',
                content: msg.content
              }))
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setCompletionMessage(data.message);
        }
      } catch (error) {
        console.error('Error generating completion message:', error);
        setCompletionMessage('');
      }
    }, 100);
  };

  const resetToWeekSelection = () => {
    setCurrentWeek(null);
    setCurrentPrompt(null);
    setShowWeekSelector(true);
    const displayName = firstName || userId;
    setMessages([{
      id: 'welcome',
      timestamp: new Date(),
      sender: 'bot',
      content: `Hello ${displayName}! I'm SPARK, your Self-Regulated Learning Assistant. I'm here to help you develop better learning skills. Which week are you currently in?`
    }]);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Panel - SPARK Character & Tips */}
        <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* SPARK Character */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center mb-4">
                <img 
                  src={isCompleted ? "/spark_end.png" : "/spark_basic.png"} 
                  alt="SPARK Character" 
                  className="w-48 h-auto"
                  onError={(e) => {
                    // Fallback to emoji if image not found
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-xl';
                    fallback.innerHTML = '<span class="text-5xl">✨</span>';
                    e.currentTarget.parentNode?.appendChild(fallback);
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">SPARK</h3>
              <p className="text-sm text-gray-600">Learning Assistant</p>
            </div>
            
            {/* Tips Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <span className="text-blue-600 mr-2">{isCompleted ? '🎉' : '💡'}</span>
                {isCompleted ? 'Great Job!' : 'Learning Tip'}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {isCompleted ? (
                  completionMessage ? (
                    completionMessage.includes('Generating your personalized feedback') ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>{completionMessage.split('\n')[0]}</span>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: completionMessage.replace(/\n/g, '<br />') }} />
                    )
                  ) : (
                    <>
                      Excellent work completing your learning session! Here are some tips to keep improving:
                      <br /><br />
                      • Apply what you've reflected on this week
                      <br />
                      • Try implementing one new strategy you discussed
                      <br />
                      • Come back next week for more guided reflection
                      <br />
                      • Keep building your self-regulated learning skills!
                    </>
                  )
                ) : currentWeek ? (
                  <>
                    Welcome to Week {currentWeek}! Take your time reflecting on the questions. 
                    Your thoughtful responses will help you develop stronger self-regulated learning skills.
                    <br /><br />
                    <strong>You can chat as much as you'd like, and press the "Finish Chatting" button whenever you're ready to end the session.</strong>
                  </>
                ) : (
                  <>
                    Select your current week to get personalized learning prompts. 
                    These prompts are designed to help you reflect on your learning strategies and improve your study habits.
                  </>
                )}
              </p>
            </div>
            

          </div>
        </div>
        
        {/* Right Panel - Main Chat */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6" />
                <div>
                  <h2 className="text-lg font-semibold">Chat with SPARK</h2>
                  <p className="text-blue-100 text-sm">
                    {currentWeek ? `Week ${currentWeek}` : 'Ready to help you learn'}
                  </p>
                </div>
              </div>
              <button
                onClick={resetToWeekSelection}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <Calendar className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            
            {isWaitingForResponse && (
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                <span className="text-sm">SPARK is thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Week Selector */}
          {showWeekSelector && (
            <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-b from-white to-gray-50">
              <WeekSelector onWeekSelect={handleWeekSelection} />
            </div>
          )}

          {/* Current Prompt */}
          {currentPrompt && !showWeekSelector && (
            <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-b from-white to-blue-50">
              <PromptCard 
                prompt={currentPrompt} 
                onResponse={handlePromptResponse}
                onFinishChat={handleFinishChat}
                disabled={isWaitingForResponse}
              />
            </div>
          )}

          {/* Message Input */}
          {!showWeekSelector && !currentPrompt && (
            <div className="p-6 border-t-2 border-gray-200 bg-gradient-to-b from-white to-gray-50">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Input Component
function MessageInput({ onSendMessage }: { onSendMessage: (message: string) => void }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
}
