
import { Dexie, type Table } from 'dexie';
import { Session, ChatMessage, ArchivedDocument, MediaAsset, Project } from '../types';

export class TaliaDB extends Dexie {
  projects!: Table<Project>;
  sessions!: Table<Session>;
  messages!: Table<ChatMessage>;
  archives!: Table<ArchivedDocument>;
  assets!: Table<MediaAsset>;

  constructor() {
    super('TaliaDB');
    
    // Schema evolution
    this.version(4).stores({
      projects: 'id, createdAt',
      sessions: 'id, projectId, mode, createdAt',
      messages: 'id, sessionId, timestamp',
      archives: 'id, createdAt',
      assets: 'id, sessionId, type, source, createdAt'
    });
  }
}

export const db = new TaliaDB();
