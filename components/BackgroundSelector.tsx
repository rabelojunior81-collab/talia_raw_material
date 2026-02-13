
import React, { useRef } from 'react';
import { X, Check, Upload, Trash2, Image as ImageIcon } from './icons/Icons';

export interface CustomBg {
    id: string;
    url: string;
    label: string;
}

interface BackgroundSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    currentBgId: string;
    onSelectBg: (id: string) => void;
    customBgs: CustomBg[];
    onUpdateCustomBgs: (bgs: CustomBg[]) => void;
}

// Curated minimalist high-quality backgrounds
const PRESETS = [
    { id: 'default', url: '', label: 'Padrão (Talia Red)' },
    { id: 'arch', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', label: 'Architecture' },
    { id: 'abstract', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=2070&auto=format&fit=crop', label: 'Abstract Color' },
    { id: 'dark_geo', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop', label: 'Dark Orbit' },
    { id: 'concrete', url: 'https://images.unsplash.com/photo-1485637701894-09ad422f6de6?q=80&w=1974&auto=format&fit=crop', label: 'Minimal Concrete' },
    { id: 'glass', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop', label: 'Ethereal' },
];

export const getBackgroundUrl = (id: string, customBgs: CustomBg[] = []) => {
    if (id === 'default') return undefined;
    const preset = PRESETS.find(p => p.id === id);
    if (preset) return preset.url;
    const custom = customBgs.find(c => c.id === id);
    return custom?.url;
};

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ 
    isOpen, 
    onClose,
    currentBgId,
    onSelectBg,
    customBgs,
    onUpdateCustomBgs
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            const newBg = {
                id: `custom_${Date.now()}`,
                url: base64,
                label: `Custom ${customBgs.length + 1}`
            };
            onUpdateCustomBgs([...customBgs, newBg]);
            onSelectBg(newBg.id);
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newCustoms = customBgs.filter(bg => bg.id !== id);
        onUpdateCustomBgs(newCustoms);
        if (currentBgId === id) onSelectBg('default');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in p-4" onClick={onClose}>
            <div className="w-full max-w-2xl bg-[#0a0a0b]/90 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden rounded-none" onClick={e => e.stopPropagation()}>
                
                {/* Elegant Header - Replaces Brutalist style */}
                <div className="flex items-center justify-between p-6 pb-4 bg-transparent">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-serif text-white font-medium tracking-tight">Ambiente Visual</h2>
                        <p className="text-xs text-gray-500 mt-1">Personalize o fundo do estúdio para foco e imersão.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-none transition-colors"
                        title="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Grid */}
                <div className="px-6 pb-6 overflow-y-auto max-h-[70vh] hide-scrollbar">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        
                        {/* Upload Button */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-video bg-white/[0.02] border border-dashed border-white/10 hover:border-white/30 hover:bg-white/[0.05] flex flex-col items-center justify-center cursor-pointer transition-all group gap-2 rounded-none"
                        >
                            <div className="p-3 rounded-none bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Upload className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </div>
                            <span className="text-xs text-gray-500 font-medium group-hover:text-gray-300">Carregar Imagem</span>
                            <input type="file" ref={fileInputRef} onChange={handleUpload} accept="image/*" className="hidden" />
                        </div>

                        {/* Presets */}
                        {PRESETS.map(bg => (
                            <div 
                                key={bg.id}
                                onClick={() => onSelectBg(bg.id)}
                                className={`relative aspect-video cursor-pointer overflow-hidden border rounded-none transition-all group ${currentBgId === bg.id ? 'border-talia-red shadow-[0_0_15px_rgba(255,59,59,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                            >
                                {bg.url ? (
                                    <img src={bg.url} alt={bg.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-red-900/20 to-black flex items-center justify-center">
                                        <div className="w-2 h-2 bg-talia-red rounded-none opacity-50"></div>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                    <span className="text-[10px] text-white font-medium truncate w-full">{bg.label}</span>
                                </div>
                                {currentBgId === bg.id && (
                                    <div className="absolute top-2 right-2 p-1 bg-talia-red rounded-none shadow-lg">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Customs */}
                        {customBgs.map(bg => (
                            <div 
                                key={bg.id}
                                onClick={() => onSelectBg(bg.id)}
                                className={`relative aspect-video cursor-pointer overflow-hidden border rounded-none transition-all group ${currentBgId === bg.id ? 'border-talia-red shadow-[0_0_15px_rgba(255,59,59,0.2)]' : 'border-white/5 hover:border-white/20'}`}
                            >
                                <img src={bg.url} alt={bg.label} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                                     <span className="text-[10px] text-white font-medium truncate flex-1 pr-2">{bg.label}</span>
                                     <button 
                                        onClick={(e) => handleDelete(e, bg.id)} 
                                        className="p-1.5 hover:bg-white/20 rounded-none hover:text-red-400 text-gray-300 transition-colors"
                                     >
                                         <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                </div>
                                {currentBgId === bg.id && (
                                    <div className="absolute top-2 right-2 p-1 bg-talia-red rounded-none shadow-lg">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BackgroundSelector;
