'use client';

import { useState } from 'react';
import { SRLPrompt, SRLComponent } from '@/types/srl';
import { Send, Check, X } from 'lucide-react';

interface PromptCardProps {
  prompt: SRLPrompt;
  onResponse: (response: string) => void;
  onFinishChat?: () => void;
  disabled?: boolean;
}

export default function PromptCard({ prompt, onResponse, onFinishChat, disabled = false }: PromptCardProps) {
  const [response, setResponse] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [sliderValue, setSliderValue] = useState<number>(
    prompt.minValue ? Math.floor((prompt.minValue + (prompt.maxValue || 10)) / 2) : 5
  );

  const getComponentColor = (component: SRLComponent) => {
    const colors = {
      metacognition: 'srl-metacognition',
      strategy: 'srl-strategy',
      motivation: 'srl-motivation',
      content: 'srl-content',
      management: 'srl-management'
    };
    return colors[component];
  };

  const getComponentLabel = (component: SRLComponent) => {
    const labels = {
      metacognition: 'Metacognition',
      strategy: 'Strategy',
      motivation: 'Motivation',
      content: 'Content',
      management: 'Management'
    };
    return labels[component];
  };

  const handleSubmit = () => {
    let finalResponse = '';
    
    switch (prompt.type) {
      case 'multiple-choice':
        finalResponse = selectedOption;
        break;
      case 'slider':
        finalResponse = sliderValue.toString();
        break;
      case 'yes-no':
        finalResponse = selectedOption;
        break;
      case 'open-ended':
        finalResponse = response;
        break;
      case 'acknowledgement':
        finalResponse = 'Acknowledged';
        break;
    }

    if (finalResponse.trim()) {
      onResponse(finalResponse);
      // Reset form
      setResponse('');
      setSelectedOption('');
      setSliderValue(prompt.minValue ? Math.floor((prompt.minValue + (prompt.maxValue || 10)) / 2) : 5);
    }
  };

  const renderInput = () => {
    switch (prompt.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {prompt.options?.map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={(e) => setSelectedOption(e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                  disabled={disabled}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{prompt.minValue}</span>
              <span className="font-medium">{sliderValue}</span>
              <span>{prompt.maxValue}</span>
            </div>
            <input
              type="range"
              min={prompt.minValue}
              max={prompt.maxValue}
              value={sliderValue}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={disabled}
            />
          </div>
        );

      case 'yes-no':
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedOption('Yes')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedOption === 'Yes'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={disabled}
            >
              <Check className="h-4 w-4" />
              <span>Yes</span>
            </button>
            <button
              onClick={() => setSelectedOption('No')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedOption === 'No'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span>No</span>
            </button>
          </div>
        );

      case 'open-ended':
        return (
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Type your response here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows={3}
            disabled={disabled}
          />
        );

      case 'acknowledgement':
        return (
          <div className="text-center">
            <button
              onClick={() => setSelectedOption('Acknowledged')}
              className={`px-6 py-2 rounded-lg transition-colors ${
                selectedOption === 'Acknowledged'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={disabled}
            >
              I understand
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const canSubmit = () => {
    switch (prompt.type) {
      case 'multiple-choice':
      case 'yes-no':
        return selectedOption.trim() !== '';
      case 'slider':
        return true;
      case 'open-ended':
        return response.trim() !== '';
      case 'acknowledgement':
        return selectedOption.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`srl-badge srl-badge-${prompt.component}`}>
              {getComponentLabel(prompt.component)}
            </span>
            <span className="text-sm text-gray-500">Week {prompt.week}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{prompt.title}</h3>
          <p className="text-gray-700 mb-3">{prompt.question}</p>
          {prompt.description && (
            <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {renderInput()}
        
        <div className="flex justify-between">
          {onFinishChat && (
            <button
              onClick={onFinishChat}
              disabled={disabled}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Finish Chatting</span>
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={disabled || !canSubmit()}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Submit Response</span>
          </button>
        </div>
      </div>
    </div>
  );
}
