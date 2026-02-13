import React, { useState, useEffect } from 'react';
import { Session } from '../types';
import { YOUTUBE_PROXY_URL, getYouTubeTranscript, generateTranslation } from '../services/geminiService';
import { Link, Loader, AlertTriangle, Download } from './icons/Icons';

const isBackendConfigured = YOUTUBE_PROXY_URL && YOUTUBE_PROXY_URL.startsWith('https://');

const Prancheta: React.FC<{ session: Session }> = ({ session }) => {
  if (!session.translationData) return null;

  const handleExport = () => {
    const content = `URL: ${session.translationData.url}\n\n--- TRANSCRIÇÃO ORIGINAL (EN) ---\n\n${session.translationData.transcription}\n\n--- TRADUÇÃO (PT-BR) ---\n\n${session.translationData.translation}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traducao-${session.translationData.videoId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">Resultado da Tradução</h2>
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 transition-colors">
                <Download className="w-4 h-4" />
                <span className="[text-shadow:0_1px_2px_rgba(0,0,0,0.4)]">Exportar</span>
            </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/20 p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-gray-300 border-b border-white/10 pb-2 mb-3 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Transcrição Original (EN)</h3>
                <p className="text-gray-200 whitespace-pre-wrap leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">{session.translationData.transcription}</p>
            </div>
            <div className="bg-black/20 p-4 border border-white/10">
                <h3 className="text-lg font-semibold text-red-400 border-b border-white/10 pb-2 mb-3 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">Tradução (PT-BR)</h3>
                <p className="text-white whitespace-pre-wrap leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.7)]">{session.translationData.translation}</p>
            </div>
        </div>
    </div>
  );
};

function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const SetupInstructions: React.FC = () => (
    <div className="p-6 bg-black/20 backdrop-blur-lg border border-white/20">
      <h2 className="text-2xl font-semibold text-white mb-4">Modo Tradutora - Configuração Necessária</h2>
      <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 p-4 flex items-start animate-fade-in">
        <AlertTriangle className="w-6 h-6 mr-4 flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-lg mb-2 text-white">Ação Requerida: Configurar o Backend de Transcrição</h3>
          <p className="mb-2">
            Para ativar a funcionalidade de tradução de vídeos do YouTube, é necessário implantar um serviço de backend (Cloud Function) que atua como um proxy seguro. Isso é necessário devido às políticas de segurança dos navegadores (CORS).
          </p>
          <p className="font-medium text-white mt-3">Passos para resolver:</p>
          <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>Navegue até o diretório <code className="bg-gray-700 px-1 py-0.5 rounded-sm text-white">youtube-proxy-backend</code>.</li>
              <li>Siga as instruções detalhadas no arquivo <code className="bg-gray-700 px-1 py-0.5 rounded-sm text-white">instructions.txt</code> para implantar a função na sua conta do Google Cloud.</li>
              <li>Após a implantação, você obterá uma URL.</li>
              <li>
                  Abra o arquivo <code className="bg-gray-700 px-1 py-0.5 rounded-sm text-white">services/geminiService.ts</code> e cole a URL na variável <code className="bg-gray-700 px-1 py-0.5 rounded-sm text-white">YOUTUBE_PROXY_URL</code>.
              </li>
          </ol>
        </div>
      </div>
    </div>
  );

interface TranslatorViewProps {
    session: Session;
    onUpdateSession: (session: Session) => void;
}

const TranslatorView: React.FC<TranslatorViewProps> = ({ session, onUpdateSession }) => {
  const [url, setUrl] = useState(session.translationData?.url || '');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUrl(session.translationData?.url || '');
  }, [session]);

  if (!isBackendConfigured) {
    return <SetupInstructions />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) {
      setError("Por favor, insira uma URL do YouTube.");
      return;
    }

    const extractedVideoId = extractVideoId(url);
    if (!extractedVideoId) {
      setError("URL do YouTube inválida ou não reconhecida.");
      onUpdateSession({ ...session, translationData: undefined });
      return;
    }

    setLoading(true);
    setError(null);
    onUpdateSession({ ...session, translationData: undefined });

    try {
      setLoadingMessage('Buscando transcrição do YouTube...');
      const transcript = await getYouTubeTranscript(extractedVideoId);
      
      if (!transcript || transcript.trim().length === 0) {
        throw new Error("Não foi encontrada uma transcrição para este vídeo.");
      }

      setLoadingMessage('Gerando tradução com IA...');
      const translationResponse = await generateTranslation(transcript);

      const newTranslationData = {
        videoId: extractedVideoId,
        url: url,
        transcription: transcript,
        translation: translationResponse.translation
      };
      
      onUpdateSession({
        ...session,
        title: `Tradução: ${url}`,
        translationData: newTranslationData
      });

    } catch (err: any) {
        setError(err.message || "Ocorreu um erro desconhecido.");
    } finally {
        setLoading(false);
        setLoadingMessage('');
    }
  };

  return (
    <div className="p-6 bg-black/20 backdrop-blur-lg border border-white/20 h-full">
      <h2 className="text-2xl font-semibold text-white mb-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.7)]">Modo Tradutora</h2>
      <p className="text-gray-400 mb-6 [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">Forneça uma URL de um vídeo do YouTube para obter sua transcrição e tradução.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-gray-900/50 border border-white/10 focus:border-red-500 focus:ring-red-500 transition-colors pl-10 pr-4 py-3 text-white placeholder-gray-500"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 transition-colors flex items-center justify-center min-w-[120px] [text-shadow:0_1px_2px_rgba(0,0,0,0.4)]"
          disabled={loading}
        >
          {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Processar'}
        </button>
      </form>
      
      <div className="h-6 mt-2 text-sm text-gray-400 flex items-center">
        {loading && <span className="animate-pulse">{loadingMessage}</span>}
      </div>

      <div className="mt-4">
        {error && (
          <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 p-4 flex items-center animate-fade-in">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {session.translationData?.videoId && (
            <div className="my-6 aspect-video w-full animate-fade-in">
              <iframe
                className="w-full h-full border border-white/10"
                src={`https://www.youtube.com/embed/${session.translationData.videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
        )}
        
        {session.translationData && <Prancheta session={session} />}
      </div>
    </div>
  );
};

export default TranslatorView;