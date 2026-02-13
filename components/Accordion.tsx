import React, { useState } from 'react';
import { ChevronDown } from './icons/Icons';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 bg-black/20 shadow-lg shadow-black/30">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-3 text-left hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-100 tracking-wide [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]">{title}</span>
        <ChevronDown className={`w-5 h-5 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-white/20">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;