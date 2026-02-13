
import React, { useState, useEffect } from 'react';
import { Send, Link as LinkIcon, Database, Code, Key } from './icons/Icons';

interface OnboardingModalProps {
  onComplete: (name: string) => void;
  onKeySelected: () => void;
  hasKeyInitial: boolean;
  currentName: string;
}

// Check if running inside AI Studio environment
const isAIStudio = () => {
  return typeof window !== 'undefined' && !!(window as Window & { aistudio?: { openSelectKey?: () => Promise<void> } }).aistudio?.openSelectKey;
};

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete, onKeySelected, hasKeyInitial, currentName }) => {
  const [name, setName] = useState(currentName);
  const [step, setStep] = useState(currentName ? 1 : 0);
  const [apiKey, setApiKey] = useState('');
  const [inAIStudio, setInAIStudio] = useState(true);
  const [showDevInput, setShowDevInput] = useState(false);

  // Detect environment on mount
  useEffect(() => {
    setInAIStudio(isAIStudio());
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(1);
    }
  };

  const handleOpenKeyDialog = async () => {
    await (window as Window & { aistudio?: { openSelectKey?: () => Promise<void> } }).aistudio?.openSelectKey?.();
    onKeySelected();
    onComplete(name);
  };

  const handleManualKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      // Save API key to localStorage for localhost development
      localStorage.setItem('talia_api_key', apiKey.trim());
      onKeySelected();
      onComplete(name);
    }
  };

  const handleDevMode = () => {
    // Use a fake API key for development testing
    const fakeKey = 'dev-mode-fake-api-key-for-testing-only';
    localStorage.setItem('talia_api_key', fakeKey);
    localStorage.setItem('talia_dev_mode', 'true');
    onKeySelected();
    onComplete(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,59,59,0.03),transparent_70%)]"></div>
      
      <div className="w-full max-w-lg p-12 text-center bg-[#050507] border border-white/5 shadow-2xl relative z-10">
        <div className="mb-12">
           <h1 className="text-6xl font-serif font-bold tracking-tight text-white mb-1">
            talia<span className="text-talia-red">.</span>ai
          </h1>
          <p className="text-[9px] font-bold tracking-[0.4em] text-gray-600 uppercase">
            PROTOCOLO DE ATIVAÇÃO
          </p>
        </div>

        {step === 0 ? (
          <form onSubmit={handleNameSubmit} className="animate-fade-in space-y-12">
            <div className="relative group">
               <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome, Architect?"
                  className="w-full bg-transparent border-b border-white/5 text-center text-3xl font-serif text-white placeholder-gray-900 focus:border-talia-red/50 focus:outline-none py-6 transition-all"
                  autoFocus
              />
            </div>
            <button
                type="submit"
                disabled={!name.trim()}
                className="w-full bg-white/[0.02] border border-white/5 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:bg-talia-red hover:border-talia-red transition-all disabled:opacity-20"
            >
                PRÓXIMO PASSO
            </button>
          </form>
        ) : (
          <div className="animate-fade-in space-y-8">
            <div className="p-8 bg-black border border-white/5 text-left space-y-6">
                <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-talia-red" /> 
                    <h3 className="text-white font-bold text-[10px] uppercase tracking-widest">SINCRONIZAR NÚCLEO (API KEY)</h3>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed font-sans">
                    Para operar modelos de alta fidelidade (Pro/Live), você deve selecionar uma chave de um projeto com faturamento ativo no Google Cloud.
                </p>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[9px] text-talia-red font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5 pt-2">
                    <LinkIcon className="w-3 h-3" /> VER DOCUMENTAÇÃO DE FATURAMENTO
                </a>
            </div>
            
            {inAIStudio ? (
              // AI Studio Mode - Original behavior
              <button
                  onClick={handleOpenKeyDialog}
                  className="w-full bg-talia-red py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-[0_10px_30px_rgba(255,59,59,0.2)] hover:scale-[1.01] transition-all"
              >
                  CONECTAR CHAVE DE API
              </button>
            ) : (
              // Localhost Mode - Alternative UI
              <div className="space-y-4">
                {!showDevInput ? (
                  <>
                    <button
                        onClick={() => setShowDevInput(true)}
                        className="w-full bg-talia-red py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-[0_10px_30px_rgba(255,59,59,0.2)] hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
                    >
                        <Key className="w-4 h-4" />
                        INSERIR CHAVE MANUALMENTE
                    </button>
                    
                    <button
                        onClick={handleDevMode}
                        className="w-full bg-white/[0.02] border border-white/5 py-5 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Code className="w-4 h-4" />
                        USAR MODO DESENVOLVEDOR
                    </button>
                    
                    <p className="text-[9px] text-gray-600 text-center">
                      Ambiente de desenvolvimento detectado. Use o modo desenvolvedor para testes rápidos.
                    </p>
                  </>
                ) : (
                  <form onSubmit={handleManualKeySubmit} className="space-y-4 animate-fade-in">
                    <div className="relative">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua API Key do Gemini aqui"
                        className="w-full bg-black border border-white/10 text-center text-sm font-mono text-white placeholder-gray-700 focus:border-talia-red/50 focus:outline-none py-4 px-4 transition-all"
                        autoFocus
                      />
                    </div>
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="w-full bg-talia-red py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-[0_10px_30px_rgba(255,59,59,0.2)] hover:scale-[1.01] transition-all disabled:opacity-20"
                    >
                        CONECTAR
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                          setShowDevInput(false);
                          setApiKey('');
                        }}
                        className="w-full text-[9px] text-gray-700 uppercase tracking-widest font-bold hover:text-gray-400 transition-colors py-2"
                    >
                        VOLTAR
                    </button>
                  </form>
                )}
              </div>
            )}
            
            <button 
                onClick={() => setStep(0)}
                className="text-[9px] text-gray-700 uppercase tracking-widest font-bold hover:text-gray-400 transition-colors"
            >
                VOLTAR PARA IDENTIDADE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
