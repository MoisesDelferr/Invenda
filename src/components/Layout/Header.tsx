import React from 'react';
import { ArrowLeft, Leaf } from 'lucide-react';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showLogo?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, showLogo = false }) => {
  return (
    <header className="bg-emerald-500 text-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        <div className="flex items-center gap-2 flex-1 justify-center">
          {showLogo && <Leaf size={24} />}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>
        
        {onBack && <div className="w-10" />}
      </div>
    </header>
  );
};