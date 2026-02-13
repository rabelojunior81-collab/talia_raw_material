
import React, { useState } from 'react';
import { Session, Mode, ArchivedDocument } from '../types';
import { PlusCircle, Trash2, Edit3, MessageSquare, Video, LayoutGrid, Bookmark, FileCode2, ChevronRight, Activity, Menu } from './icons/Icons';
import FormatsPanel from './FormatsPanel';
import GenerationOrchestrator from './Generation/GenerationOrchestrator';
import ArchiveViewerModal from './History/ArchiveViewerModal';

interface SidebarProps {
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

const Sidebar: React.FC<SidebarProps> = ({
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
  const [activeTab, setActiveTab] = useState<'history' | 'formats' | 'archive' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
  const [currentFormatConfig, setCurrentFormatConfig] = useState(null);
  const [viewingArchive, setViewingArchive] = useState<ArchivedDocument | null>(null);

  // Auto-expand if active tab matches content, but allow collapsing by clicking again
  const toggleTab = (tab: 'history' | 'formats' | 'archive') => {
      if (activeTab === tab) setActiveTab(null);
      else setActiveTab(tab);
  };

  const handleRenameSubmit = (e: React.FormEvent, id: string, type: 'session' | 'archive') => {
    e.preventDefault();
    if (renameValue.trim()) {
      if (type === 'session') onRenameSession(id, renameValue.trim());
      else onRenameArchive(id, renameValue.trim());
    }
    setEditingId(null);
  };

  const SessionsList = () => (
    <div className="flex flex-col gap-1 p-2">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2 pt-2">Conversas</h3>
      <button 
        onClick={() => onCreateSession('Âncora')}
        className="flex items-center gap-2 w-full p-3 text-xs text-red-300 hover:text-white hover:bg-red-500/10 rounded-none transition-colors border border-dashed border-red-500/20 hover:border-red-500/40 mb-3"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span className="font-medium tracking-wide">Nova Conversa</span>
      </button>

      <div className="space-y-1">
      {sessions.map(session => (
        <div key={session.id} 
             className={`group relative flex items-center gap-3 p-3 rounded-none cursor-pointer transition-all border border-transparent ${activeSessionId === session.id ? 'bg-white/5 border-white/5 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
             onClick={() => { onSelectSession(session.id); if (window.innerWidth < 768) onMobileClose(); }}
        >
           {editingId === session.id ? (
               <form onSubmit={(e) => handleRenameSubmit(e, session.id, 'session')} className="w-full">
                   <input 
                    autoFocus
                    value={renameValue} 
                    onChange={(e) => setRenameValue(e.target.value)} 
                    onBlur={() => setEditingId(null)}
                    className="w-full bg-black/50 border border-red-500 rounded-none px-1.5 py-1 text-xs text-white focus:outline-none font-sans"
                   />
               </form>
           ) : (
             <>
               <div className={`w-1.5 h-1.5 rounded-none flex-shrink-0 ${session.mode === 'Âncora' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]'}`}></div>
               <span className="truncate text-xs flex-grow font-medium">{session.title}</span>
               
               <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center bg-[#1a1a1a]/90 backdrop-blur-sm shadow-lg border border-white/10 scale-90">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(session.id); setRenameValue(session.title); }} className="p-1.5 hover:text-white transition-colors"><Edit3 className="w-3 h-3"/></button>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }} className="p-1.5 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3"/></button>
               </div>
             </>
           )}
        </div>
      ))}
      </div>
    </div>
  );

  const ArchivesList = () => (
    <div className="flex flex-col gap-1 p-2">
       <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2 pt-2">Arquivo Morto</h3>
       {archives.length === 0 && <p className="text-xs text-gray-600 px-2 italic">Nenhum documento.</p>}
       {archives.map(doc => (
           <div key={doc.id} onClick={() => setViewingArchive(doc)} className="group flex items-center gap-3 p-3 rounded-none cursor-pointer text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent hover:border-white/5 transition-all">
               <FileCode2 className="w-3.5 h-3.5 flex-shrink-0" />
               <span className="truncate text-xs flex-grow font-medium">{doc.title}</span>
               <div className="opacity-0 group-hover:opacity-100 flex items-center">
                  <button onClick={(e) => { e.stopPropagation(); onDeleteArchive(doc.id); }} className="p-1 hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
               </div>
           </div>
       ))}
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-fade-in" onClick={onMobileClose}></div>}

      <div className={`fixed md:relative z-50 h-full flex transition-transform duration-300 flex-shrink-0 shadow-2xl ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* SLIM DOCK - Square */}
        <div className="w-[72px] bg-[#050505]/90 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-6 gap-6 z-50 h-full flex-shrink-0">
           <div className="mb-2 flex-shrink-0">
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-none bg-gradient-to-br from-red-700 to-black border border-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(185,28,28,0.2)]">
                 <span className="font-serif font-bold text-white text-xl translate-y-[-1px]">t.</span>
              </div>
           </div>

           <div className="flex flex-col gap-4 w-full px-0 items-center">
              <button 
                onClick={() => toggleTab('history')}
                className={`w-full p-4 transition-all duration-300 group relative flex items-center justify-center border-l-2 ${activeTab === 'history' ? 'bg-white/5 text-white border-red-500' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border-transparent'}`}
                title="Histórico"
              >
                  <MessageSquare className="w-5 h-5" />
                  <span className="absolute left-16 bg-black/90 text-white text-[10px] font-bold tracking-wide uppercase px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10 backdrop-blur-md shadow-xl translate-x-[-5px] group-hover:translate-x-0 duration-200">Histórico</span>
              </button>

              <button 
                onClick={() => toggleTab('formats')}
                className={`w-full p-4 transition-all duration-300 group relative flex items-center justify-center border-l-2 ${activeTab === 'formats' ? 'bg-white/5 text-white border-red-500' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border-transparent'}`}
                title="Formatos & Geradores"
              >
                  <LayoutGrid className="w-5 h-5" />
                  <span className="absolute left-16 bg-black/90 text-white text-[10px] font-bold tracking-wide uppercase px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10 backdrop-blur-md shadow-xl translate-x-[-5px] group-hover:translate-x-0 duration-200">Formatos</span>
              </button>

              <button 
                onClick={() => toggleTab('archive')}
                className={`w-full p-4 transition-all duration-300 group relative flex items-center justify-center border-l-2 ${activeTab === 'archive' ? 'bg-white/5 text-white border-red-500' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300 border-transparent'}`}
                title="Arquivo"
              >
                  <Bookmark className="w-5 h-5" />
                  <span className="absolute left-16 bg-black/90 text-white text-[10px] font-bold tracking-wide uppercase px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/10 backdrop-blur-md shadow-xl translate-x-[-5px] group-hover:translate-x-0 duration-200">Arquivo</span>
              </button>
           </div>
           
           <div className="mt-auto flex-shrink-0 mb-4">
              <div className={`w-1.5 h-1.5 rounded-none ${activeSessionId ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-800'}`}></div>
           </div>
        </div>

        {/* DRAWER PANEL - Square */}
        <div className={`bg-[#0a0a0a]/95 backdrop-blur-xl border-r border-white/5 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-hidden ${activeTab ? 'w-72 translate-x-0 opacity-100 shadow-[20px_0_50px_rgba(0,0,0,0.5)]' : 'w-0 -translate-x-full opacity-0 border-none'}`}>
           <div className="h-full overflow-y-auto hide-scrollbar w-72 flex flex-col">
              <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]/50 sticky top-0 z-10 backdrop-blur-md">
                 <h2 className="font-semibold text-white tracking-wide text-sm font-serif">
                    {activeTab === 'history' && 'Histórico de Sessões'}
                    {activeTab === 'formats' && 'Gerador de Documentos'}
                    {activeTab === 'archive' && 'Arquivo Permanente'}
                 </h2>
                 <button onClick={() => setActiveTab(null)} className="text-gray-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-none"><ChevronRight className="w-4 h-4" /></button>
              </div>
              
              <div className="p-0 flex-grow">
                 {activeTab === 'history' && <SessionsList />}
                 {activeTab === 'formats' && <FormatsPanel onGenerate={(cfg) => { setCurrentFormatConfig(cfg); setIsGenerationModalOpen(true); }} />}
                 {activeTab === 'archive' && <ArchivesList />}
              </div>
           </div>
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

export default Sidebar;
