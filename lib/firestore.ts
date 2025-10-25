import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { UserSession } from '@/types/srl';
import { ExportData } from '@/utils/data-export';

// Collection names
const COLLECTIONS = {
  SESSIONS: 'sessions',
  ARCHIVES: 'archives',
  RESPONSES: 'responses'
} as const;

// Types for Firestore documents
export interface FirestoreSession {
  id: string;
  userId: string;
  createdAt: Timestamp;
  lastActive: Timestamp;
  currentWeek: number;
  chatHistory: any[];
  isArchived: boolean;
}

export interface FirestoreArchive {
  id: string;
  sessionId: string;
  userId: string;
  archivedAt: Timestamp;
  exportData: ExportData;
  files: {
    json: string;
    csv: string;
    report: string;
  };
}

export interface FirestoreResponse {
  id: string;
  sessionId: string;
  userId: string;
  promptId: string;
  week: number;
  component: string;
  question: string;
  response: string;
  feedback: string;
  timestamp: Timestamp;
}

// Session operations
export async function saveSession(session: UserSession): Promise<string> {
  try {
    const sessionData: Omit<FirestoreSession, 'id'> = {
      userId: session.userId,
      createdAt: Timestamp.fromDate(new Date(session.createdAt)),
      lastActive: Timestamp.fromDate(new Date(session.lastActive)),
      currentWeek: session.currentWeek,
      chatHistory: session.chatHistory,
      isArchived: false
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.SESSIONS), sessionData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
}

export async function updateSession(sessionId: string, updates: Partial<UserSession>): Promise<void> {
  try {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    const updateData: any = {};

    if (updates.lastActive) {
      updateData.lastActive = Timestamp.fromDate(new Date(updates.lastActive));
    }
    if (updates.currentWeek !== undefined) {
      updateData.currentWeek = updates.currentWeek;
    }
    if (updates.chatHistory) {
      updateData.chatHistory = updates.chatHistory;
    }

    await updateDoc(sessionRef, updateData);
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

export async function getSession(sessionId: string): Promise<FirestoreSession | null> {
  try {
    const sessionRef = doc(db, COLLECTIONS.SESSIONS, sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (sessionSnap.exists()) {
      return { id: sessionSnap.id, ...sessionSnap.data() } as FirestoreSession;
    }
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    throw error;
  }
}

export async function getAllSessions(): Promise<FirestoreSession[]> {
  try {
    const sessionsRef = collection(db, COLLECTIONS.SESSIONS);
    const q = query(sessionsRef, orderBy('lastActive', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreSession[];
  } catch (error) {
    console.error('Error getting all sessions:', error);
    throw error;
  }
}

// Archive operations
export async function archiveSession(session: UserSession, exportData: ExportData): Promise<string> {
  try {
    const archiveData: Omit<FirestoreArchive, 'id'> = {
      sessionId: session.id,
      userId: session.userId,
      archivedAt: Timestamp.now(),
      exportData,
      files: {
        json: `${session.userId}_${new Date().toISOString()}.json`,
        csv: `${session.userId}_${new Date().toISOString()}.csv`,
        report: `${session.userId}_${new Date().toISOString()}_report.txt`
      }
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.ARCHIVES), archiveData);
    
    // Mark session as archived
    await updateSession(session.id, { isArchived: true });
    
    return docRef.id;
  } catch (error) {
    console.error('Error archiving session:', error);
    throw error;
  }
}

export async function getAllArchives(): Promise<FirestoreArchive[]> {
  try {
    const archivesRef = collection(db, COLLECTIONS.ARCHIVES);
    const q = query(archivesRef, orderBy('archivedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreArchive[];
  } catch (error) {
    console.error('Error getting all archives:', error);
    throw error;
  }
}

export async function getArchive(archiveId: string): Promise<FirestoreArchive | null> {
  try {
    const archiveRef = doc(db, COLLECTIONS.ARCHIVES, archiveId);
    const archiveSnap = await getDoc(archiveRef);
    
    if (archiveSnap.exists()) {
      return { id: archiveSnap.id, ...archiveSnap.data() } as FirestoreArchive;
    }
    return null;
  } catch (error) {
    console.error('Error getting archive:', error);
    throw error;
  }
}

// Response operations
export async function saveResponse(responseData: Omit<FirestoreResponse, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.RESPONSES), {
      ...responseData,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving response:', error);
    throw error;
  }
}

export async function getResponsesByUser(userId: string): Promise<FirestoreResponse[]> {
  try {
    const responsesRef = collection(db, COLLECTIONS.RESPONSES);
    const q = query(
      responsesRef, 
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreResponse[];
  } catch (error) {
    console.error('Error getting responses by user:', error);
    throw error;
  }
}

export async function getAllResponses(): Promise<FirestoreResponse[]> {
  try {
    const responsesRef = collection(db, COLLECTIONS.RESPONSES);
    const q = query(responsesRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreResponse[];
  } catch (error) {
    console.error('Error getting all responses:', error);
    throw error;
  }
}

// Analytics functions
export async function getAnalytics(): Promise<{
  totalSessions: number;
  totalArchives: number;
  totalResponses: number;
  activeUsers: number;
  weeklyStats: any[];
}> {
  try {
    const [sessions, archives, responses] = await Promise.all([
      getAllSessions(),
      getAllArchives(),
      getAllResponses()
    ]);

    const activeUsers = new Set(sessions.map(s => s.userId)).size;
    
    // Group responses by week
    const weeklyStats = responses.reduce((acc: any[], response) => {
      const week = response.week;
      const existing = acc.find(w => w.week === week);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ week, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => a.week - b.week);

    return {
      totalSessions: sessions.length,
      totalArchives: archives.length,
      totalResponses: responses.length,
      activeUsers,
      weeklyStats
    };
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw error;
  }
}
