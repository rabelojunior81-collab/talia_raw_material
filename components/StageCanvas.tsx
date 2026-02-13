
import React, { useState, useRef, useMemo } from 'react';
import { AtivoMultimidia, Session, LayoutAtivo } from '../types';
import { Video, Activity, Image, FileCode2, Plus, X, Move, Maximize2, FileText, Bookmark } from './icons/Icons';
import { UIAsset } from '../hooks/useMediaAssets';
import AssetCanvas from './AssetCanvas';

interface StageCanvasProps {
  assets: UIAsset[];
  activeSession: Session | null;
  onImport: (files: File[]) => void;
  onUpdateLayout: (id: string, layout: Partial<LayoutAtivo>) => void;
  onDeleteAsset: (id: string) => Promise<void>;
  onUpdateAsset: (id: string, data: Partial<AtivoMultimidia>) => Promise<void>;
  focusAssetId: string | null;
  onSetFocusAssetId: (id: string | null) => void;
}

const PoolCard: React.FC<{
    type: string;
    assets: UIAsset[];
    onAssetClick: (id: string) => void;
}> = ({ type, assets, onAssetClick }) => {
    const labels: Record<string, string> = {
        video: 'Biblioteca de Vídeo',
        audio: 'Frequências Sonoras',
        imagem: 'Ativos Visuais',
        documento: 'Base de Conhecimento',
        codigo: 'Engine Logic'
    };

    const icons: Record<string, React.ReactNode> = {
        video: <Video className="w-3.5 h-3.5" />,
        audio: <Activity className="w-3.5 h-3.5" />,
        imagem: <Image className="w-3.5 h-3.5" />,
        documento: <FileText className="w-3.5 h-3.5" />,
        codigo: <FileCode2 className="w-3.5 h-3.5" />
    };

    if (assets.length === 0) return null;

    return (
        <div className="bg-[#0a0a0c]/80 backdrop-blur-sm border border-white/5 w-72 h-auto max-h-[440px] flex flex-col m-1.5 animate-fade-in group hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden">
            <div className="h-9 bg-black/60 border-b border-white/5 flex items-center justify-between px-3 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-talia-red"></div>
                <div className="flex items-center gap-2">
                    <div className="text-talia-red/60">{icons[type] || icons.documento}</div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.15em] font-mono">{labels[type] || type}</span>
                </div>
                <div className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[7px] font-mono text-gray-700 font-bold uppercase">{assets.length} UNIT</div>
            </div>
            
            <div className="p-2 grid grid-cols-3 gap-2 overflow-y-auto hide-scrollbar bg-black/40 relative">
                {assets.map(asset => (
                    <div 
                        key={asset.id}
                        onClick={() => onAssetClick(asset.id)}
                        className="aspect-square bg-[#050505] border border-white/5 hover:border-talia-red/40 transition-all duration-300 cursor-pointer overflow-hidden relative group/thumb shadow-sm"
                    >
                        {(asset.type === 'imagem' || asset.type === 'image') ? (
                            <img 
                                src={asset.objectUrl} 
                                className="w-full h-full object-cover opacity-80 group-hover/thumb:opacity-100 transition-opacity" 
                                alt={asset.fileName} 
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.01]">
                                <div className="p-1.5 border border-white/5 mb-1 group-hover/thumb:border-talia-red/20 transition-colors opacity-40">
                                    {icons[type] || icons.documento}
                                </div>
                                <span className="text-[6px] uppercase tracking-tighter text-center px-0.5 truncate w-full font-bold text-gray-600">{asset.fileName}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-talia-red/5 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all duration-300">
                            <Maximize2 className="w-3.5 h-3.5 text-white drop-shadow-lg scale-90 group-hover/thumb:scale-100 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="h-0.5 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        </div>
    );
};

const StageCanvas: React.FC<StageCanvasProps> = ({ assets, activeSession, onImport, onUpdateLayout, onDeleteAsset, onUpdateAsset, focusAssetId, onSetFocusAssetId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const groupedAssets = useMemo(() => {
      const groups: Record<string, UIAsset[]> = { video: [], audio: [], imagem: [], documento: [], codigo: [] };
      assets.forEach(a => {
          let cat = a.type as string;
          if (cat === 'image') cat = 'imagem';
          if (cat === 'text' || cat === 'pdf') cat = 'documento';
          if (cat === 'code') cat = 'codigo';
          if (groups[cat]) groups[cat].push(a);
          else groups.documento.push(a);
      });
      return groups;
  }, [assets]);

  if (!activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-transparent relative overflow-hidden">
         {/* Background Pulse */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,59,59,0.1),transparent_60%)] animate-pulse-glow"></div>
         
         <div className="text-center z-10 relative p-12 border border-white/10 bg-black/40 backdrop-blur-md rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.6)]">
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 italic tracking-wide [text-shadow:0_0_20px_rgba(255,255,255,0.4)]">
                Aguardando Seleção de Contexto
            </h2>
            <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-talia-red to-transparent mx-auto mb-6 shadow-[0_0_15px_rgba(255,59,59,0.8)]"></div>
            <p className="typography-effect text-[10px]">
                Stage Protocol Inactive
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-transparent overflow-hidden p-0 flex flex-col select-none h-full">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="h-9 flex items-center justify-between px-4 bg-black/60 backdrop-blur-xl border-b border-white/5 z-20 shrink-0">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Bookmark className="w-3 h-3 text-talia-red opacity-60" />
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] font-mono">STUDIO STAGE v3.1</span>
            </div>
            <div className="w-[1px] h-3 bg-white/10"></div>
            <h2 className="text-[9px] font-bold text-white tracking-[0.1em] uppercase max-w-[300px] truncate opacity-80">{activeSession.title}</h2>
         </div>
         <div className="flex items-center gap-3">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-talia-red/10 text-white text-[8px] font-bold uppercase tracking-wider transition-all border border-white/10 hover:border-talia-red/30 rounded-none group"
             >
                <Plus className="w-2.5 h-2.5" /> 
                <span>Injetar Ativo</span>
             </button>
         </div>
         <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onImport(Array.from(e.target.files))} className="hidden" multiple />
      </div>

      <div className="relative flex-grow overflow-auto p-3 flex flex-wrap content-start items-start gap-1">
        {assets.length === 0 ? (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-30">
                <Maximize2 className="w-10 h-10 text-gray-600 mb-4" />
                <p className="typography-effect text-[8px]">Multimodal Architecture Empty</p>
            </div>
        ) : (
            <>
                <PoolCard type="imagem" assets={groupedAssets.imagem} onAssetClick={onSetFocusAssetId} />
                <PoolCard type="video" assets={groupedAssets.video} onAssetClick={onSetFocusAssetId} />
                <PoolCard type="audio" assets={groupedAssets.audio} onAssetClick={onSetFocusAssetId} />
                <PoolCard type="documento" assets={groupedAssets.documento} onAssetClick={onSetFocusAssetId} />
                <PoolCard type="codigo" assets={groupedAssets.codigo} onAssetClick={onSetFocusAssetId} />
            </>
        )}
      </div>

      {/* OVERLAYER DE INSPEÇÃO - Retido/Contido dentro da StageCanvas */}
      {focusAssetId && (
        <AssetCanvas 
          assets={assets}
          selectedAssetId={focusAssetId}
          onSelectAsset={onSetFocusAssetId}
          onClose={() => onSetFocusAssetId(null)}
          onImport={onImport}
          onDeleteAsset={onDeleteAsset}
          onUpdateAsset={onUpdateAsset}
        />
      )}
    </div>
  );
};

export default StageCanvas;
