import React, { useMemo } from 'react';
import { ArchivedDocument } from '../../types';
import { X } from '../icons/Icons';

// Use a global instance of markdown-it and DOMPurify
const md = (window as any).markdownit();
const DOMPurify = (window as any).DOMPurify;

interface ArchiveViewerModalProps {
  archive: ArchivedDocument;
  onClose: () => void;
}

const ArchiveViewerModal: React.FC<ArchiveViewerModalProps> = ({ archive, onClose }) => {
  const renderedHtml = useMemo(() => {
    const raw = md.render(archive.content);
    return DOMPurify.sanitize(raw);
  }, [archive.content]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in p-4 sm:p-8 md:p-12">
      <div className="bg-[#1a1a1a] border border-white/20 w-full h-full flex flex-col max-w-4xl shadow-2xl rounded-lg overflow-hidden">
        <header className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0 bg-black/40">
          <h2 className="text-2xl font-serif font-bold text-white truncate [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]" title={archive.title}>
            {archive.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </header>
        <main 
          className="flex-grow p-8 overflow-y-auto markdown-content bg-black/20" 
          dangerouslySetInnerHTML={{ __html: renderedHtml }} 
        />
         <footer className="p-4 border-t border-white/10 text-center text-xs text-gray-500 bg-black/40">
            Arquivado em: {new Date(archive.createdAt).toLocaleString('pt-BR')}
        </footer>
      </div>
    </div>
  );
};

export default ArchiveViewerModal;