'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, FileText, Calendar, User } from 'lucide-react';

interface ArchivedSession {
  filename: string;
  userId: string;
  timestamp: string;
  date: string;
}

export default function DataViewer() {
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/archive');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = async (filename: string, type: 'json' | 'csv' | 'report') => {
    try {
      const response = await fetch(`/api/archive/download?file=${filename}&type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const viewSessionDetails = async (filename: string) => {
    try {
      const response = await fetch(`/api/archive/download?file=${filename}&type=json`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSession(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error viewing session:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Archived Sessions</h2>
        <button
          onClick={fetchSessions}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No archived sessions</h3>
          <p className="mt-1 text-sm text-gray-500">
            Start using the chatbot to generate session data.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {sessions.map((session) => (
              <li key={session.filename}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Student {session.userId}
                        </p>
                        <p className="text-sm text-gray-500">
                          {session.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewSessionDetails(session.filename)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => downloadFile(session.filename, 'json')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        JSON
                      </button>
                      <button
                        onClick={() => downloadFile(session.filename, 'csv')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        CSV
                      </button>
                      <button
                        onClick={() => downloadFile(session.filename, 'report')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Report
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Session Details Modal */}
      {showDetails && selectedSession && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Session Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <h4 className="font-medium text-gray-900">Student Information</h4>
                <p className="text-sm text-gray-600">ID: {selectedSession.userId}</p>
                <p className="text-sm text-gray-600">Session: {selectedSession.sessionId}</p>
                <p className="text-sm text-gray-600">Date: {new Date(selectedSession.startDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Activity Summary</h4>
                <p className="text-sm text-gray-600">Total Messages: {selectedSession.totalMessages}</p>
                <p className="text-sm text-gray-600">Prompts Completed: {selectedSession.responses.length}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">SRL Component Engagement</h4>
                {Object.entries(selectedSession.srlComponentStats).map(([component, count]) => (
                  <p key={component} className="text-sm text-gray-600">
                    {component}: {count} responses
                  </p>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Responses</h4>
                {selectedSession.responses.map((response: any, index: number) => (
                  <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Week {response.week} - {response.component}</p>
                    <p className="text-sm text-gray-900">"{response.response}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
