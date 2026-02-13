
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Session } from '../types';
import { getChatResponse, generateTitleForSession } from '../services/geminiService';
import { Send, Loader, FileText, Paperclip, X, Phone, PhoneOff, Camera, Globe } from './icons/Icons';
import ExportModal from './History/ExportModal';
import { db } from '../services/db';
import { useDataStore } from '../hooks/useDataStore';
import { useMediaAssets } from '../hooks/useMediaAssets'; 
import MessageBubble from './Chat/MessageBubble';
import { useGeminiLive } from '../hooks/useGeminiLive';
import CameraModal from './CameraModal';

interface AnchorViewProps {
    session: Session;
    onUpdateSession: (session: Session) => void;
    onRenameSession: (sessionId: string, newTitle: string) => void;
    userName?: string;
}

const AnchorView: React.FC<AnchorViewProps> = ({ session, onUpdateSession, onRenameSession, userName }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { connect, disconnect, isConnected, volume, error: liveError } = useGeminiLive();
  const { addMessage } = useDataStore();
  
  const { addAsset, addExternalAsset } = useMediaAssets(session.id);

  const messages = useLiveQuery(
      () => db.messages.where({ sessionId: session.id }).sortBy('timestamp'),
      [session.id]
  ) || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, attachedFiles]);

  useEffect(() => {
    const initSession = async () => {
        const count = await db.messages.where({ sessionId: session.id }).count();
        if (count === 0 && !loading) {
            setLoading(true);
            setTimeout(async () => {
                const initPrompt = userName 
                  ? `Olá, me apresente. O nome do usuário é ${userName}.` 
                  : "Olá, me apresente.";
                const { text, sources } = await getChatResponse([], initPrompt, undefined, userName, session.id);
                await addMessage(session.id, 'model', text, undefined, sources);
                setLoading(false);
            }, 500);
        }
    }
    initSession();
  }, [session.id, userName]);

   const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (items) {
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        event.preventDefault();
        setAttachedFiles(prev => [...prev, ...files]);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || loading) return;

    let userText = input;
    const filesToSend = [...attachedFiles]; 
    
    if (filesToSend.length > 0) {
        userText += `\n\n[Anexado: ${filesToSend.map(f => f.name).join(', ')}]`;
        for (const file of filesToSend) {
            let type: 'image' | 'video' | 'audio' | 'pdf' | 'text' = 'text';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';
            else if (file.type.startsWith('audio/')) type = 'audio';
            else if (file.type === 'application/pdf') type = 'pdf';
            
            await addAsset(file, type, 'user_upload');
        }
    }
    
    setLoading(true);
    await addMessage(session.id, 'user', userText, filesToSend);
    setInput('');
    setAttachedFiles([]);

    // Pass isSearchMode
    const { text, sources, generatedAssets } = await getChatResponse(messages, userText, filesToSend, userName, session.id, undefined, isSearchMode);
    await addMessage(session.id, 'model', text, undefined, sources);
    
    if (sources) {
        sources.forEach(source => {
            if (source.uri.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
                addExternalAsset(source.uri, 'image', source.title, 'search');
            }
        });
    }

    if (generatedAssets) {
        for (const asset of generatedAssets) {
             await addAsset(asset.blob, asset.type, 'generated', { prompt: asset.prompt, fileName: asset.fileName });
        }
    }

    setLoading(false);

    if (messages.length === 1 && session.title === "Nova Conversa") {
        const updatedMessages = await db.messages.where({ sessionId: session.id }).sortBy('timestamp');
        const newTitle = await generateTitleForSession(updatedMessages);
        onRenameSession(session.id, newTitle);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleCameraCapture = (file: File) => {
      setAttachedFiles(prev => [...prev, file]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleLive = () => {
    if (isConnected) disconnect();
    else connect(session.id); // Pass sessionId for context injection
  };

  return (
    <>
      <div className="flex flex-col h-full w-full relative bg-transparent">
        {liveError && (
             <div className="absolute top-16 right-4 bg-red-900/90 text-white text-xs p-3 rounded-none border border-red-500 z-50 shadow-xl animate-fade-in max-w-xs">
                <strong>Erro de Voz:</strong> {liveError}
            </div>
        )}
        
        {/* Header - Glass & Square */}
        <div className="flex flex-col gap-3 p-4 border-b border-white/10 bg-black/20 flex-shrink-0 backdrop-blur-xl z-20 shadow-lg">
            <h2 className="text-sm font-semibold truncate font-serif text-gray-100" title={session.title}>
                {session.title}
            </h2>
            <div className="flex items-center justify-between gap-2 flex-wrap">
                 <div className="flex items-center gap-2">
                    {isConnected && (
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-none border border-red-500/30">
                            <div className="flex items-end gap-0.5 h-2">
                                <div className="w-0.5 bg-red-500 transition-all duration-75" style={{ height: `${Math.max(20, volume * 100)}%` }}></div>
                                <div className="w-0.5 bg-red-500 transition-all duration-75 delay-75" style={{ height: `${Math.max(20, volume * 70)}%` }}></div>
                                <div className="w-0.5 bg-red-500 transition-all duration-75 delay-100" style={{ height: `${Math.max(20, volume * 90)}%` }}></div>
                            </div>
                        </div>
                    )}
                    
                    <button
                        onClick={toggleLive}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all rounded-none shadow-lg ${
                            isConnected 
                            ? 'bg-red-600 text-white border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.4)]' 
                            : 'bg-white/5 text-gray-300 border-transparent hover:border-white/10 hover:text-white'
                        }`}
                        title={isConnected ? "Encerrar Chamada" : "Iniciar Chamada"}
                    >
                        {isConnected ? <PhoneOff className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                        <span className="font-medium">{isConnected ? 'Encerrar' : 'Live'}</span>
                    </button>
                 </div>

                <button 
                  onClick={() => setIsExportModalOpen(true)}
                  className="p-2 text-xs bg-transparent hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all disabled:opacity-50 rounded-none border border-transparent hover:border-white/10"
                  disabled={messages.length < 2}
                  title="Exportar Relatório"
                >
                    <FileText className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Messages - Scroll Area */}
        <div className="flex-grow overflow-y-auto px-6 py-6 space-y-8 hide-scrollbar">
          {messages.map((msg) => (
            <MessageBubble 
              key={msg.id}
              role={msg.role}
              text={msg.text}
              mediaAssets={msg.mediaAssets}
              sources={msg.sources}
            />
          ))}
          
          {loading && (
              <div className="flex items-start gap-4 opacity-70">
                  <div className="flex-shrink-0 w-8 h-8 rounded-none bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
                    <span className="font-serif font-bold text-white text-xs">t.</span>
                  </div>
                  <div className="p-4 bg-[#151515] border border-white/5 rounded-none">
                      <div className="flex gap-1 items-center">
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                  </div>
              </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        {/* Input Area - Glass & Square */}
        <form onSubmit={handleSend} className="p-5 border-t border-white/10 bg-black/40 backdrop-blur-2xl flex-shrink-0 relative z-30 shadow-[0_-5px_30px_rgba(0,0,0,0.3)]">
          {attachedFiles.length > 0 && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="relative flex-shrink-0 bg-[#222] p-2 pr-6 rounded-none border border-white/10 flex items-center">
                   <span className="text-xs text-white max-w-[100px] truncate" title={file.name}>{file.name}</span>
                   <button 
                     onClick={() => removeFile(index)} 
                     className="absolute top-1 right-1 text-gray-500 hover:text-white"
                     aria-label="Remove file"
                   >
                     <X className="w-3 h-3" />
                   </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-3 items-end">
             {/* Search Toggle */}
             <button
                type="button"
                onClick={() => setIsSearchMode(!isSearchMode)}
                className={`p-3 transition-colors rounded-none border hover:border-white/10 ${isSearchMode ? 'text-talia-red border-talia-red/30 bg-talia-red/10' : 'text-gray-400 hover:text-white border-transparent hover:bg-white/5'}`}
                disabled={loading}
                title={isSearchMode ? "Desativar Pesquisa Web" : "Ativar Pesquisa Web"}
            >
                <Globe className="w-5 h-5"/>
            </button>

             <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="p-3 text-gray-400 hover:text-white transition-colors rounded-none hover:bg-white/5 border border-transparent hover:border-white/10"
                disabled={loading}
                title="Abrir Câmera"
            >
                <Camera className="w-5 h-5"/>
            </button>
             <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-400 hover:text-white transition-colors rounded-none hover:bg-white/5 border border-transparent hover:border-white/10"
                disabled={loading}
                title="Anexar arquivo"
            >
                <Paperclip className="w-5 h-5"/>
            </button>
            <div className="flex-grow relative">
                <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                    }
                }}
                placeholder={isSearchMode ? "Pesquisar na web..." : "Mensagem..."}
                className="w-full bg-[#111] border border-white/10 focus:border-white/30 transition-all px-4 py-3 text-sm text-white placeholder-gray-600 resize-none rounded-none shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] focus:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                disabled={loading}
                rows={1}
                style={{ minHeight: '46px', maxHeight: '120px' }}
                />
            </div>
             <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button
              type="submit"
              className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-none transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] disabled:opacity-50 disabled:cursor-not-allowed border border-red-500"
              disabled={loading || (!input.trim() && attachedFiles.length === 0)}
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5"/>}
            </button>
          </div>
        </form>
      </div>
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        session={session}
      />
      <CameraModal 
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};

export default AnchorView;
