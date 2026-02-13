
import React, { useState } from 'react';
import { Project, Session, DocumentoArquivado, MediaAsset } from '../types';
import { ChevronDown, Folder, FileText, Plus, Trash2, Edit3, Bookmark, ChevronLeft, Menu, MessageSquare, PlusCircle, Clock, Image, Video, Activity } from './icons/Icons';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';

interface MemorySidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onDeleteProject: (id: string) => void;
  onRenameProject: (id: string, title: string) => void;
  
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onCreateSession: () => void;
  onRenameSession: (id: string, title: string) => void;
  
  archives: DocumentoArquivado[];
  onDeleteArchive: (id: string) => void;

  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onFocusAsset: (id: string) => void;
}

const MemorySidebar: React.FC<MemorySidebarProps> = ({ 
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRenameProject,
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onDeleteSession, 
  onCreateSession, 
  onRenameSession,
  isCollapsed,
  onToggleCollapse,
  onFocusAsset
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editingType, setEditingType] = useState<'project' | 'session' | null>(null);

  const activeSessionAssets = useLiveQuery<MediaAsset[]>(
    () => activeSessionId ? db.assets.where({ sessionId: activeSessionId }).toArray() : Promise.resolve([]),
    [activeSessionId]
  ) || [];

  const handleStartRename = (e: React.MouseEvent, id: string, title: string, type: 'project' | 'session') => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title);
    setEditingType(type);
  };

  const handleFinishRename = (id: string) => {
    if (editValue.trim() && editingType) {
      if (editingType === 'project') onRenameProject(id, editValue.trim());
      else onRenameSession(id, editValue.trim());
    }
    setEditingId(null);
    setEditingType(null);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
        case 'imagem': case 'image': return <Image className="w-3 h-3 text-pink-400" />;
        case 'video': return <Video className="w-3 h-3 text-blue-400" />;
        case 'audio': return <Activity className="w-3 h-3 text-green-400" />;
        case 'codigo': return <FileText className="w-3 h-3 text-yellow-400" />;
        default: return <FileText className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-[50px]' : 'w-[250px]'} bg-[#050506]/50 backdrop-blur-2xl border-r border-white/5 flex flex-col h-full z-30 select-none transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
      
      <div className="h-10 flex items-center justify-between px-3 border-b border-white/5 bg-transparent shrink-0">
         {!isCollapsed && <h2 className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] truncate pl-1">MEMÓRIA</h2>}
         <button onClick={onToggleCollapse} className="p-1.5 hover:bg-white/5 text-gray-600 hover:text-white transition-all mx-auto rounded-none">
            {isCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
         </button>
      </div>

      <div className="flex-grow overflow-y-auto py-4 overflow-x-hidden hide-scrollbar bg-transparent">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
             <button onClick={onCreateProject} className="p-2 text-gray-600 hover:text-talia-red transition-all" title="Novo Projeto"><PlusCircle className="w-5 h-5" /></button>
             {projects.map(p => (
                <button 
                  key={p.id} 
                  onClick={() => onSelectProject(p.id)}
                  className={`p-2 transition-all rounded-full ${activeProjectId === p.id ? 'text-talia-red bg-white/10 shadow-[0_0_15px_rgba(255,59,59,0.3)]' : 'text-gray-600 hover:text-gray-300'}`}
                  title={p.title}
                >
                  <Folder className="w-5 h-5" />
                </button>
             ))}
          </div>
        ) : (
          <section className="px-0">
            <div className="px-4 py-3 flex items-center justify-between text-gray-500 mb-2 border-b border-white/5">
               <div className="flex items-center gap-2">
                 <Bookmark className="w-3 h-3" />
                 <span className="text-[9px] font-bold uppercase tracking-[0.2em]">PROJETOS</span>
               </div>
               <button onClick={() => onCreateProject()} className="p-1.5 hover:bg-white/5 hover:text-white transition-colors rounded-full" title="Criar Projeto"><Plus className="w-3.5 h-3.5" /></button>
            </div>

            <div className="space-y-1">
               {projects.map(p => (
                  <div key={p.id} className="group flex flex-col mb-1">
                      <div 
                        onClick={() => onSelectProject(p.id)}
                        className={`flex items-center justify-between py-3 px-4 cursor-pointer transition-all border-l-[3px] ${activeProjectId === p.id ? 'bg-gradient-to-r from-white/[0.08] to-transparent border-talia-red text-white shadow-[inset_1px_0_0_rgba(255,255,255,0.1)]' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'}`}
                      >
                          <div className="flex flex-col truncate flex-1 pr-2">
                              <div className="flex items-center gap-3 mb-0.5">
                                  <Folder className={`w-4 h-4 flex-shrink-0 ${activeProjectId === p.id ? 'text-talia-red' : 'text-gray-600 group-hover:text-gray-400'}`} />
                                  {editingId === p.id && editingType === 'project' ? (
                                      <input autoFocus className="bg-black/80 text-[11px] border border-talia-red/50 px-1.5 py-0.5 outline-none w-full text-white font-sans rounded-none" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleFinishRename(p.id)} onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(p.id)} onClick={(e) => e.stopPropagation()} />
                                  ) : (
                                      <span className="text-[12px] truncate font-bold tracking-tight uppercase">{p.title}</span>
                                  )}
                              </div>
                              <div className="flex items-center gap-1.5 ml-7 opacity-50 group-hover:opacity-80 transition-opacity">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span className="text-[9px] font-mono">{formatDate(p.createdAt)}</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={(e) => handleStartRename(e, p.id, p.title, 'project')} className="p-1 hover:text-white rounded-none"><Edit3 className="w-3 h-3" /></button>
                               <button onClick={(e) => { e.stopPropagation(); onDeleteProject(p.id); }} className="p-1 hover:text-talia-red rounded-none"><Trash2 className="w-3 h-3" /></button>
                          </div>
                      </div>

                      {activeProjectId === p.id && (
                          <div className="flex flex-col animate-fade-in bg-black/10 pb-3 mt-1 shadow-inner">
                               <button 
                                  onClick={(e) => { e.stopPropagation(); onCreateSession(); }}
                                  className="flex items-center gap-2 py-2.5 px-6 text-[9px] font-bold text-talia-red/80 hover:text-talia-red hover:bg-talia-red/5 transition-all uppercase tracking-[0.2em] border-b border-white/5"
                               >
                                  <Plus className="w-3 h-3" />
                                  <span>NOVA CONVERSA</span>
                               </button>

                               {sessions.map(s => (
                                   <div key={s.id} className="flex flex-col">
                                       <div 
                                          onClick={(e) => { e.stopPropagation(); onSelectSession(s.id); }}
                                          className={`group/session flex items-center justify-between py-2.5 px-6 cursor-pointer transition-all border-l-[2px] ${activeSessionId === s.id ? 'border-talia-red bg-gradient-to-r from-talia-red/10 to-transparent text-white' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}`}
                                       >
                                          <div className="flex flex-col truncate flex-1 min-w-0">
                                              <div className="flex items-center gap-2.5 mb-0.5">
                                                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${activeSessionId === s.id ? 'text-talia-red' : 'text-gray-700'}`} />
                                                  {editingId === s.id && editingType === 'session' ? (
                                                      <input autoFocus className="bg-black/80 text-[10px] border border-talia-red/50 px-1.5 py-0.5 outline-none w-full text-white font-sans rounded-none" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => handleFinishRename(s.id)} onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(s.id)} onClick={(e) => e.stopPropagation()} />
                                                  ) : (
                                                      <span className={`text-[11px] truncate ${activeSessionId === s.id ? 'font-semibold' : 'font-medium'}`}>{s.title}</span>
                                                  )}
                                              </div>
                                              
                                              <div className="flex flex-col gap-0.5 ml-6">
                                                {s.lastMessagePreview && (
                                                  <p className="text-[10px] text-gray-600 truncate opacity-70 group-hover/session:opacity-100 transition-opacity italic">
                                                    {s.lastMessagePreview}
                                                  </p>
                                                )}
                                              </div>
                                          </div>
                                          <div className="flex items-center gap-1 opacity-0 group-hover/session:opacity-100 transition-opacity ml-2">
                                            <button onClick={(e) => handleStartRename(e, s.id, s.title, 'session')} className="p-1 text-gray-600 hover:text-white rounded-none"><Edit3 className="w-3 h-3" /></button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDeleteSession(s.id); }} 
                                                className="p-1 text-gray-600 hover:text-talia-red transition-all rounded-none"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                       </div>
                                       
                                       {/* Asset list under active session */}
                                       {activeSessionId === s.id && activeSessionAssets.length > 0 && (
                                           <div className="flex flex-col pl-6 pr-2 py-2 gap-0.5 border-l border-white/5 bg-white/[0.01] animate-fade-in mb-1 ml-6 shadow-inner">
                                               {activeSessionAssets.map(asset => (
                                                   <div 
                                                     key={asset.id} 
                                                     onClick={() => onFocusAsset(asset.id)}
                                                     className="flex items-center gap-2.5 py-1.5 px-2 text-[10px] text-gray-500 hover:text-white transition-colors group/asset cursor-pointer hover:bg-white/[0.03] rounded-r-md"
                                                   >
                                                       {getAssetIcon(asset.type)}
                                                       <span className="truncate flex-1 font-mono tracking-tighter">{asset.fileName}</span>
                                                   </div>
                                               ))}
                                           </div>
                                       )}
                                   </div>
                               ))}
                          </div>
                      )}
                  </div>
               ))}
            </div>
          </section>
        )}
      </div>

      <div className="h-8 px-3 border-t border-white/5 flex items-center justify-between bg-black/40 shrink-0">
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-talia-red shadow-[0_0_8px_rgba(255,59,59,0.3)] animate-pulse"></div>
            {!isCollapsed && <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em]">ONLINE</span>}
         </div>
      </div>
    </div>
  );
};

export default MemorySidebar;
