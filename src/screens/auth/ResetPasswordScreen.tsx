import React, { useState } from 'react'; // useEffect removido
import { Lock, CheckCircle } from 'lucide-react';
import { Header } from '../../components/Layout/Header';
import { Card } from '../../components/UI/Card';
import { Input } from '../../components/UI/Input';
import { Button } from '../../components/UI/Button';
import { useAuth } from '../../hooks/useAuth';

interface ResetPasswordScreenProps {
  onNavigate: (screen: string) => void;
}

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ onNavigate }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Removido 'session' pois não precisamos dela para a lógica de redirecionamento imediato
  const { updatePassword } = useAuth(); 

// --- REMOVIDO: useEffect que causava problema ---
/*
  useEffect(() => {
    // A lógica de redefinição do Supabase cria uma sessão temporária.
    // O redirecionamento aqui pode interferir na leitura dessa sessão.
    // A remoção deste bloco permite que o Supabase processe o token da URL.
    if (!session) {
      onNavigate('login');
    }
  }, [session, onNavigate]);
*/

  const handleUpdatePassword = async (e: React.FormEvent) => {
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
      const { error } = await updatePassword(password);
      
      if (error) {
        // Melhorando o tratamento de erro
        if (error.message.includes('Password should be')) {
          setError('A senha é muito fraca ou não atende aos requisitos (mínimo 6 caracteres).');
        } else {
          // Pode ser erro de link expirado/inválido
          setError('Erro ao atualizar senha. O link pode ter expirado ou estar inválido. Tente solicitar um novo link.');
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

  // ... (O restante do código da renderização permanece o mesmo)
  
  if (success) {
    return (
      <div>
        <Header title="Senha Atualizada" />
        
        <div className="p-6">
          <Card>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Senha atualizada!
              </h2>
              <p className="text-gray-600 mb-6">
                Sua senha foi alterada com sucesso. Você já pode usar o aplicativo.
              </p>
              <Button
                variant="primary"
                onClick={() => onNavigate('home')}
                fullWidth
              >
                Continuar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const isFormValid = password && confirmPassword;

  return (
    <div>
      <Header title="Nova Senha" />
      
      <div className="p-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Definir nova senha</h2>
              <p className="text-gray-600">Digite sua nova senha</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Nova Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              required
            />

            <Input
              label="Confirmar Nova Senha"
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
              icon={Lock}
              disabled={!isFormValid || loading}
              fullWidth
              size="lg"
            >
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
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