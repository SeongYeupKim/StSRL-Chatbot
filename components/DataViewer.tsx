'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, FileText, Calendar, User, Filter, SortAsc, SortDesc, Users, BarChart3, CheckSquare, Square } from 'lucide-react';

interface ArchivedSession {
  id: string;
  filename: string;
  userId: string;
  timestamp: string;
  date: string;
  sessionId: string;
  totalMessages: number;
  responses: number;
  srlComponentStats: {
    metacognition: number;
    strategy: number;
    motivation: number;
    content: number;
    management: number;
  };
  weeklyProgress?: Array<{
    week: number;
    promptsCompleted: number;
    averageResponseLength: number;
    componentsCovered: string[];
  }>;
  detailedResponses?: Array<{
    promptId: string;
    week: number;
    component: string;
    question: string;
    response: string;
    feedback: string;
    timestamp: string;
  }>;
}

export default function DataViewer() {
  const [sessions, setSessions] = useState<ArchivedSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<ArchivedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  // Filter and sort states
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [filterUserId, setFilterUserId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'userId' | 'responses'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'individual' | 'aggregated'>('individual');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [sessions, filterUserId, filterDate, sortBy, sortOrder, viewMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDropdown && !target.closest('[data-dropdown-container]')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

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

  const applyFiltersAndSort = () => {
    let filtered = [...sessions];

    // Apply filters
    if (filterUserId) {
      filtered = filtered.filter(session => 
        session.userId.toLowerCase().includes(filterUserId.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(session => 
        session.date.includes(filterDate)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'userId':
          comparison = a.userId.localeCompare(b.userId);
          break;
        case 'responses':
          comparison = a.responses - b.responses;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply aggregation if needed
    if (viewMode === 'aggregated') {
      filtered = aggregateSessionsByUser(filtered);
    }

    setFilteredSessions(filtered);
  };

  const aggregateSessionsByUser = (sessions: ArchivedSession[]): ArchivedSession[] => {
    const userMap = new Map<string, ArchivedSession>();
    
    sessions.forEach(session => {
      if (userMap.has(session.userId)) {
        const existing = userMap.get(session.userId)!;
        // Merge data - keep the latest session info but aggregate responses
        userMap.set(session.userId, {
          ...existing,
          responses: existing.responses + session.responses,
          totalMessages: existing.totalMessages + session.totalMessages,
          srlComponentStats: {
            metacognition: existing.srlComponentStats.metacognition + session.srlComponentStats.metacognition,
            strategy: existing.srlComponentStats.strategy + session.srlComponentStats.strategy,
            motivation: existing.srlComponentStats.motivation + session.srlComponentStats.motivation,
            content: existing.srlComponentStats.content + session.srlComponentStats.content,
            management: existing.srlComponentStats.management + session.srlComponentStats.management,
          }
        });
      } else {
        userMap.set(session.userId, { ...session });
      }
    });
    
    return Array.from(userMap.values());
  };

  const downloadFile = async (archiveId: string, type: 'json' | 'csv' | 'report') => {
    try {
      const response = await fetch(`/api/archive/download?id=${archiveId}&type=${type}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${archiveId}_${type}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const viewSessionDetails = async (archiveId: string) => {
    try {
      const response = await fetch(`/api/archive/download?id=${archiveId}&type=json`);
      if (response.ok) {
        const data = await response.json();
        setSelectedSession(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error viewing session:', error);
    }
  };

  const toggleSessionSelection = (sessionId: string) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const selectAllSessions = () => {
    const allIds = new Set(filteredSessions.map(session => session.id));
    setSelectedSessions(allIds);
  };

  const clearSelection = () => {
    setSelectedSessions(new Set());
  };

  const bulkDownload = async (type: 'json' | 'csv' | 'report') => {
    const selectedIds = Array.from(selectedSessions);
    if (selectedIds.length === 0) {
      alert('다운로드할 세션을 선택해주세요.');
      return;
    }

    for (const id of selectedIds) {
      await downloadFile(id, type);
      // Add small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const exportAllData = async (format: 'json' | 'csv' | 'csv-student' | 'csv-response') => {
    try {
      const response = await fetch('/api/archive');
      if (response.ok) {
        const data = await response.json();
        const allSessions = data.sessions || [];
        
        if (format === 'json') {
          // Create comprehensive export data for JSON
          const exportData = {
            exportDate: new Date().toISOString(),
            totalSessions: allSessions.length,
            uniqueUsers: new Set(allSessions.map((s: any) => s.userId)).size,
            sessions: allSessions,
            aggregatedByUser: aggregateSessionsByUser(allSessions)
          };

          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `srl_research_data_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else if (format === 'csv-student') {
          // LMS-style CSV: One row per student with aggregated data
          
          // First, collect all unique weeks
          const allWeeks = new Set<number>();
          allSessions.forEach((session: any) => {
            if (session.weeklyProgress) {
              session.weeklyProgress.forEach((wp: any) => {
                allWeeks.add(wp.week);
              });
            }
          });
          const weeksList = Array.from(allWeeks).sort((a, b) => a - b);
          
          // Create headers with week columns
          const csvHeaders = [
            'Student ID',
            'First Name',
            'Last Name',
            'Total Sessions',
            'Total Responses',
            'Total Messages',
            'First Session Date',
            'Last Session Date',
            ...weeksList.map(week => `Week ${week}`)
          ];

          // Aggregate data by student
          const studentData = new Map<string, any>();
          
          allSessions.forEach((session: any) => {
            if (!studentData.has(session.userId)) {
              const weekCounts: { [key: number]: number } = {};
              weeksList.forEach(week => { weekCounts[week] = 0; });
              
              studentData.set(session.userId, {
                studentId: session.userId,
                totalSessions: 0,
                totalResponses: 0,
                totalMessages: 0,
                weeks: new Set(),
                weekCounts: weekCounts,
                firstDate: session.date,
                lastDate: session.date
              });
            }
            
            const student = studentData.get(session.userId)!;
            student.totalSessions++;
            student.totalResponses += session.responses;
            student.totalMessages += session.totalMessages;
            
            // Count responses per week
            if (session.weeklyProgress) {
              session.weeklyProgress.forEach((wp: any) => {
                student.weeks.add(wp.week);
                if (student.weekCounts[wp.week] !== undefined) {
                  student.weekCounts[wp.week] += wp.promptsCompleted || 1;
                }
              });
            }
            
            // Update dates
            if (session.date < student.firstDate) student.firstDate = session.date;
            if (session.date > student.lastDate) student.lastDate = session.date;
          });

          const csvRows = Array.from(studentData.values()).map(student => [
            student.studentId,
            student.firstName || '', // TODO: Fetch from users collection
            student.lastName || '', // TODO: Fetch from users collection
            student.totalSessions,
            student.totalResponses,
            student.totalMessages,
            student.firstDate,
            student.lastDate,
            ...weeksList.map(week => student.weekCounts[week] || 0)
          ]);

          const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `srl_student_data_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else if (format === 'csv-response' || format === 'csv') {
          // Response-level CSV: Group by user + week, combine all responses in one row
          
          // Group sessions by userId and week
          const sessionGroups = new Map<string, any>();
          
          allSessions.forEach((session: any) => {
            if (session.detailedResponses && session.detailedResponses.length > 0) {
              session.detailedResponses.forEach((response: any) => {
                const key = `${session.userId}_${response.week}`;
                if (!sessionGroups.has(key)) {
                  sessionGroups.set(key, {
                    userId: session.userId,
                    week: response.week,
                    date: session.date,
                    responses: []
                  });
                }
                sessionGroups.get(key)!.responses.push(response);
              });
            }
          });
          
          // Find max number of responses to create dynamic columns
          let maxResponses = 0;
          sessionGroups.forEach((group) => {
            if (group.responses.length > maxResponses) {
              maxResponses = group.responses.length;
            }
          });
          
          // Create dynamic headers
          const csvHeaders = [
            'User ID',
            'Week',
            'Date'
          ];
          
          for (let i = 1; i <= maxResponses; i++) {
            csvHeaders.push(
              `Response ${i}`,
              `AI Feedback ${i}`
            );
          }
          
          // Create rows
          const csvRows: any[] = [];
          sessionGroups.forEach((group) => {
            const row: any[] = [
              group.userId,
              group.week,
              group.date
            ];
            
            // Add all responses and feedbacks
            for (let i = 0; i < maxResponses; i++) {
              if (i < group.responses.length) {
                const response = group.responses[i];
                row.push(response.response || '');
                row.push(response.feedback || '');
              } else {
                row.push('');
                row.push('');
              }
            }
            
            csvRows.push(row);
          });

          const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map((row: any[]) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `srl_response_log_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (error) {
      console.error('Error exporting all data:', error);
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
        <h2 className="text-2xl font-bold text-gray-900">Research Data Archive</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportAllData('json')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Export All JSON</span>
          </button>
          <div className="relative" data-dropdown-container onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Export All CSV</span>
            </button>
            {showDropdown && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border z-50"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
                data-dropdown-container
              >
                <div className="p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportAllData('csv-student');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    📊 Student-level (LMS style)
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportAllData('csv-response');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    📝 Response-level (Detailed log)
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={fetchSessions}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
            <div className="flex rounded-lg border">
              <button
                onClick={() => setViewMode('individual')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-l-lg ${
                  viewMode === 'individual'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Individual
              </button>
              <button
                onClick={() => setViewMode('aggregated')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-r-lg ${
                  viewMode === 'aggregated'
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                By Student
              </button>
            </div>
          </div>

          {/* User ID Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Student ID</label>
            <input
              type="text"
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              placeholder="Enter student ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'userId' | 'responses')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="date">Date</option>
                <option value="userId">Student ID</option>
                <option value="responses">Responses</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectAllSessions}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Select All ({filteredSessions.length})
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-gray-600 hover:text-gray-700"
            >
              Clear Selection
            </button>
            <span className="text-sm text-gray-500">
              {selectedSessions.size} selected
            </span>
          </div>
          
          {selectedSessions.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Bulk Download:</span>
              <button
                onClick={() => bulkDownload('json')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                JSON
              </button>
              <button
                onClick={() => bulkDownload('csv')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                CSV
              </button>
              <button
                onClick={() => bulkDownload('report')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                Reports
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {sessions.length === 0 ? 'No archived sessions' : 'No sessions match your filters'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {sessions.length === 0 
              ? 'Start using the chatbot to generate session data.'
              : 'Try adjusting your filters to see more results.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">
                {viewMode === 'aggregated' ? 'Students' : 'Sessions'} ({filteredSessions.length})
              </h3>
              {viewMode === 'aggregated' && (
                <span className="text-xs text-gray-500">
                  Aggregated by student ID
                </span>
              )}
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredSessions.map((session) => (
              <li key={session.id} className="hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Selection Checkbox */}
                      <button
                        onClick={() => toggleSessionSelection(session.id)}
                        className="flex-shrink-0"
                      >
                        {selectedSessions.has(session.id) ? (
                          <CheckSquare className="h-5 w-5 text-primary-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                      
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {session.userId}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{session.date}</span>
                          <span>{session.responses} responses</span>
                          <span>{session.totalMessages} messages</span>
                          {session.weeklyProgress && session.weeklyProgress.length > 0 && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Weeks: {session.weeklyProgress.map((wp: any) => wp.week).join(', ')}
                            </span>
                          )}
                          {viewMode === 'aggregated' && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Aggregated
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewSessionDetails(session.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => downloadFile(session.id, 'json')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        JSON
                      </button>
                      <button
                        onClick={() => downloadFile(session.id, 'csv')}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        CSV
                      </button>
                      <button
                        onClick={() => downloadFile(session.id, 'report')}
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
                <p className="text-sm text-gray-600">Prompts Completed: {selectedSession.responses?.length || 0}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">SRL Component Engagement</h4>
                {selectedSession.srlComponentStats && Object.entries(selectedSession.srlComponentStats).map(([component, count]: [string, any]) => (
                  <p key={component} className="text-sm text-gray-600">
                    {component}: {count} responses
                  </p>
                ))}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Responses</h4>
                {selectedSession.responses?.map((response: any, index: number) => (
                  <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-xs text-gray-500">Week {response.week} - {response.component}</p>
                    <p className="text-sm text-gray-900">"{response.response}"</p>
                  </div>
                )) || <p className="text-sm text-gray-500">No responses available</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
