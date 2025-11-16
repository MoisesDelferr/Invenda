import React from "react";
import { ArrowLeft, Leaf, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showLogo?: boolean;
  onOpenSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, showLogo = false, onOpenSettings }) => {
  return (
    <header className="bg-white text-emerald-500 p-4 shadow-md">
      <div className="flex items-center justify-around">
        
        {/* Botão Voltar */}
        {onBack ? (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        ) : (
          <div className="w-10" />
        )}

        {/* Título + Logo */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          {showLogo && <Leaf size={24} />}
          <h1 className="text-lg font-bold">{title}</h1>
        </div>

        
      </div>
    </header>
  );
};
