
import React from 'react';

interface HeaderProps {
  onOpenAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAdmin }) => {
  return (
    <header className="bg-indigo-600 pt-10 pb-12 px-6 rounded-b-[48px] shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-20 blur-2xl"></div>
      <div className="relative flex justify-between items-center text-white">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Gestor VIP</h1>
          <p className="text-indigo-200 text-[10px] font-bold uppercase tracking-[2px]">Controle de Atendimento</p>
        </div>
        <button 
          onClick={onOpenAdmin}
          className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
