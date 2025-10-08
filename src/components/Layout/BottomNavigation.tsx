import React from 'react';
import { Home, ShoppingCart, TrendingUp, Package, Users } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Início',
      icon: Home,
      screen: 'home'
    },
    {
      id: 'dashboard',
      label: 'Vendas',
      icon: TrendingUp,
      screen: 'dashboard'
    },
    {
      id: 'register-sale',
      label: 'Vender',
      icon: ShoppingCart,
      screen: 'register-sale',
      isMain: true
    },
    {
      id: 'stock',
      label: 'Estoque',
      icon: Package,
      screen: 'stock'
    },
    {
      id: 'customers',
      label: 'Clientes',
      icon: Users,
      screen: 'customers'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = currentScreen === item.screen;
          const isMain = item.isMain;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 ${
                isMain
                  ? 'bg-emerald-500 text-white shadow-lg scale-110 -mt-2'
                  : isActive
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <item.icon size={isMain ? 24 : 20} />
              <span className={`text-xs font-medium ${isMain ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};