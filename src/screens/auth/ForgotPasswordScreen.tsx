import React, { useState } from 'react';
import { Key, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Header } from '../../components/Layout/Header';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordScreenProps {
  onNavigate: (screen: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        if (error.message.includes('User not found')) {
          setError('Email não encontrado');
        } else {
          setError('Erro ao enviar email. Tente novamente.');
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

  if (success) {
    return (
      <div>
        <Header title="Email Enviado" />
        
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Email enviado!
              </h2>
              <p className="text-gray-600 mb-6">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={() => onNavigate('login')}
                  fullWidth
                >
                  Voltar ao Login
                </Button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="w-full text-emerald-600 hover:text-emerald-700 text-sm font-medium py-2"
                >
                  Enviar novamente
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Recuperar Senha" onBack={() => onNavigate('login')} />
      
      <div className="p-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Key className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Esqueceu sua senha?</h2>
              <p className="text-gray-600">Digite seu email para receber as instruções</p>
            </div>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={setEmail}
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
              icon={Mail}
              disabled={!email || loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>ℹ️ Informação:</strong> Você receberá um email com um link para redefinir sua senha. Verifique também a pasta de spam.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};