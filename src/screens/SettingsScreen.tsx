import React from "react";
import { LogOut, ArrowLeft, User, Crown } from "lucide-react";
import { supabase } from '../lib/supabase';

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Erro ao sair:", error.message);
  } else {
    window.location.reload();
  }
};

interface ConfigScreenProps {
  user: any;
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const ConfigScreen: React.FC<ConfigScreenProps> = ({ user, onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Configurações</h1>
        <div className="w-8" /> {/* placeholder para centralizar */}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* WhatsApp */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">📲 Fale conosco pelo WhatsApp</p>
            <p className="text-emerald-600 font-semibold text-lg">(19) 98607-7083</p>
          </div>

          {/* Foto do usuário */}
          <div className="flex justify-center">
            <img
              src="https://img.freepik.com/premium-vector/businessman-sitting-big-money-coins-finance-success-money-wealth_194360-190.jpg" // substitua pelo link correto da imagem
              alt="Foto do usuário"
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
          </div>

          {/* E-mail do usuário */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-gray-500 text-sm">E-mail</p>
            <p className="text-gray-800 font-medium">{user?.email}</p>
          </div>
        </div>

        {/* Botões na parte inferior */}
        <div className="space-y-3 mt-6">
          <button
            onClick={() => onNavigate?.('account-plan')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg shadow hover:from-amber-600 hover:to-orange-600"
          >
            <Crown className="w-5 h-5" />
            <span className="font-medium">Plano e Uso</span>
          </button>
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50">
            <User className="w-5 h-5 text-emerald-600" />
            <span className="text-gray-700 font-medium">Editar Perfil</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-lg shadow hover:bg-gray-50 text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
