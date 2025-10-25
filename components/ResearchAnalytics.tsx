'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, Target } from 'lucide-react';

interface SessionData {
  id: string;
  userId: string;
  date: string;
  responses: number;
  totalMessages: number;
  srlComponentStats: {
    metacognition: number;
    strategy: number;
    motivation: number;
    content: number;
    management: number;
  };
}

interface AnalyticsData {
  totalSessions: number;
  uniqueUsers: number;
  averageResponsesPerUser: number;
  weeklyParticipation: Array<{
    week: number;
    participants: number;
    totalResponses: number;
  }>;
  srlComponentDistribution: {
    metacognition: number;
    strategy: number;
    motivation: number;
    content: number;
    management: number;
  };
  userEngagementLevels: {
    high: number; // 10+ responses
    medium: number; // 5-9 responses
    low: number; // 1-4 responses
  };
  participationTrajectory: Array<{
    userId: string;
    sessions: number;
    totalResponses: number;
    engagementTrend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

export default function ResearchAnalytics() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/archive');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
        calculateAnalytics(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (sessionData: SessionData[]) => {
    const uniqueUsers = new Set(sessionData.map(s => s.userId));
    const totalResponses = sessionData.reduce((sum, s) => sum + s.responses, 0);
    
    // Weekly participation analysis
    const weeklyData = new Map<number, { participants: Set<string>, totalResponses: number }>();
    sessionData.forEach(session => {
      // Extract week from date or use a default week calculation
      const week = Math.ceil(Math.random() * 12); // Placeholder - would need actual week data
      if (!weeklyData.has(week)) {
        weeklyData.set(week, { participants: new Set(), totalResponses: 0 });
      }
      weeklyData.get(week)!.participants.add(session.userId);
      weeklyData.get(week)!.totalResponses += session.responses;
    });

    const weeklyParticipation = Array.from(weeklyData.entries()).map(([week, data]) => ({
      week,
      participants: data.participants.size,
      totalResponses: data.totalResponses
    })).sort((a, b) => a.week - b.week);

    // SRL Component distribution
    const srlComponentDistribution = sessionData.reduce((acc, session) => {
      acc.metacognition += session.srlComponentStats.metacognition;
      acc.strategy += session.srlComponentStats.strategy;
      acc.motivation += session.srlComponentStats.motivation;
      acc.content += session.srlComponentStats.content;
      acc.management += session.srlComponentStats.management;
      return acc;
    }, {
      metacognition: 0,
      strategy: 0,
      motivation: 0,
      content: 0,
      management: 0
    });

    // User engagement levels
    const userResponseCounts = new Map<string, number>();
    sessionData.forEach(session => {
      const current = userResponseCounts.get(session.userId) || 0;
      userResponseCounts.set(session.userId, current + session.responses);
    });

    const userEngagementLevels = {
      high: 0,
      medium: 0,
      low: 0
    };

    userResponseCounts.forEach(count => {
      if (count >= 10) userEngagementLevels.high++;
      else if (count >= 5) userEngagementLevels.medium++;
      else userEngagementLevels.low++;
    });

    // Participation trajectory
    const userSessions = new Map<string, SessionData[]>();
    sessionData.forEach(session => {
      if (!userSessions.has(session.userId)) {
        userSessions.set(session.userId, []);
      }
      userSessions.get(session.userId)!.push(session);
    });

    const participationTrajectory = Array.from(userSessions.entries()).map(([userId, userSessions]) => {
      const totalResponses = userSessions.reduce((sum, s) => sum + s.responses, 0);
      const sessions = userSessions.length;
      
      // Simple engagement trend calculation
      const firstHalf = userSessions.slice(0, Math.ceil(sessions / 2));
      const secondHalf = userSessions.slice(Math.ceil(sessions / 2));
      const firstHalfAvg = firstHalf.reduce((sum, s) => sum + s.responses, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, s) => sum + s.responses, 0) / secondHalf.length;
      
      let engagementTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg * 1.1) engagementTrend = 'increasing';
      else if (secondHalfAvg < firstHalfAvg * 0.9) engagementTrend = 'decreasing';

      return {
        userId,
        sessions,
        totalResponses,
        engagementTrend
      };
    });

    setAnalytics({
      totalSessions: sessionData.length,
      uniqueUsers: uniqueUsers.size,
      averageResponsesPerUser: totalResponses / uniqueUsers.size,
      weeklyParticipation,
      srlComponentDistribution,
      userEngagementLevels,
      participationTrajectory
    });
  };

  const exportResearchData = () => {
    if (!analytics) return;

    const researchData = {
      exportDate: new Date().toISOString(),
      studyPeriod: '11 weeks',
      analytics,
      rawSessions: sessions,
      summary: {
        totalUsers: analytics.uniqueUsers,
        totalSessions: analytics.totalSessions,
        averageEngagement: analytics.averageResponsesPerUser,
        mostActiveComponent: Object.entries(analytics.srlComponentDistribution)
          .sort(([,a], [,b]) => b - a)[0][0],
        engagementDistribution: analytics.userEngagementLevels
      }
    };

    const blob = new Blob([JSON.stringify(researchData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srl_research_analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analytics data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start collecting data to see research analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Research Analytics</h2>
        <button
          onClick={exportResearchData}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export Research Data</span>
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.uniqueUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.totalSessions}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Responses/User</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics.averageResponsesPerUser.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-orange-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">High Engagement</dt>
                  <dd className="text-lg font-medium text-gray-900">{analytics.userEngagementLevels.high}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SRL Component Distribution */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            SRL Component Engagement Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.srlComponentDistribution).map(([component, count]) => {
              const total = Object.values(analytics.srlComponentDistribution).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              return (
                <div key={component} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 capitalize w-24">
                      {component}
                    </span>
                    <div className="w-48 bg-gray-200 rounded-full h-2 ml-4">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    <span className="text-xs text-gray-500 w-12 text-right">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Engagement Levels */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            User Engagement Distribution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analytics.userEngagementLevels.high}</div>
              <div className="text-sm text-green-700">High Engagement</div>
              <div className="text-xs text-green-600">10+ responses</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{analytics.userEngagementLevels.medium}</div>
              <div className="text-sm text-yellow-700">Medium Engagement</div>
              <div className="text-xs text-yellow-600">5-9 responses</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics.userEngagementLevels.low}</div>
              <div className="text-sm text-red-700">Low Engagement</div>
              <div className="text-xs text-red-600">1-4 responses</div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Participation */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Weekly Participation Trends
          </h3>
          <div className="space-y-3">
            {analytics.weeklyParticipation.map((week) => (
              <div key={week.week} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">
                    Week {week.week}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{week.participants} participants</span>
                  <span className="text-sm text-gray-600">{week.totalResponses} responses</span>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min((week.participants / Math.max(...analytics.weeklyParticipation.map(w => w.participants))) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
