
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect } from 'react';
import { db } from '../services/db';
import { Session, Mode } from '../types';
import useLocalStorage from './useLocalStorage';

const useSessions = (projectId: string | null) => {
    const sessions = useLiveQuery<Session[]>(
        () => projectId
          ? db.sessions.where({ projectId }).sortBy('createdAt')
          : Promise.resolve([]),
        [projectId]
    ) || [];

    const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>('talia-active-session-id', null);
    
    const activeSession = sessions.find(s => s.id === activeSessionId) || null;

    useEffect(() => {
        if (sessions.length > 0 && (!activeSessionId || !sessions.find(s => s.id === activeSessionId))) {
            setActiveSessionId(sessions[0].id);
        }
    }, [sessions, projectId]);

    const createSession = async (mode: Mode) => {
        if (!projectId) return;
        const id = `session_${Date.now()}`;
        const newSession: Session = {
          id,
          projectId,
          title: mode === 'Âncora' ? 'Nova Conversa' : 'Nova Tradução',
          createdAt: Date.now(),
          mode: mode,
          isCustomTitle: false
        };
        await db.sessions.add(newSession);
        setActiveSessionId(id);
        return newSession;
    };

    const deleteSession = async (id: string) => {
        await db.transaction('rw', db.sessions, db.messages, db.assets, async () => {
          await db.messages.where({ sessionId: id }).delete();
          await db.assets.where({ sessionId: id }).delete();
          await db.sessions.delete(id);
        });
        if (activeSessionId === id) setActiveSessionId(null);
    };
    
    const renameSession = async (id: string, newTitle: string) => {
        await db.sessions.update(id, { title: newTitle, isCustomTitle: true });
    };
    
    const updateSession = async (id: string, updatedSessionData: Partial<Session>) => {
        await db.sessions.update(id, updatedSessionData);
    };

    return {
        sessions,
        activeSession,
        createSession,
        selectSession: setActiveSessionId,
        deleteSession,
        renameSession,
        updateSession,
    };
};

export default useSessions;
