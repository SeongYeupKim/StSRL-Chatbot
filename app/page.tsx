'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AuthForm from '@/components/AuthForm';
import StudentDashboard from '@/components/StudentDashboard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'student' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // TODO: Determine user type from Firestore
        setUserType('student');
      } else {
        setUserType(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (userId: string, type: 'student' | 'admin') => {
    setUserType(type);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (userType === 'student') {
    return <StudentDashboard userId={user.uid} />;
  }

  // TODO: Add admin dashboard
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome</h1>
        <p className="text-gray-600">Dashboard coming soon...</p>
      </div>
    </div>
  );
}
