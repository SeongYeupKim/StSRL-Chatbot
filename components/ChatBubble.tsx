import { Bot, User } from 'lucide-react';
import { ChatMessage } from '@/types/srl';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-primary-500' : 'bg-gray-500'
        }`}>
          {isBot ? (
            <Bot className="h-4 w-4 text-white" />
          ) : (
            <User className="h-4 w-4 text-white" />
          )}
        </div>
        
        <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
          <div className={`chat-bubble ${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'}`}>
            <div className="whitespace-pre-wrap text-sm">
              {message.content}
            </div>
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 ${isBot ? 'text-left' : 'text-right'}`}>
            {format(message.timestamp, 'HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}
