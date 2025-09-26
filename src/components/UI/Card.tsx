import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, onClick, className = '' }) => {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100 p-6';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-95' : '';
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};