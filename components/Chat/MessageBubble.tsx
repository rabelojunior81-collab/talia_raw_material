
import React, { useMemo } from 'react';
import { User, Paperclip, Link, FileCode2, Search } from '../icons/Icons';
import { GroundingSource } from '../../types';

const md = (window as any).markdownit({
  html: true,
  linkify: true,
  typographer: true
});
const DOMPurify = (window as any).DOMPurify;

interface MessageBubbleProps {
  role: 'user' | 'model';
  text: string;
  mediaAssets?: Blob[];
  sources?: GroundingSource[];
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, text, mediaAssets, sources }) => {
  
  const sanitizedHtml = useMemo(() => {
    const rawHtml = md.render(text);
    return DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ['iframe'], 
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target']
    });
  }, [text]);

  const renderBlob = (blob: Blob, idx: number) => {
    const url = URL.createObjectURL(blob);
    
    if (blob.type.startsWith('image/')) {
      return (
        <div key={idx} className="relative group mt-1.5 max-w-[150px] shadow-lg">
          <img 
            src={url} 
            alt="Media" 
            className="relative rounded-none border border-white/10 object-cover" 
            onLoad={() => URL.revokeObjectURL(url)} 
          />
        </div>
      );
    }
    
    return (
      <div key={idx} className="mt-1 inline-flex items-center gap-1.5 px-2 py-1 text-[9px] font-mono bg-white/[0.03] border border-white/5 rounded-none text-gray-500">
        <Paperclip className="w-2.5 h-2.5 text-red-500/40"/> 
        <span className="truncate max-w-[60px]">{blob.type.split('/')[1] || 'file'}</span>
        <span className="opacity-20">|</span>
        <span>{(blob.size / 1024).toFixed(1)} KB</span>
      </div>
    );
  };

  const isModel = role === 'model';

  return (
    <div className={`flex gap-2 animate-fade-in ${!isModel ? 'flex-row-reverse' : 'flex-row'} group mb-2.5 w-full items-start`}>
      
      {/* Avatar - Minimalist */}
      <div className={`flex-shrink-0 w-5 h-5 rounded-none flex items-center justify-center border shadow-sm mt-0.5 ${isModel ? 'bg-[#1a1a1a] border-white/10' : 'bg-red-900/20 border-red-500/20'}`}>
         {isModel ? <span className="font-serif font-bold text-white text-[8px]">t.</span> : <User className="w-2.5 h-2.5 text-red-300/40"/>}
      </div>

      <div className={`flex flex-col max-w-[92%] min-w-0 ${!isModel ? 'items-end' : 'items-start'}`}>
        
        {/* Message Container - Ultra tight padding */}
        <div className={`
          relative px-3 py-1.5 rounded-none border shadow-sm transition-all duration-300 text-[13px] leading-snug break-words min-w-0 w-full overflow-hidden
          ${isModel 
            ? 'bg-white/[0.02] border-white/[0.05] text-gray-200 backdrop-blur-sm' 
            : 'bg-red-900/[0.03] border-red-500/10 text-white backdrop-blur-[2px]'}
        `}>
          
          <div 
            className="markdown-content text-xs overflow-x-auto min-w-0"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />

          {mediaAssets && mediaAssets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5 pt-1.5 border-t border-white/[0.03]">
              {mediaAssets.map((blob, idx) => renderBlob(blob, idx))}
            </div>
          )}

          {isModel && sources && sources.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-white/[0.05] flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                    <Search className="w-2.5 h-2.5 text-talia-red/60" />
                    <span className="text-[7px] font-bold text-gray-600 uppercase tracking-widest">Fontes Verificadas</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {sources.map((source, index) => (
                    <a
                        key={index}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/source flex items-center gap-1.5 px-2 py-1 bg-black/40 hover:bg-white/5 border border-white/10 hover:border-talia-red/30 transition-all text-[8px] text-gray-500 hover:text-gray-200 max-w-full font-mono rounded-none shadow-sm relative overflow-hidden"
                        title={source.title}
                    >
                        {/* Hover glow effect */}
                        <div className="absolute inset-0 bg-talia-red/5 translate-y-full group-hover/source:translate-y-0 transition-transform duration-300"></div>
                        
                        <Link className="w-2 h-2 flex-shrink-0 z-10" />
                        <span className="truncate max-w-[120px] relative z-10">{source.title || new URL(source.uri).hostname}</span>
                    </a>
                    ))}
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
