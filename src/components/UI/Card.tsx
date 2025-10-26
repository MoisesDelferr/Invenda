import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'tip'; 
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'default' 
}) => {
    
    const sharedClasses = 'rounded-xl shadow-sm p-6';

    const interactiveClasses = onClick
        ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-95' 
        : '';

    let variantClasses = '';

    switch (variant) {
        case 'tip':
            // Configuração para o Card de Dica
            variantClasses = 'bg-orange-50 border border-orange-200';
            break;
        case 'default':
        default: 
            // que define as classes do card original (branco/cinza)
            variantClasses = 'bg-white border border-gray-100';
            break;
    }

    return (
      <div 
        className={`${variantClasses} ${sharedClasses} ${interactiveClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    );
};