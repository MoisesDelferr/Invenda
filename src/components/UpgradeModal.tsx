import { X, Crown, Sparkles } from 'lucide-react';
import { Button } from './UI/Button';
import { useStripe } from '../hooks/useStripe';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  currentCount?: number;
  limit?: number;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title,
  message,
  currentCount,
  limit
}: UpgradeModalProps) {
  const { redirectToCheckout, loading, error } = useStripe();

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    await redirectToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <Crown className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">Upgrade Necessário</h2>
          </div>
          {currentCount !== undefined && limit !== undefined && (
            <p className="text-amber-50">
              Você usou {currentCount} de {limit} disponíveis
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-slate-600">{message}</p>
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-medium">Com o Premium você terá:</span>
            </div>
            <ul className="space-y-2 ml-6">
              <li className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Produtos ilimitados
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Vendas ilimitadas
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Relatórios avançados
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Suporte prioritário
              </li>
            </ul>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Depois
            </Button>
            <Button
              variant="primary"
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
