
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { Project } from '../types';
import useLocalStorage from './useLocalStorage';

const useProjects = () => {
  const projects = useLiveQuery(() => db.projects.orderBy('createdAt').reverse().toArray()) || [];
  const [activeProjectId, setActiveProjectId] = useLocalStorage<string | null>('talia-active-project-id', null);

  const createProject = async (title: string = 'Novo Projeto') => {
    const id = `project_${Date.now()}`;
    const newProject: Project = { id, title, createdAt: Date.now() };
    await db.projects.add(newProject);
    setActiveProjectId(id);
    return newProject;
  };

  const deleteProject = async (id: string) => {
    await db.transaction('rw', db.projects, db.sessions, db.messages, db.assets, async () => {
      const sessions = await db.sessions.where({ projectId: id }).toArray();
      for (const s of sessions) {
        await db.messages.where({ sessionId: s.id }).delete();
        await db.assets.where({ sessionId: s.id }).delete();
      }
      await db.sessions.where({ projectId: id }).delete();
      await db.projects.delete(id);
    });
    if (activeProjectId === id) setActiveProjectId(null);
  };

  const renameProject = async (id: string, newTitle: string) => {
    await db.projects.update(id, { title: newTitle });
  };

  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    createProject,
    deleteProject,
    renameProject
  };
};

export default useProjects;
