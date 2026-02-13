import React, { useState } from 'react';
import { Session, Mode, ArchivedDocument } from '../../types';
import { PlusCircle, Trash2, Edit3, MessageSquare, Video, LayoutGrid, X, Bookmark, FileCode2 } from '../icons/Icons';
import FormatsPanel from '../FormatsPanel';
import GenerationOrchestrator from '../Generation/GenerationOrchestrator';
import ArchiveViewerModal from './ArchiveViewerModal';

interface HistoryPanelProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: (mode: Mode) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  archives: ArchivedDocument[];
  onAddArchive: (title: string, content: string) => void;
  onDeleteArchive: (id: string) => void;
  onRenameArchive: (id: string, newTitle: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  onRenameSession,
  isMobileOpen,
  onMobileClose,
  archives,
  onAddArchive,
  onDeleteArchive,
  onRenameArchive,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [activeView, setActiveView] = useState<'history' | 'formats' | 'archive'>('history');
  
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [currentFormatConfig, setCurrentFormatConfig] = useState(null);
  const [viewingArchive, setViewingArchive] = useState<ArchivedDocument | null>(null);

  const handleRename = (item: Session | ArchivedDocument) => {
    setEditingId(item.id);
    setRenameValue(item.title);
  };
  
  const handleRenameSubmit = (e: React.FormEvent, id: string, type: 'session' | 'archive') => {
    e.preventDefault();
    if (renameValue.trim()) {
      if (type === 'session') {
        onRenameSession(id, renameValue.trim());
      } else {
        onRenameArchive(id, renameValue.trim());
      }
    }
    setEditingId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string, type: 'session' | 'archive') => {
    if (e.key === 'Enter') {
      handleRenameSubmit(e, id, type);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleGenerateClick = (config: any) => {
    setCurrentFormatConfig(config);
    setIsGenerationModalOpen(true);
  };
  
  const HistoryView = () => (
    <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2 hide-scrollbar">
      {sessions.map(session => (
        <div key={session.id} className={`group flex items-center justify-between p-2 cursor-pointer transition-colors ${activeSessionId === session.id ? 'bg-red-600/50' : 'hover:bg-white/10'}`} onClick={() => { onSelectSession(session.id); onMobileClose(); }}>
          {editingId === session.id ? ( <form onSubmit={(e) => handleRenameSubmit(e, session.id, 'session')} className="flex-grow"><input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={(e) => handleRenameSubmit(e, session.id, 'session')} onKeyDown={(e) => handleKeyDown(e, session.id, 'session')} className="w-full bg-gray-900 border border-red-500 text-sm p-1" autoFocus/></form>) : (<>
            <div className="flex items-center gap-2 overflow-hidden">
                {session.mode === 'Âncora' ? <MessageSquare className="w-4 h-4 flex-shrink-0" /> : <Video className="w-4 h-4 flex-shrink-0" />}
                <span className="truncate text-sm [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]" title={session.title}>{session.title}</span>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleRename(session);}} className="p-1 hover:text-red-400" title="Renomear"><Edit3 className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1 hover:text-red-400" title="Deletar"><Trash2 className="w-4 h-4" /></button>
            </div></>)}
        </div>
      ))}
      {sessions.length === 0 && (<p className="text-center text-gray-400 text-sm mt-4">Nenhuma sessão encontrada.</p>)}
    </div>
  );

  const ArchiveView = () => (
    <div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2 hide-scrollbar">
      {archives.map(archive => (
        <div key={archive.id} className="group flex items-center justify-between p-2 cursor-pointer hover:bg-white/10" onClick={() => setViewingArchive(archive)}>
          {editingId === archive.id ? (<form onSubmit={(e) => handleRenameSubmit(e, archive.id, 'archive')} className="flex-grow"><input type="text" value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onBlur={(e) => handleRenameSubmit(e, archive.id, 'archive')} onKeyDown={(e) => handleKeyDown(e, archive.id, 'archive')} className="w-full bg-gray-900 border border-red-500 text-sm p-1" autoFocus /></form>) : (<>
            <div className="flex items-center gap-2 overflow-hidden">
                <FileCode2 className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]" title={archive.title}>{archive.title}</span>
            </div>
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); handleRename(archive); }} className="p-1 hover:text-red-400" title="Renomear"><Edit3 className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteArchive(archive.id); }} className="p-1 hover:text-red-400" title="Deletar"><Trash2 className="w-4 h-4" /></button>
            </div></>)}
        </div>
      ))}
       {archives.length === 0 && (<p className="text-center text-gray-400 text-sm mt-4">Nenhum documento arquivado.</p>)}
    </div>
  );

  return (
    <>
      <div className={`w-full max-w-xs flex-col bg-black/20 backdrop-blur-lg border-r border-white/20 p-4 h-full fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex`}>
        <div className="flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">
              {activeView === 'history' && 'Histórico'}
              {activeView === 'formats' && 'Formatos'}
              {activeView === 'archive' && 'Arquivo'}
            </h2>
            {activeView === 'history' && (<button onClick={() => onCreateSession('Âncora')} className="hidden md:block text-gray-300 hover:text-white transition-colors" title="Nova Conversa"><PlusCircle className="w-6 h-6" /></button>)}
            <button onClick={onMobileClose} className="md:hidden text-gray-300 hover:text-white transition-colors" title="Fechar"><X className="w-6 h-6" /></button>
          </div>

          <div className="grid grid-cols-3 p-1 bg-black/40 border border-white/10 mb-4 space-x-1">
            <button onClick={() => setActiveView('history')} className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 transition-colors ${activeView === 'history' ? 'bg-red-600/50 text-white' : 'hover:bg-white/10 text-gray-300'}`}>
              <MessageSquare className="w-4 h-4"/><span>Histórico</span>
            </button>
            <button onClick={() => setActiveView('formats')} className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 transition-colors ${activeView === 'formats' ? 'bg-red-600/50 text-white' : 'hover:bg-white/10 text-gray-300'}`}>
              <LayoutGrid className="w-4 h-4"/><span>Formatos</span>
            </button>
            <button onClick={() => setActiveView('archive')} className={`flex-1 flex items-center justify-center gap-2 text-sm py-2 transition-colors ${activeView === 'archive' ? 'bg-red-600/50 text-white' : 'hover:bg-white/10 text-gray-300'}`}>
              <Bookmark className="w-4 h-4"/><span>Arquivo</span>
            </button>
          </div>
        </div>

        <div className="flex-grow flex flex-col overflow-hidden">
          {activeView === 'history' && <HistoryView />}
          {activeView === 'formats' && <FormatsPanel onGenerate={handleGenerateClick} />}
          {activeView === 'archive' && <ArchiveView />}
        </div>
      </div>
      
      <GenerationOrchestrator 
        isOpen={isGenerationModalOpen}
        onClose={() => setIsGenerationModalOpen(false)}
        sessions={sessions}
        formatConfig={currentFormatConfig}
        onAddArchive={onAddArchive}
      />
      {viewingArchive && (
        <ArchiveViewerModal 
          archive={viewingArchive}
          onClose={() => setViewingArchive(null)}
        />
      )}
    </>
  );
};

export default HistoryPanel;