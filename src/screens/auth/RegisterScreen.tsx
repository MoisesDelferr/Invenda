import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/Layout/Header';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

interface RegisterScreenProps {
  onNavigate: (screen: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { signUp } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setError('A senha deve ter pelo menos 6 caracteres');
        } else {
          setError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && confirmPassword;

  if (success) {
    return (
      <div>
        <Header title="Conta Criada" />
        
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Conta criada com sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Você já pode fazer login e começar a usar o Invenda.
              </p>
              <Button
                variant="primary"
                onClick={() => onNavigate('login')}
                fullWidth
              >
                Fazer Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Criar Conta" onBack={() => onNavigate('login')} />
      
      <div className="p-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Criar nova conta</h2>
              <p className="text-gray-600">Preencha os dados para começar</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Email"
              type="email"
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

            <Input
              label="Confirmar Senha"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
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
              icon={UserPlus}
              disabled={!isFormValid || loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-700">
              <strong>💡 Dica:</strong> Use uma senha forte com pelo menos 6 caracteres.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};