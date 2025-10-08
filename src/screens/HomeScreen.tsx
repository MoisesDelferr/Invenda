import React from 'react';
import { ShoppingCart, TrendingUp, Package, Trash2, Users, Menu } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const menuItems = [
    {
      id: 'register-sale',
      title: 'Registrar Venda',
      icon: ShoppingCart,
      color: 'bg-emerald-500 hover:bg-emerald-600'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Vendas',
      icon: TrendingUp,
      color: 'bg-emerald-400 hover:bg-emerald-500'
    },
    {
      id: 'stock',
      title: 'Estoque',
      icon: Package,
      color: 'bg-emerald-600 hover:bg-emerald-700'
    },
    {
      id: 'customers',
      title: 'Clientes',
      icon: Users,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'delete-sales',
      title: 'Excluir Vendas',
      icon: Trash2,
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className="bg-emerald-500 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          {/* Logo + Nome */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">I</span>
            </div>
            <h1 className="text-lg font-bold">Invenda</h1>
          </div>

          {/* Botão de Menu no lugar do LogoutButton */}
          <button
            onClick={() => onNavigate('config')}
            className="p-2 rounded-full hover:bg-emerald-600 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
      
      {/* Texto de boas-vindas */}
      <div className="p-6">
        <div className="mb-8 text-center">
          <p className="text-gray-600 text-lg">
            Gerencie suas vendas de forma simples e rápida
          </p>
        </div>

        {/* Menu principal */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`${item.color} text-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex flex-col items-center gap-4`}
            >
              <item.icon size={48} />
              <span className="text-lg font-bold text-center leading-tight">
                {item.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
