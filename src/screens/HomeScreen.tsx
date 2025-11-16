import React from 'react';
import { ShoppingCart, TrendingUp, Package, Trash2, Users, Menu } from 'lucide-react';
// import BannerImage from '../assets/banner.png'; // Not used in the final display
import { Header } from '../components/Layout/Header';
import { Button } from '../components/UI/Button';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  // Items for the 2x2 Grid (main actions)
  const mainActions = [
    {
      id: 'stock',
      title: 'Adicionar produto/estoque', // Updated title to match the image case
      icon: Package,
      color: 'bg-emerald-500 hover:bg-emerald-600'
    },
    {
      id: 'register-sale',
      title: 'Registrar Venda',
      icon: ShoppingCart,
      color: 'bg-emerald-400 hover:bg-emerald-600'
    },
    {
      id: 'dashboard',
      title: 'Dashboard Vendas',
      icon: TrendingUp,
      // Assuming a different icon for the second spot based on the code's menuItems
      color: 'bg-emerald-400 hover:bg-emerald-600'
    },
    {
      id: 'customers',
      // Using a different action for the 4th spot as 'Dashboard Vendas' is repeated in the image
      title: 'Clientes', 
      icon: Users,
      color: 'bg-emerald-400 hover:bg-emerald-600'
    },
  ];

  // The separate, full-width button (delete action)
  const deleteSalesAction = {
    id: 'delete-sales',
    title: 'Excluir Vendas',
    icon: Trash2,
    color: 'bg-red-500/80 hover:bg-red-500', // Adjusted to match the softer red/pink color in the image
    textColor: 'text-white' // Text color matching the visual style
  };


  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header (Keeping the current implementation but simplifying the look) */}
      <div className="bg-white text-orange-500 p-4 shadow-md border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Invenda</h1>
          </div>

          {/* Placeholder for the circular element on the right (Assuming it's a profile/menu icon) */}
          <button
            onClick={() => onNavigate('config')}
            className="w-8 h-8 bg-emerald-500 rounded-full transition-colors"
            aria-label="Menu de Configurações"
          >
            {/* The image doesn't show a Menu icon, just a colored circle */}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {/* 2x2 Menu principal */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mainActions.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`${item.color} text-white p-6 h-40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-2`}
            >
              <item.icon size={36} />
              <span className="text-sm font-semibold text-center leading-tight">
                {item.title}
              </span>
            </button>
          ))}
        </div>

        {/* Excluir Vendas (Full-width, different color) */}
        <button
          key={deleteSalesAction.id}
          onClick={() => onNavigate(deleteSalesAction.id)}
          // Applying the distinct styling from the image
          className={`w-full ${deleteSalesAction.color} ${deleteSalesAction.textColor} p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] font-bold text-lg`}
        >
          {deleteSalesAction.title}
        </button>
      </div>

      {/* Note: The bottom navigation bar is present in the image but not in the original code,
          and is not included in this refactor, but would typically be placed here. */}
    </div>
  );
};