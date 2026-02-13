
import React, { useState, useRef, useEffect } from 'react';
import { Session, AutonomyMode } from '../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db';
import { getChatResponse, generateTitleForSession } from '../services/geminiService';
import { Phone, PhoneOff, Sparkles, Clock, ChevronRight, Globe } from './icons/Icons';
import { useDataStore } from '../hooks/useDataStore';
import { useGeminiLive } from '../hooks/useGeminiLive';
import { useMediaAssets } from '../hooks/useMediaAssets';
import MessageBubble from './Chat/MessageBubble';

interface TaliaCorePanelProps {
  session: Session;
  userName: string;
  autonomyMode: AutonomyMode;
  onUpdateSession: (id: string, data: Partial<Session>) => void;
  onRenameSession: (id: string, title: string) => void;
  onOpenImageStudio: (prompt: string) => void;
}

const TaliaCoreSidebar: React.FC<TaliaCorePanelProps> = ({ session, userName, autonomyMode, onRenameSession, onOpenImageStudio }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSearchMode, setIsSearchMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { addMessage } = useDataStore();
  const { addAsset } = useMediaAssets(session.id);
  const { connect, disconnect, isConnected } = useGeminiLive(onOpenImageStudio);

  const messages = useLiveQuery(
    () => db.messages.where({ sessionId: session.id }).sortBy('timestamp'),
    [session.id]
  ) || [];

  const stageAssets = useLiveQuery(
    () => db.assets.where({ sessionId: session.id }).toArray(),
    [session.id]
  ) || [];

  const chatMessages = messages.filter(m => !m.isActionLog);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Limit max height approx 5 lines (assuming ~20px line height + padding)
        const maxHeight = 120; 
        const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
        textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setLoading(true);

    await addMessage(session.id, 'user', userText);
    
    // Pass isSearchMode to the service
    const response = await getChatResponse(messages, userText, undefined, userName, session.id, stageAssets, isSearchMode);
    await addMessage(session.id, 'model', response.text, undefined, response.sources);
    
    if (response.openImageStudio) {
      onOpenImageStudio(response.openImageStudio);
    }

    if (response.generatedAssets && response.generatedAssets.length > 0) {
        for (const asset of response.generatedAssets) {
            await addAsset(asset.blob, asset.type, asset.source, {
                fileName: asset.fileName,
                prompt: asset.prompt
            });
        }
    }

    if (!session.isCustomTitle && chatMessages.length >= 1 && chatMessages.length <= 4) {
        const updatedMessages = await db.messages.where({ sessionId: session.id }).sortBy('timestamp');
        const newTitle = await generateTitleForSession(updatedMessages);
        if (newTitle !== session.title) {
            onRenameSession(session.id, newTitle);
        }
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="w-full h-full bg-[#050507]/60 backdrop-blur-xl flex flex-col z-30 shadow-2xl relative border-l border-white/5 transition-all duration-300">
      
      {/* Header Premium Sync */}
      <div className="h-9 flex items-center justify-between px-4 border-b border-white/5 bg-black/20 backdrop-blur-md shrink-0">
         <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-none flex items-center justify-center border border-white/10 bg-white/5 relative overflow-hidden">
                <div className={`absolute inset-0 bg-talia-red/10 transition-all ${isConnected ? 'opacity-100' : 'opacity-0'}`}></div>
                <span className={`font-serif font-bold text-[10px] relative z-10 ${isConnected ? 'text-talia-red' : 'text-gray-600'}`}>t.</span>
            </div>
            <div className="flex flex-col">
                <h2 className="text-[8px] font-bold text-white tracking-[0.1em] uppercase leading-none font-mono opacity-80">CORE_PROTOCOL</h2>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 opacity-40">
                <Clock className="w-2.5 h-2.5" />
                <span className="text-[7px] font-mono font-bold">{currentTime.toLocaleTimeString('pt-BR')}</span>
            </div>
            <span className="text-[8px] text-talia-red font-bold uppercase tracking-widest px-1.5 py-0.5 bg-talia-red/5 border border-talia-red/10">{autonomyMode}</span>
         </div>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden relative">
         <div className="flex-grow overflow-y-auto px-4 py-4 space-y-2 hide-scrollbar bg-transparent">
            {chatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-5">
                    <Sparkles className="w-10 h-10 mb-2 text-gray-600" />
                    <p className="typography-effect text-[8px]">CORE INITIALIZED</p>
                </div>
            )}
            {chatMessages.map(msg => (
               <MessageBubble key={msg.id} role={msg.role} text={msg.text} sources={msg.sources} />
            ))}
            {loading && (
               <div className="flex gap-2 items-center ml-3 animate-pulse">
                  <div className="flex items-end gap-0.5 h-2">
                    <div className="w-0.5 bg-talia-red h-full animate-bounce"></div>
                    <div className="w-0.5 bg-talia-red h-2/3 animate-bounce delay-75"></div>
                    <div className="w-0.5 bg-talia-red h-1/2 animate-bounce delay-150"></div>
                  </div>
                  <span className="text-[7px] uppercase font-bold tracking-[0.2em] text-talia-red/30 font-mono italic">Processando Inferência</span>
               </div>
            )}
            <div ref={chatEndRef} />
         </div>

         {/* Ultra Condensed Input Area with Auto-Expand */}
         <div className="shrink-0 bg-black/40 backdrop-blur-xl border-t border-white/5 px-2 py-2 relative z-50">
            <div className="max-w-4xl mx-auto relative flex items-end gap-2 bg-white/[0.02] border border-white/5 p-1.5 transition-all focus-within:border-white/10 focus-within:bg-white/[0.04]">
                
                {/* Text Input */}
                <textarea 
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isSearchMode ? "Pesquisar na web..." : "Comando central..."}
                    className="w-full bg-transparent text-[13px] text-gray-200 placeholder-gray-600 resize-none focus:outline-none transition-all font-sans flex-grow leading-relaxed py-1.5 px-2 min-h-[36px] overflow-y-auto hide-scrollbar"
                    rows={1}
                    onKeyDown={handleKeyDown}
                />

                {/* Inline Tools */}
                <div className="flex items-center gap-1 pb-1">
                    <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                    
                    {/* SEARCH TOGGLE */}
                    <button 
                        onClick={() => setIsSearchMode(!isSearchMode)} 
                        className={`p-1.5 transition-all rounded-sm hover:bg-white/5 ${isSearchMode ? 'text-talia-red shadow-[0_0_10px_rgba(255,59,59,0.2)]' : 'text-gray-600 hover:text-white'}`}
                        title={isSearchMode ? "Desativar Pesquisa Web" : "Ativar Pesquisa Web"}
                    >
                        <Globe className="w-4 h-4" />
                    </button>

                    <button 
                        onClick={() => onOpenImageStudio("")} 
                        className="p-1.5 text-gray-600 hover:text-white transition-all rounded-sm hover:bg-white/5" 
                        title="Visual Studio"
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => isConnected ? disconnect() : connect(session.id)} 
                        className={`p-1.5 transition-all rounded-sm hover:bg-white/5 ${isConnected ? 'text-talia-red animate-pulse' : 'text-gray-600 hover:text-white'}`}
                        title={isConnected ? "Terminate Sync" : "Voice Sync"}
                    >
                        {isConnected ? <PhoneOff className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading} 
                        className={`p-1.5 transition-all transform active:scale-90 group rounded-sm ${!input.trim() || loading ? 'opacity-30 cursor-not-allowed' : 'text-talia-red hover:text-white hover:bg-talia-red/20'}`}
                    >
                        {loading ? (
                            <div className="w-4 h-4 border border-t-transparent border-talia-red rounded-full animate-spin"></div>
                        ) : (
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                        )}
                    </button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TaliaCoreSidebar;
