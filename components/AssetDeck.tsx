
import React, { useState } from 'react';
import { MediaAsset } from '../types';
import { Image, X, Download, Link } from './icons/Icons';

interface AssetDeckProps {
  assets: MediaAsset[];
  isOpen: boolean;
  onClose: () => void;
}

const AssetDeck: React.FC<AssetDeckProps> = ({ assets, isOpen, onClose }) => {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  if (!isOpen) return null;

  const handleDownload = (asset: MediaAsset) => {
      const a = document.createElement('a');
      a.href = asset.url || '';
      const extension = asset.url?.startsWith('data:') ? 'png' : 'jpg';
      a.download = `talia_asset_${asset.id}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return (
    <>
      <div className="w-80 h-full bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300 flex-shrink-0 z-20">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-red-500" />
            <h2 className="font-serif font-bold text-white tracking-wide">Visual Deck</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 space-y-2 opacity-60">
                <Image className="w-10 h-10 mb-2" />
                <p className="text-sm">Nenhum ativo visual gerado ou encontrado ainda.</p>
                <p className="text-xs">Peça para a Talia "gerar uma imagem" ou pesquise algo visual.</p>
            </div>
          ) : (
            assets.slice().reverse().map((asset) => (
              <div 
                key={asset.id} 
                className="group relative bg-black/30 border border-white/10 rounded-lg overflow-hidden cursor-pointer hover:border-red-500/50 transition-all"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="aspect-square w-full relative overflow-hidden">
                    <img 
                        src={asset.url || ''} 
                        alt={asset.prompt || asset.fileName || 'Visual Asset'} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs text-white font-medium truncate w-full">
                            {asset.source === 'generated' ? 'Gerada por IA' : (asset.source === 'search' ? 'Pesquisa Google' : 'Upload')}
                        </span>
                    </div>
                </div>
                {asset.prompt && (
                    <div className="p-2 border-t border-white/5 bg-white/5">
                        <p className="text-[10px] text-gray-400 line-clamp-2">{asset.prompt}</p>
                    </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-8" onClick={() => setSelectedAsset(null)}>
            <div className="relative max-w-5xl max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={selectedAsset.url || ''} 
                    alt={selectedAsset.fileName} 
                    className="max-h-[80vh] w-auto rounded-lg shadow-2xl border border-white/10"
                />
                <div className="mt-4 flex items-center gap-4 bg-black/60 px-6 py-3 rounded-full border border-white/10 backdrop-blur-xl">
                    <div className="flex flex-col">
                        <span className="text-xs text-red-400 font-bold uppercase tracking-wider">{selectedAsset.source}</span>
                        {selectedAsset.prompt && <span className="text-sm text-gray-300 max-w-md truncate">{selectedAsset.prompt}</span>}
                    </div>
                    <div className="h-8 w-[1px] bg-white/20"></div>
                    {selectedAsset.source === 'search' && selectedAsset.url && (
                        <a href={selectedAsset.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white" title="Abrir Original">
                            <Link className="w-5 h-5" />
                        </a>
                    )}
                    <button onClick={() => handleDownload(selectedAsset)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white" title="Baixar">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white" title="Fechar">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default AssetDeck;
