import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Header } from '../../components/Layout/Header';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

interface RegisterScreenProps {
  onNavigate: (screen: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const { error } = await signUp(email, password, name);
      
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

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', valid: password.length >= 8 },
    { label: 'Uma letra maiúscula', valid: /[A-Z]/.test(password) },
    { label: 'Um número', valid: /\d/.test(password) },
    { label: 'Um caractere especial', valid: /[^A-Za-z0-9]/.test(password) },
  ];

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
              label="Nome"
              type="name"
              placeholder="Informe seu nome"
              value={name}
              onChange={setName}
              required
            />
            
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={setEmail}
              required
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={setPassword}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmar Senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="space-y-1 text-xs"> {/* 👈 diminui a fonte */}
  {passwordRequirements.map((req, idx) => (
    <p
      key={idx}
      className={req.valid ? 'text-emerald-600' : 'text-gray-500'} // 👈 cinza neutro no ❌
    >
      {req.valid ? '✔️' : '✖️'} {req.label}
    </p>
  ))}
</div>

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
              <strong>💡 Dica:</strong> Use uma senha forte com pelo menos 8 caracteres.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
