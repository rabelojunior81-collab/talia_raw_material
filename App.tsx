
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MemorySidebar from './components/MemorySidebar';
import StageCanvas from './components/StageCanvas';
import TaliaCoreSidebar from './components/TaliaCorePanel';
import OnboardingModal from './components/OnboardingModal';
import ImageStudioOverlay from './components/ImageStudioOverlay';
import BackgroundSelector, { getBackgroundUrl, CustomBg } from './components/BackgroundSelector';
import useSessions from './hooks/useSessions';
import useProjects from './hooks/useProjects';
import useArchives from './hooks/useArchives';
import useLocalStorage from './hooks/useLocalStorage';
import { useMediaAssets } from './hooks/useMediaAssets'; 
import { AutonomyMode, ImageGenerationConfig } from './types';
import { generateImageWithConfig } from './services/geminiService';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [autonomyMode, setAutonomyMode] = useLocalStorage<AutonomyMode>('talia-autonomy-mode', 'Co-Autor');
  const [userName, setUserName] = useLocalStorage<string>('talia-user-name', '');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>('talia-sidebar-collapsed', false);
  const [focusAssetId, setFocusAssetId] = useState<string | null>(null);
  const [studioPrompt, setStudioPrompt] = useState<string | null>(null);
  
  // Background State - Lifted for Reactivity
  const [isBgSelectorOpen, setIsBgSelectorOpen] = useState(false);
  // Default changed to 'glass' as requested
  const [currentBgId, setCurrentBgId] = useLocalStorage<string>('talia_bg_current', 'glass');
  const [customBgs, setCustomBgs] = useLocalStorage<CustomBg[]>('talia_bg_custom', []);

  const { 
    projects, 
    activeProjectId, 
    setActiveProjectId, 
    createProject, 
    deleteProject, 
    renameProject 
  } = useProjects();

  const { 
    sessions, 
    activeSession, 
    createSession, 
    selectSession, 
    deleteSession, 
    renameSession,
    updateSession 
  } = useSessions(activeProjectId);
  
  const { assets, addAsset, deleteAsset, updateAsset, updateAssetLayout } = useMediaAssets(activeSession?.id || null);
  const { archives, addArchive, deleteArchive, renameArchive } = useArchives();

  // Ensure inspection overlayer closes when switching contexts
  useEffect(() => {
    setFocusAssetId(null);
  }, [activeSession?.id, activeProjectId]);

  useEffect(() => {
    const checkStatus = async () => {
      // Check for API key in AI Studio OR localStorage (for dev mode)
      const aiStudioKey = await window.aistudio?.hasSelectedApiKey?.() ?? false;
      const localKey = !!localStorage.getItem('talia_api_key');
      const envKey = !!import.meta.env.VITE_GEMINI_API_KEY;
      const keySelected = aiStudioKey || localKey || envKey;
      
      setHasKey(keySelected);
      
      const timer = setTimeout(() => {
        setShowIntro(false);
        if (!userName || !keySelected) setShowOnboarding(true);
      }, 1200);
      return () => clearTimeout(timer);
    };
    checkStatus();
  }, [userName]);

  const handleOnboardingComplete = async (name: string) => {
      setUserName(name);
      // Check for API key in AI Studio, localStorage, or .env
      const aiStudioKey = await window.aistudio?.hasSelectedApiKey?.() ?? false;
      const localKey = !!localStorage.getItem('talia_api_key');
      const envKey = !!import.meta.env.VITE_GEMINI_API_KEY;
      const hasApiKey = aiStudioKey || localKey || envKey;
      
      if (hasApiKey) {
        setHasKey(true);
        setShowOnboarding(false);
      }
  };

  const handleStudioGenerate = async (config: ImageGenerationConfig) => {
    if (!activeSession) return;
    const blob = await generateImageWithConfig(config);
    if (blob) {
      await addAsset(blob, 'imagem', 'gerado', {
        prompt: config.prompt
      });
    }
  };

  const backgroundUrl = getBackgroundUrl(currentBgId, customBgs);

  if (showIntro) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black animate-pulse"></div>
        <div className="text-center z-10 animate-fade-in flex flex-col items-center">
          <h1 className="text-8xl font-serif font-bold tracking-tighter text-white mb-2 [text-shadow:0_0_50px_rgba(255,59,59,0.3)]">
            talia<span className="text-talia-red">.</span>ai
          </h1>
          <p className="text-sm font-light tracking-[0.4em] text-gray-500 uppercase">Multimodal Studio</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
      return <OnboardingModal onComplete={handleOnboardingComplete} onKeySelected={() => setHasKey(true)} hasKeyInitial={hasKey} currentName={userName} />;
  }

  return (
    <div 
        className="flex h-screen w-full bg-[#050506] overflow-hidden selection:bg-red-500/30 selection:text-white relative"
        style={{
            backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
        }}
    >
      {/* Dark overlay for readability over image */}
      {backgroundUrl && <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-0 pointer-events-none"></div>}

      {/* GLOBAL IMAGE STUDIO OVERLAY - Highest Z-Index, above everything */}
      {studioPrompt !== null && (
        <ImageStudioOverlay 
            initialPrompt={studioPrompt} 
            onClose={() => setStudioPrompt(null)} 
            onGenerate={handleStudioGenerate} 
        />
      )}
      
      <BackgroundSelector 
        isOpen={isBgSelectorOpen}
        onClose={() => setIsBgSelectorOpen(false)}
        currentBgId={currentBgId}
        onSelectBg={setCurrentBgId}
        customBgs={customBgs}
        onUpdateCustomBgs={setCustomBgs}
      />

      <div className="relative z-10 flex h-full w-full">
        <MemorySidebar 
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={setActiveProjectId}
            onCreateProject={() => createProject()}
            onDeleteProject={deleteProject}
            onSelectSession={selectSession}
            onRenameProject={renameProject}
            
            sessions={sessions}
            activeSessionId={activeSession?.id || null}
            onDeleteSession={deleteSession}
            onCreateSession={() => createSession('Âncora')}
            onRenameSession={renameSession}
            
            archives={archives}
            onDeleteArchive={deleteArchive}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onFocusAsset={setFocusAssetId}
        />

        <div className="flex flex-col flex-1 min-w-0">
            <Header 
                autonomyMode={autonomyMode}
                onSetAutonomyMode={setAutonomyMode}
                userName={userName}
                onOpenSettings={() => setIsBgSelectorOpen(true)}
                onOpenApiSettings={() => setShowOnboarding(true)}
            />

            <main className="flex-grow flex overflow-hidden">
                <div className="flex-grow min-w-0 h-full border-r border-white/5 relative overflow-hidden bg-black/20 backdrop-blur-sm">
                    <StageCanvas 
                        assets={assets}
                        activeSession={activeSession}
                        onUpdateLayout={updateAssetLayout}
                        onDeleteAsset={deleteAsset}
                        onUpdateAsset={updateAsset}
                        focusAssetId={focusAssetId}
                        onSetFocusAssetId={setFocusAssetId}
                        onImport={async (files) => {
                            if (!activeSession) return;
                            for (const f of files) {
                                let type: 'text' | 'image' | 'video' | 'audio' = 'text';
                                if (f.type.startsWith('image/')) type = 'image';
                                else if (f.type.startsWith('video/')) type = 'video';
                                else if (f.type.startsWith('audio/')) type = 'audio';
                                await addAsset(f, type, 'user_upload');
                            }
                        }}
                    />
                </div>

                <div className="w-[440px] xl:w-[40%] flex-shrink-0 bg-black/20 backdrop-blur-md">
                    {activeSession ? (
                        <TaliaCoreSidebar 
                            session={activeSession}
                            userName={userName}
                            autonomyMode={autonomyMode}
                            onUpdateSession={updateSession}
                            onRenameSession={renameSession}
                            onOpenImageStudio={(p) => setStudioPrompt(p)}
                        />
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-900/20 rounded-full blur-[100px] pointer-events-none"></div>

                            <div className="relative z-10 flex flex-col items-center group">
                                <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-black/40 backdrop-blur-md shadow-[0_0_30px_rgba(255,59,59,0.1)] group-hover:border-talia-red/40 group-hover:shadow-[0_0_50px_rgba(255,59,59,0.2)] transition-all duration-700">
                                    <div className="w-3 h-3 bg-talia-red rounded-full animate-pulse shadow-[0_0_20px_rgba(255,59,59,1)]"></div>
                                </div>
                                <h3 className="text-lg font-serif text-white tracking-wide mb-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                                    Aguardando Seleção
                                </h3>
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                                    Selecione uma conversa para iniciar
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
      </div>
    </div>
  );
}
