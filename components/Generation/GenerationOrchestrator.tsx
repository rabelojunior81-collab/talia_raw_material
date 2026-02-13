
import React, { useState, useEffect, useMemo } from 'react';
import { Session } from '../../types';
import { generateDocumentFromConversation } from '../../services/geminiService';
import { X, Loader, AlertTriangle, Copy, FileCode2, Download, Bookmark } from '../icons/Icons';
import { db } from '../../services/db';
import { useMediaAssets } from '../../hooks/useMediaAssets';

const md = (window as any).markdownit();
const DOMPurify = (window as any).DOMPurify;

interface GenerationOrchestratorProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: Session[];
  formatConfig: any;
  onAddArchive: (title: string, content: string) => void;
}

const SessionSelector: React.FC<{ sessions: Session[], onSelect: (session: Session) => void }> = ({ sessions, onSelect }) => (
    <div>
        <h3 className="text-xl font-semibold text-white mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">Selecione uma Conversa</h3>
        <p className="text-gray-400 mb-6 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Escolha uma conversa do seu histórico para usar como contexto para a geração do documento.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
            {sessions.filter(s => s.mode === 'Âncora').map(session => (
                <button 
                    key={session.id}
                    onClick={() => onSelect(session)}
                    className="block text-left p-4 bg-black/30 border border-white/10 hover:border-red-500 hover:bg-red-900/40 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <div className="flex items-start gap-3">
                        <FileCode2 className="w-6 h-6 text-red-400 mt-1 flex-shrink-0"/>
                        <div className="flex-grow min-w-0">
                            <h4 className="font-semibold text-white truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{session.title}</h4>
                            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
                                {session.lastMessagePreview || 'Conversa...'}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">{new Date(session.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

const LoadingView: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Loader className="w-12 h-12 animate-spin text-red-500" />
        <p className="mt-6 text-gray-300 text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Gerando seu documento...</p>
        <p className="text-gray-400 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Talia está analisando a conversa sobre "{title}" e aplicando a formatação solicitada.</p>
    </div>
);

const ResultView: React.FC<{ 
    content: string; 
    onClose: () => void; 
    title: string; 
    onArchive: (title: string, content: string) => void;
    sessionId: string;
}> = ({ content, onClose, title, onArchive, sessionId }) => {
    const [copySuccess, setCopySuccess] = useState('');
    const [archiveSuccess, setArchiveSuccess] = useState('');
    const [assetSuccess, setAssetSuccess] = useState('');

    const { addAsset } = useMediaAssets(sessionId);
    
    const renderedHtml = useMemo(() => {
        const raw = md.render(content);
        return DOMPurify.sanitize(raw);
    }, [content]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopySuccess('Copiado!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Falha ao copiar');
        }
    };

    const handleSaveDoc = () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + renderedHtml + footer;

        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        
        const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const date = new Date().toISOString().split('T')[0];

        fileDownload.download = `${safeTitle}_${date}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    const handleArchive = () => {
        onArchive(title, content);
        setArchiveSuccess('Arquivado!');
        setTimeout(() => setArchiveSuccess(''), 2000);
    };

    // Save to Studio as PDF/Text Blob
    const handleSaveToStudio = async () => {
        try {
            const blob = new Blob([content], { type: 'text/markdown' });
            // Fake file name
            const fileName = `${title.replace(/\s+/g, '_')}.md`;
            const file = new File([blob], fileName, { type: 'text/markdown' });
            
            await addAsset(file, 'text', 'generated');
            setAssetSuccess('Salvo no Studio!');
        } catch (e) {
            console.error(e);
            setAssetSuccess('Erro ao salvar');
        }
        setTimeout(() => setAssetSuccess(''), 2000);
    };
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0 bg-black/40">
              <h2 className="text-xl font-semibold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">Documento Gerado</h2>
              <div className="flex items-center gap-4">
                <button onClick={handleSaveToStudio} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
                    <FileCode2 className="w-4 h-4" />
                    <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{assetSuccess || 'Salvar no Studio'}</span>
                </button>
                <button onClick={handleArchive} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
                    <Bookmark className="w-4 h-4" />
                    <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{archiveSuccess || 'Arquivar'}</span>
                </button>
                <button onClick={handleSaveDoc} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 transition-colors text-sm shadow-lg">
                    <Download className="w-4 h-4" />
                    <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">Salvar DOC</span>
                </button>
                <button onClick={handleCopy} className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm">
                    <Copy className="w-4 h-4" />
                    <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{copySuccess || 'Copiar Markdown'}</span>
                </button>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10"><X className="w-6 h-6" /></button>
              </div>
            </header>
            <main className="flex-grow p-8 overflow-y-auto markdown-content bg-black/20" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        </div>
    );
};


const GenerationOrchestrator: React.FC<GenerationOrchestratorProps> = ({ isOpen, onClose, sessions, formatConfig, onAddArchive }) => {
    const [step, setStep] = useState<'select_session' | 'loading' | 'result' | 'error'>('select_session');
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [generatedDocument, setGeneratedDocument] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setStep('select_session');
            setSelectedSession(null);
            setGeneratedDocument('');
            setError(null);
        }
    }, [isOpen]);

    const handleSelectSession = async (session: Session) => {
        setSelectedSession(session);
        setStep('loading');
        try {
            const messages = await db.messages.where({ sessionId: session.id }).sortBy('timestamp');
            const documentText = await generateDocumentFromConversation(messages, session.title, formatConfig);
            setGeneratedDocument(documentText);
            setStep('result');
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro desconhecido durante a geração do documento.");
            setStep('error');
        }
    };

    if (!isOpen) return null;

    const renderContent = () => {
        switch (step) {
            case 'select_session':
                return <SessionSelector sessions={sessions} onSelect={handleSelectSession} />;
            case 'loading':
                return <LoadingView title={selectedSession?.title || 'conversa'} />;
            case 'error':
                return (
                    <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 p-4 flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-white mb-1">Erro na Geração</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                );
            case 'result':
                return null; 
            default:
                return null;
        }
    };
    
    if (step === 'result' && selectedSession) {
        return (
             <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in p-4 sm:p-8 md:p-12">
                <div className="bg-[#1a1a1a] border border-white/20 w-full h-full flex flex-col max-w-4xl shadow-2xl rounded-lg overflow-hidden">
                   <ResultView 
                     content={generatedDocument} 
                     onClose={onClose} 
                     title={selectedSession.title}
                     onArchive={onAddArchive}
                     sessionId={selectedSession.id}
                   />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-[#1a1a1a] border border-white/20 w-full max-w-2xl min-h-[60vh] flex flex-col shadow-2xl rounded-lg">
                <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0 bg-black/40">
                    <h2 className="text-xl font-semibold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">Gerar Documento</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                </header>
                <main className="flex-grow p-6 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default GenerationOrchestrator;
