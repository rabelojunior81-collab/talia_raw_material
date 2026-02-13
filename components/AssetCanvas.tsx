
import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { UIAsset } from '../hooks/useMediaAssets';
import { AtivoMultimidia } from '../types';
// Added FileCode2 to the destructuring import
import { X, Download, ChevronLeft, ChevronRight, Image as ImageIcon, Maximize2, Video as VideoIcon, Activity, FileText, Sparkles, Trash2, Edit3, Move, Copy, Check, Clock, Database, Plus, Minus, RotateCcw, FileText as PdfIcon, FileCode2 } from './icons/Icons';

const md = (window as any).markdownit({
    html: true,
    linkify: true,
    typographer: true
});
const DOMPurify = (window as any).DOMPurify;

interface AssetCanvasProps {
  assets: UIAsset[];
  selectedAssetId: string | null;
  onSelectAsset: (id: string | null) => void;
  onClose: () => void;
  onImport: (files: File[]) => void;
  onDeleteAsset: (id: string) => Promise<void>;
  onUpdateAsset: (id: string, data: Partial<AtivoMultimidia>) => Promise<void>;
}

const MarkdownViewer = ({ asset }: { asset: UIAsset }) => {
    const [content, setContent] = useState<string>('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const load = async () => {
            if (asset.blob) setContent(await asset.blob.text());
            else if (asset.url) setContent(await (await fetch(asset.url)).text());
        };
        load();
    }, [asset]);

    const html = useMemo(() => DOMPurify.sanitize(md.render(content || '')), [content]);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-5xl h-full flex flex-col items-center gap-2 animate-fade-in relative">
            <div className="absolute top-0 right-0 z-10">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all shadow-xl rounded-none"
                >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copiado' : 'Copiar Texto'}
                </button>
            </div>
            <div className="w-full h-full bg-[#0a0a0b] text-gray-300 p-8 overflow-y-auto border border-white/5 shadow-2xl selection:bg-red-500/20">
                <article className="markdown-content max-w-none text-sm" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>
    );
};

const PDFViewer = ({ asset }: { asset: UIAsset }) => {
    return (
        <div className="w-full max-w-2xl p-12 bg-[#0a0a0b] border border-white/10 flex flex-col items-center shadow-2xl relative text-center">
            <div className="w-20 h-20 bg-red-500/20 border border-red-500/40 flex items-center justify-center mb-6 rounded-none">
                <FileText className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-white mb-2 font-serif text-xl font-bold">{asset.fileName}</h3>
            <p className="text-gray-500 text-xs mb-8 uppercase tracking-widest font-mono">Documento PDF Injetado no Stage</p>
            <div className="p-4 bg-white/[0.02] border border-white/5 text-left mb-8">
                <p className="text-xs text-gray-400 leading-relaxed">
                    A Talia está habilitada para analisar este documento PDF. Você pode fazer perguntas sobre o conteúdo, pedir resumos ou extrair dados específicos via chat.
                </p>
            </div>
            <a 
                href={asset.objectUrl} 
                download={asset.fileName}
                className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all shadow-lg rounded-none"
            >
                Abrir / Baixar PDF
            </a>
        </div>
    );
}

const MetadataSidebar = ({ asset, onUpdate, onDelete }: { asset: UIAsset, onUpdate: (data: any) => void, onDelete: () => void }) => {
    const [name, setName] = useState(asset.fileName);
    const [isEditing, setIsEditing] = useState(false);

    const fileSize = useMemo(() => {
        if (!asset.blob) return 'Unknown';
        const bytes = asset.blob.size;
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }, [asset.blob]);

    const handleSaveName = () => {
        onUpdate({ fileName: name });
        setIsEditing(false);
    };

    return (
        <div className="w-64 h-full border-l border-white/10 bg-black/20 flex flex-col p-4 gap-4 shrink-0 animate-fade-in overflow-y-auto hide-scrollbar backdrop-blur-md">
            <div className="space-y-2">
                <label className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">Identidade</label>
                <div className="space-y-1">
                    {isEditing ? (
                        <div className="flex flex-col gap-1.5">
                            <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full bg-black border border-talia-red/40 px-2 py-1.5 text-xs text-white focus:outline-none font-mono rounded-none"
                                autoFocus
                            />
                            <div className="flex gap-1.5">
                                <button onClick={handleSaveName} className="flex-1 py-1 bg-talia-red text-white text-[8px] font-bold uppercase tracking-widest rounded-none">Salvar</button>
                                <button onClick={() => setIsEditing(false)} className="flex-1 py-1 bg-white/5 text-gray-400 text-[8px] font-bold uppercase tracking-widest rounded-none">Cancelar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between group">
                            <h2 className="text-sm font-serif text-white leading-tight break-all font-bold">{asset.fileName}</h2>
                            <button onClick={() => setIsEditing(true)} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white rounded-none"><Edit3 className="w-3 h-3"/></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">Propriedades</label>
                <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] text-gray-500 font-mono">Tipo</span>
                        <span className="text-[8px] text-white font-mono uppercase">{asset.type}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] text-gray-500 font-mono">Tamanho</span>
                        <span className="text-[8px] text-white font-mono">{fileSize}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5">
                        <span className="text-[8px] text-gray-500 font-mono">Origem</span>
                        <span className="text-[8px] text-white font-mono uppercase text-talia-red">{asset.source}</span>
                    </div>
                </div>
            </div>

            {asset.prompt && (
                <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-gray-600 uppercase tracking-[0.2em]">Prompt</label>
                    <div className="p-2.5 bg-black/50 border border-white/5 text-[9px] text-gray-500 font-mono leading-relaxed italic max-h-24 overflow-y-auto">
                        "{asset.prompt}"
                    </div>
                </div>
            )}

            <div className="mt-auto space-y-1.5 pt-4 border-t border-white/5">
                <a 
                    href={asset.objectUrl} 
                    download={asset.fileName}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-white text-black text-[9px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all rounded-none"
                >
                    <Download className="w-3 h-3" /> Download Ativo
                </a>
                <button 
                    onClick={onDelete}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-red-900/10 border border-red-500/10 text-red-500 text-[9px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-none"
                >
                    <Trash2 className="w-3 h-3" /> Excluir
                </button>
            </div>
        </div>
    );
};

const AssetCanvas: React.FC<AssetCanvasProps> = ({ assets, selectedAssetId, onSelectAsset, onClose, onDeleteAsset, onUpdateAsset }) => {
  const [selectedAsset, setSelectedAsset] = useState<UIAsset | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);

  useEffect(() => {
    const found = assets.find(a => a.id === selectedAssetId);
    if (found) {
        setSelectedAsset(found);
        resetTransform();
    }
  }, [selectedAssetId, assets]);

  const resetTransform = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const navigate = useCallback((dir: 'p' | 'n') => {
      const idx = assets.findIndex(a => a.id === selectedAssetId);
      if (idx === -1) return;
      const next = dir === 'n' ? (idx + 1) % assets.length : (idx - 1 + assets.length) % assets.length;
      onSelectAsset(assets[next].id);
  }, [assets, selectedAssetId, onSelectAsset]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') navigate('p');
        if (e.key === 'ArrowRight') navigate('n');
        if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onClose]);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isImage) return;
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 10));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isImage) return;
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isImage) return;
    const dx = e.clientX - lastMousePos.x;
    const dy = e.clientY - lastMousePos.y;
    setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers for pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isImage) return;
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1) {
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isImage) return;
    if (e.touches.length === 2 && lastTouchDistance !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - lastTouchDistance) * 0.01;
      setZoom(prev => Math.min(Math.max(prev + delta, 0.1), 10));
      setLastTouchDistance(dist);
    } else if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - lastMousePos.x;
      const dy = e.touches[0].clientY - lastMousePos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchEnd = () => {
    setLastTouchDistance(null);
    setIsDragging(false);
  };

  if (!selectedAsset) return null;

  const isImage = selectedAsset.type === 'imagem' || selectedAsset.type === 'image';
  const isVideo = selectedAsset.type === 'video';
  const isAudio = selectedAsset.type === 'audio';
  const isPdf = selectedAsset.mimeType === 'application/pdf';
  const isDoc = (selectedAsset.type === 'documento' || selectedAsset.type === 'codigo') && !isPdf;

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-[#050506]/90 backdrop-blur-3xl animate-fade-in shadow-2xl overflow-hidden">
      {/* Top Controls Bar - Strictly inside parent */}
      <div className="h-11 flex items-center justify-between px-3 bg-black/40 backdrop-blur-md border-b border-white/5 shrink-0 relative z-30 shadow-lg">
          <div className="flex items-center gap-4">
             {/* CLEAR BACK BUTTON */}
             <button 
                onClick={onClose} 
                className="flex items-center gap-2 px-3 py-1.5 bg-talia-red/10 border border-talia-red/30 text-white hover:bg-talia-red hover:border-talia-red transition-all group rounded-none"
             >
                <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform"/>
                <span className="text-[10px] font-bold uppercase tracking-widest">Voltar ao Estúdio</span>
             </button>

             <div className="flex items-center gap-2 border-l border-white/10 pl-4 h-6">
                <Database className="w-3 h-3 text-talia-red opacity-40" />
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] font-mono">NODE_INSPECT</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
              <div className="flex items-center bg-black/50 backdrop-blur-sm border border-white/10 p-0.5">
                <button 
                    onClick={() => navigate('p')} 
                    className="p-1.5 hover:bg-white/5 text-gray-600 hover:text-white transition-all disabled:opacity-20 rounded-none"
                    title="Anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="px-4 text-[9px] font-mono text-gray-500 flex items-center justify-center min-w-[60px] border-x border-white/5">
                    <span className="text-white font-bold">{assets.findIndex(a => a.id === selectedAssetId) + 1}</span>
                    <span className="mx-1 opacity-40">/</span>
                    <span>{assets.length}</span>
                </div>
                <button 
                    onClick={() => navigate('n')} 
                    className="p-1.5 hover:bg-white/5 text-gray-600 hover:text-white transition-all disabled:opacity-20 rounded-none"
                    title="Próximo"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
              </div>
          </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Main Content Area */}
        <div 
            className={`flex-grow flex items-center justify-center p-8 relative overflow-hidden ${isImage ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
             {/* Floating Zoom Controls - Minimalist */}
             {isImage && (
                <div className="absolute top-6 left-6 z-20 flex items-center gap-0.5 bg-black/60 backdrop-blur-md border border-white/5 p-0.5 scale-100 opacity-60 hover:opacity-100 transition-opacity shadow-2xl">
                    <button onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.1))} className="p-1.5 hover:text-white transition-all text-gray-500 rounded-none"><Minus className="w-3.5 h-3.5" /></button>
                    <div className="px-3 text-[9px] font-mono text-white/50 w-12 text-center border-x border-white/5">{Math.round(zoom * 100)}%</div>
                    <button onClick={() => setZoom(prev => Math.min(prev + 0.2, 10))} className="p-1.5 hover:text-white transition-all text-gray-500 rounded-none"><Plus className="w-3.5 h-3.5" /></button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
                    <button onClick={resetTransform} className="p-1.5 hover:text-white transition-all text-gray-500 rounded-none" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
                </div>
            )}

            <div 
                className="w-full h-full flex items-center justify-center"
                style={isImage ? {
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                } : {}}
            >
                {isImage && (
                    <img src={selectedAsset.objectUrl} className="max-w-full max-h-full object-contain shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5" draggable={false} />
                )}
                {isVideo && <video src={selectedAsset.objectUrl} controls className="max-w-full max-h-full shadow-[0_30px_100px_rgba(0,0,0,0.8)] border border-white/5" />}
                {isAudio && (
                    <div className="w-full max-w-md p-10 bg-[#0a0a0b] border border-white/10 flex flex-col items-center shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-talia-red/20 overflow-hidden">
                           <div className="w-1/2 h-full bg-talia-red animate-float"></div>
                        </div>
                        <Activity className="w-16 h-16 text-talia-red/30 animate-pulse-glow mb-6" />
                        <h3 className="text-white mb-6 font-serif text-xl tracking-tight text-center truncate w-full px-4 font-bold">{selectedAsset.fileName}</h3>
                        <audio src={selectedAsset.objectUrl} controls className="w-full h-10 custom-audio" />
                    </div>
                )}
                {isPdf && <PDFViewer asset={selectedAsset} />}
                {isDoc && <MarkdownViewer asset={selectedAsset} />}
            </div>
        </div>

        {/* Sidebar - Integrated tightly */}
        <MetadataSidebar 
            asset={selectedAsset} 
            onUpdate={(data) => onUpdateAsset(selectedAsset.id, data)} 
            onDelete={() => onDeleteAsset(selectedAsset.id).then(onClose)}
        />
      </div>

      {/* Footer Nav Bar - Increased Height (h-24) and Larger Thumbs (h-16) */}
      <div className="h-24 bg-black/60 border-t border-white/10 flex items-center px-0 shrink-0 relative z-20 backdrop-blur-xl">
          <div className="flex items-center gap-4 overflow-x-auto hide-scrollbar w-full py-3 h-full">
            <div className="w-2 shrink-0 h-full"></div> 
            {assets.map(a => {
                const itemIsImage = a.type === 'imagem' || a.type === 'image';
                const isActive = a.id === selectedAssetId;
                return (
                    <div 
                    key={a.id}
                    onClick={() => onSelectAsset(a.id)}
                    className={`h-16 aspect-[4/3] shrink-0 border transition-all cursor-pointer overflow-hidden relative rounded-none ${isActive ? 'border-talia-red ring-1 ring-talia-red/40 scale-105 z-10 shadow-lg' : 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'}`}
                    >
                        {itemIsImage ? <img src={a.objectUrl} className="w-full h-full object-cover" /> : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.01] gap-1 p-0.5">
                                {a.mimeType === 'application/pdf' ? <PdfIcon className="w-5 h-5 text-red-500" /> : (
                                    <>
                                        {a.type === 'video' && <VideoIcon className="w-5 h-5 text-blue-400" />}
                                        {a.type === 'audio' && <Activity className="w-5 h-5 text-green-400" />}
                                        {a.type === 'documento' && <FileText className="w-5 h-5 text-gray-400" />}
                                        {a.type === 'codigo' && <FileCode2 className="w-5 h-5 text-yellow-400" />}
                                    </>
                                )}
                                <span className="text-[7px] font-bold uppercase tracking-tighter truncate w-full text-center px-0.5 font-mono leading-none">{a.fileName}</span>
                            </div>
                        )}
                        {isActive && <div className="absolute inset-0 bg-talia-red/5"></div>}
                    </div>
                );
            })}
            <div className="w-2 shrink-0 h-full"></div>
          </div>
      </div>
    </div>
  );
};

export default AssetCanvas;
