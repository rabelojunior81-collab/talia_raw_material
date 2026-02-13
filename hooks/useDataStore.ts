
import { db } from '../services/db';
import { ChatMessage, Session, Mode } from '../types';

export const useDataStore = () => {
  
  // Fix: Added projectId to parameters to satisfy Session interface requirements
  const createSession = async (projectId: string, mode: Mode): Promise<Session> => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      projectId,
      title: mode === 'Âncora' ? 'Nova Conversa' : 'Nova Tradução',
      createdAt: Date.now(),
      mode: mode,
    };
    await db.sessions.add(newSession);
    return newSession;
  };

  const addMessage = async (sessionId: string, role: 'user' | 'model', text: string, mediaAssets?: File[] | Blob[], sources?: any[]) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      role,
      text,
      mediaAssets: mediaAssets ? Array.from(mediaAssets) : undefined, // Store as Blob array
      timestamp: Date.now(),
      sources
    };

    await db.messages.add(newMessage);
    
    // Update session preview
    await db.sessions.update(sessionId, {
      lastMessagePreview: text.slice(0, 100)
    });

    return newMessage;
  };

  const updateSessionTitle = async (id: string, title: string) => {
    await db.sessions.update(id, { title });
  };

  const updateSessionData = async (id: string, data: Partial<Session>) => {
    await db.sessions.update(id, data);
  };

  const deleteSession = async (id: string) => {
    await db.transaction('rw', db.sessions, db.messages, async () => {
      await db.messages.where({ sessionId: id }).delete();
      await db.sessions.delete(id);
    });
  };

  return {
    createSession,
    addMessage,
    updateSessionTitle,
    updateSessionData,
    deleteSession,
    db // Expose db for direct queries if needed
  };
};
