'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import LoginForm from '@/components/LoginForm';
import Header from '@/components/Header';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>('');

  const handleLogin = (user: string) => {
    setUserId(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId('');
  };

  return (
    <div className="min-h-screen">
      <Header isLoggedIn={isLoggedIn} userId={userId} onLogout={handleLogout} />
      
      <main className="container mx-auto px-4 py-8">
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                SRL Learning Assistant
              </h1>
              <p className="text-gray-600">
                Welcome to your personalized Self-Regulated Learning chatbot. 
                Get started by logging in to access your learning prompts and receive 
                AI-powered feedback to enhance your study skills.
              </p>
            </div>
            <LoginForm onLogin={handleLogin} />
          </div>
        ) : (
          <ChatInterface userId={userId} />
        )}
      </main>
    </div>
  );
}
