
import React, { useState } from 'react';
import { X, Sparkles, Loader, Check, LayoutGrid, Monitor, Smartphone, Square, Image as ImageIcon, ChevronRight } from './icons/Icons';
import { ImageGenerationConfig } from '../types';

interface ImageStudioOverlayProps {
  initialPrompt: string;
  onClose: () => void;
  onGenerate: (config: ImageGenerationConfig) => Promise<void>;
}

const ImageStudioOverlay: React.FC<ImageStudioOverlayProps> = ({ initialPrompt, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<ImageGenerationConfig['aspectRatio']>('1:1');
  const [imageSize, setImageSize] = useState<ImageGenerationConfig['imageSize']>('1K');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({ prompt, aspectRatio, imageSize });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const ratios: { id: ImageGenerationConfig['aspectRatio']; label: string; icon: React.ReactNode }[] = [
    { id: '1:1', label: '1:1', icon: <Square className="w-3 h-3" /> },
    { id: '16:9', label: '16:9', icon: <Monitor className="w-3 h-3" /> },
    { id: '9:16', label: '9:16', icon: <Smartphone className="w-3 h-3" /> },
    { id: '4:3', label: '4:3', icon: <LayoutGrid className="w-3 h-3" /> },
    { id: '3:4', label: '3:4', icon: <LayoutGrid className="w-3 h-3 rotate-90" /> },
  ];

  const sizes: ImageGenerationConfig['imageSize'][] = ['1K', '2K', '4K'];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in bg-black/50 backdrop-blur-[60px] overflow-hidden">
      {/* Background Mask - Cloudy Isolation */}
      <div className="absolute inset-0 bg-white/[0.01]" onClick={onClose}></div>
      
      <div className="w-full max-w-lg bg-[#0a0a0b] border border-white/10 shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col overflow-hidden rounded-none relative z-10 scale-100">
        
        {/* Header Compacto */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-white/5">
            <div className="flex items-center gap-2">
                <div className="p-1 bg-talia-red/20 rounded-none border border-talia-red/30">
                    <Sparkles className="w-3.5 h-3.5 text-talia-red" />
                </div>
                <h2 className="text-[10px] font-bold text-white uppercase tracking-[0.25em] font-mono">IMAGE_STUDIO_V3</h2>
            </div>
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
        </div>

        <div className="p-5 space-y-5">
            {/* Prompt Editor */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest font-mono">Visual Command</label>
                    <span className="text-[8px] text-talia-red font-mono font-bold opacity-60">LATENT_SYMBOLS</span>
                </div>
                <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 bg-black border border-white/5 p-4 text-[13px] text-gray-300 font-mono leading-relaxed focus:outline-none focus:border-talia-red/30 transition-all resize-none shadow-inner"
                    placeholder="Descreva a composição latente..."
                    autoFocus
                />
            </div>

            {/* Configs Inline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Ratio Selection */}
                <div className="space-y-2.5">
                    <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest font-mono px-1">Ratio Protocol</label>
                    <div className="flex flex-wrap gap-1">
                        {ratios.map(r => (
                            <button 
                                key={r.id}
                                onClick={() => setAspectRatio(r.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 border text-[9px] font-bold transition-all font-mono ${aspectRatio === r.id ? 'bg-talia-red text-white border-talia-red' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:bg-white/[0.05]'}`}
                            >
                                <span className="opacity-40">{r.icon}</span> <span>{r.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Size Selection */}
                <div className="space-y-2.5">
                    <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest font-mono px-1">Fidelity Target</label>
                    <div className="flex gap-1">
                        {sizes.map(s => (
                            <button 
                                key={s}
                                onClick={() => setImageSize(s)}
                                className={`flex-1 py-1.5 border text-[9px] font-bold transition-all font-mono ${imageSize === s ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-white/[0.02] border-white/5 text-gray-600 hover:bg-white/[0.05]'}`}
                            >
                                {s}{s === '4K' ? '⁺' : ''}
                            </button>
                        ))}
                    </div>
                    <p className="text-[7px] text-gray-700 italic px-1 font-mono uppercase tracking-tighter opacity-60">Pro_Node orchestrator active for high resolution targets.</p>
                </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex gap-3 items-center">
                <button 
                    onClick={onClose}
                    className="px-6 py-2.5 text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] hover:text-white transition-colors border border-transparent hover:border-white/5"
                >
                    Interromper
                </button>
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-grow py-2.5 bg-talia-red text-white font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-red-600 transition-all disabled:opacity-20 flex items-center justify-center gap-3 shadow-lg group"
                >
                    {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />}
                    <span>{isGenerating ? 'ORQUESTRANDO PIXELS...' : 'EXECUTAR INFERÊNCIA'}</span>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </button>
            </div>
        </div>

        <div className="px-5 py-2 bg-black/60 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-talia-red shadow-[0_0_5px_red]"></div>
                <p className="text-[7px] text-gray-600 uppercase tracking-[0.3em] font-mono">Talia Core Ready for Latent Projection</p>
            </div>
            <p className="text-[7px] text-gray-800 font-mono opacity-20">SYNC_ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
};

export default ImageStudioOverlay;
