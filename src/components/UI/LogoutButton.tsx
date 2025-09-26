import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../hooks/useAuth';

export const LogoutButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Tem certeza que deseja sair da sua conta?');
    
    if (confirmLogout) {
      setLoading(true);
      try {
        await signOut();
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Button
      variant="logout"
      icon={LogOut}
      onClick={handleLogout}
      disabled={loading}
      size="sm"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </Button>
  );
};