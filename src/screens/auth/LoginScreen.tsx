import React, { useState } from 'react';
import { LogIn, Mail, Lock, UserPlus, Key } from 'lucide-react';
import { Header } from '../../components/Layout/Header';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

interface LoginScreenProps {
  onNavigate: (screen: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Por favor, confirme seu email antes de fazer login');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
        }
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password;

  return (
    <div>
      <Header title="Entrar" showLogo />
      
      <div className="p-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <LogIn className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bem-vindo de volta!</h2>
              <p className="text-gray-600">Entre na sua conta para continuar</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email"
              type="text"
              placeholder="seu@email.com"
              value={email}
              onChange={setEmail}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              icon={LogIn}
              disabled={!isFormValid || loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => onNavigate('forgot-password')}
              className="w-full text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center gap-2 py-2"
            >
              <Key size={16} />
              Esqueci minha senha
            </button>

            <div className="border-t border-gray-200 pt-4">
              <Button
                variant="outline"
                icon={UserPlus}
                onClick={() => onNavigate('register')}
                fullWidth
              >
                Criar nova conta
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};