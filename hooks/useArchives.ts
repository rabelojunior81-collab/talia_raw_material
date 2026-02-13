
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { ArchivedDocument } from '../types';

const useArchives = () => {
    const archives = useLiveQuery(
        () => db.archives.orderBy('createdAt').reverse().toArray(),
        []
    ) || [];

    const addArchive = async (title: string, content: string) => {
        const newArchive: ArchivedDocument = {
            id: `archive_${Date.now()}`,
            title,
            content,
            createdAt: Date.now(),
        };
        await db.archives.add(newArchive);
        return newArchive;
    };

    const deleteArchive = async (id: string) => {
        await db.archives.delete(id);
    };

    const renameArchive = async (id: string, newTitle: string) => {
        await db.archives.update(id, { title: newTitle });
    };

    return {
        archives,
        addArchive,
        deleteArchive,
        renameArchive,
    };
};

export default useArchives;
