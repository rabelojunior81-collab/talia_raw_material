
import React from 'react';
import { AutonomyMode } from '../types';
import { User, Search, Bell, Settings, Key } from './icons/Icons';

interface HeaderProps {
  autonomyMode: AutonomyMode;
  onSetAutonomyMode: (mode: AutonomyMode) => void;
  userName: string;
  onOpenSettings: () => void;
  onOpenApiSettings?: () => void;
}

const Header: React.FC<HeaderProps> = ({ autonomyMode, onSetAutonomyMode, userName, onOpenSettings, onOpenApiSettings }) => {
  return (
    <header className="h-10 flex items-center justify-between px-4 bg-black/40 border-b border-white/5 z-20 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
           <h1 className="text-base font-serif font-bold text-white tracking-tight">talia<span className="text-talia-red">.</span>ai</h1>
           <span className="text-[8px] text-gray-500 font-bold tracking-[0.2em] uppercase border-l border-white/10 pl-2 ml-1">Studio</span>
        </div>

        {/* Autonomy Toggle - More compact */}
        <div className="bg-black/60 border border-white/5 p-0.5 flex items-center ml-2">
           <button 
             onClick={() => onSetAutonomyMode('Co-Autor')}
             className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${autonomyMode === 'Co-Autor' ? 'bg-white/5 text-white' : 'text-gray-600 hover:text-gray-400'}`}
           >
             Co-Autor
           </button>
           <button 
             onClick={() => onSetAutonomyMode('Talia Solo')}
             className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-all ${autonomyMode === 'Talia Solo' ? 'bg-talia-red text-white' : 'text-gray-600 hover:text-gray-400'}`}
           >
             Solo
           </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden sm:block">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
           <input 
             placeholder="Search..." 
             className="bg-white/5 border border-white/5 px-8 py-1 rounded-none text-[10px] text-gray-400 w-40 focus:w-56 transition-all focus:outline-none focus:border-white/20"
           />
        </div>

        <div className="flex items-center gap-3 border-l border-white/10 pl-4 h-6">
          <button 
            onClick={onOpenApiSettings}
            className="text-gray-600 hover:text-talia-red transition-colors" 
            title="Configurar API Key"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          
          <button 
            onClick={onOpenSettings}
            className="text-gray-600 hover:text-white transition-colors" 
            title="Ajustes Visuais"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          
          <button className="text-gray-600 hover:text-white transition-colors">
            <Bell className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-2">
             <div className="text-right">
                <p className="text-[10px] font-bold text-white leading-none">{userName}</p>
             </div>
             <div className="w-6 h-6 bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="w-3 h-3 text-gray-600" />
             </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
