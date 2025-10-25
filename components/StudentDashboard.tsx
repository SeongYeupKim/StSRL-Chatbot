'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { LogOut, TrendingUp, MessageSquare, Calendar, Award, BarChart3 } from 'lucide-react';
import ChatInterface from './ChatInterface';
import WeekSelector from './WeekSelector';

interface StudentDashboardProps {
  userId: string;
}

export default function StudentDashboard({ userId }: StudentDashboardProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'chat'>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalResponses: 0,
    totalMessages: 0,
    weeksCompleted: new Set<number>()
  });

  useEffect(() => {
    loadUserData();
    loadSessions();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSessions = async () => {
    try {
      const q = query(collection(db, 'sessions'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const sessionList: any[] = [];
      const weeksSet = new Set<number>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        sessionList.push({ id: doc.id, ...data });
        
        if (data.weeklyProgress) {
          data.weeklyProgress.forEach((wp: any) => {
            weeksSet.add(wp.week);
          });
        }
      });

      setSessions(sessionList);
      
      const totalSessions = sessionList.length;
      const totalResponses = sessionList.reduce((sum, s) => sum + (s.responses || 0), 0);
      const totalMessages = sessionList.reduce((sum, s) => sum + (s.totalMessages || 0), 0);
      
      setStats({
        totalSessions,
        totalResponses,
        totalMessages,
        weeksCompleted: weeksSet
      });
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  if (activeView === 'chat') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <ChatInterface userId={userId} firstName={userData?.firstName || ''} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
            <p className="text-sm text-gray-600">{userData?.studentId || userData?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalResponses}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weeks Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.weeksCompleted.size}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Responses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalSessions > 0 ? Math.round(stats.totalResponses / stats.totalSessions) : 0}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Start a New Session</h2>
          <p className="text-gray-600 mb-4">
            Continue your learning journey by starting a new SRL chat session.
          </p>
          <button
            onClick={() => setActiveView('chat')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Start Chat Session</span>
          </button>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recent Sessions</h2>
          </div>
          <div className="p-6">
            {sessions.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No sessions yet. Start your first chat session!
              </p>
            ) : (
              <div className="space-y-4">
                {sessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">Session on {new Date(session.timestamp).toLocaleDateString()}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span>{session.responses} responses</span>
                          <span>{session.totalMessages} messages</span>
                          {session.weeklyProgress && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Week {session.weeklyProgress[0]?.week}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
