import { Crown, Package, ShoppingCart, TrendingUp, Sparkles } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';

export function AccountPlanScreen() {
  const { usageStats, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 bg-red-50 border-red-200">
            <p className="text-red-600">Erro ao carregar informações: {error}</p>
          </Card>
        </div>
      </div>
    );
  }

  const isPremium = usageStats?.is_premium || false;
  const productsPercentage = usageStats?.products.percentage || 0;
  const salesPercentage = usageStats?.sales.percentage || 0;

  const showProductWarning = !isPremium && productsPercentage >= 80;
  const showSalesWarning = !isPremium && salesPercentage >= 80;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Plano e Uso</h1>
          <p className="text-slate-600">Gerencie sua assinatura e acompanhe seu uso</p>
        </div>

        {/* Current Plan Card */}
        <Card className={`p-8 ${isPremium ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' : 'bg-white'}`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {isPremium ? (
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Crown className="w-8 h-8 text-amber-600" />
                </div>
              ) : (
                <div className="p-3 bg-slate-100 rounded-xl">
                  <Sparkles className="w-8 h-8 text-slate-600" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {isPremium ? 'Plano Premium' : 'Plano Gratuito'}
                </h2>
                <p className="text-slate-600">
                  {isPremium ? 'Acesso ilimitado a todos os recursos' : 'Comece a gerenciar seu negócio'}
                </p>
              </div>
            </div>
            {isPremium && (
              <div className="px-4 py-2 bg-amber-100 rounded-full">
                <span className="text-sm font-semibold text-amber-700">Ativo</span>
              </div>
            )}
          </div>

          {!isPremium && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-3">Recursos Premium:</h3>
                <ul className="space-y-2">
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

              <Button
                variant="primary"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3"
              >
                <Crown className="w-5 h-5 mr-2" />
                Assinar Premium
              </Button>
            </div>
          )}
        </Card>

        {/* Usage Statistics */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Products Usage */}
          <Card className={`p-6 ${showProductWarning ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${showProductWarning ? 'bg-amber-100' : 'bg-blue-50'}`}>
                <Package className={`w-6 h-6 ${showProductWarning ? 'text-amber-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Produtos Cadastrados</h3>
                <p className="text-sm text-slate-600">
                  {isPremium ? 'Ilimitado' : `Limite: ${usageStats?.products.limit || 0}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-800">
                  {usageStats?.products.count || 0}
                </span>
                {!isPremium && (
                  <span className="text-lg text-slate-600">
                    / {usageStats?.products.limit || 0}
                  </span>
                )}
              </div>

              {!isPremium && (
                <>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        productsPercentage >= 100
                          ? 'bg-red-500'
                          : productsPercentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(productsPercentage, 100)}%` }}
                    ></div>
                  </div>

                  {showProductWarning && (
                    <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        Você está próximo do limite. Faça upgrade para adicionar mais produtos.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Sales Usage */}
          <Card className={`p-6 ${showSalesWarning ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${showSalesWarning ? 'bg-amber-100' : 'bg-emerald-50'}`}>
                <ShoppingCart className={`w-6 h-6 ${showSalesWarning ? 'text-amber-600' : 'text-emerald-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Vendas Este Mês</h3>
                <p className="text-sm text-slate-600">
                  {isPremium ? 'Ilimitado' : `Limite: ${usageStats?.sales.limit || 0}/mês`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold text-slate-800">
                  {usageStats?.sales.count || 0}
                </span>
                {!isPremium && (
                  <span className="text-lg text-slate-600">
                    / {usageStats?.sales.limit || 0}
                  </span>
                )}
              </div>

              {!isPremium && (
                <>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        salesPercentage >= 100
                          ? 'bg-red-500'
                          : salesPercentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(salesPercentage, 100)}%` }}
                    ></div>
                  </div>

                  {showSalesWarning && (
                    <div className="flex items-start gap-2 p-3 bg-amber-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        Você está próximo do limite mensal. Faça upgrade para vendas ilimitadas.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Upgrade CTA */}
        {!isPremium && (
          <Card className="p-8 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Cresça sem limites</h3>
                <p className="text-slate-300">
                  Desbloqueie todo o potencial do seu negócio com o plano Premium
                </p>
              </div>
              <Button
                variant="primary"
                className="bg-white text-slate-800 hover:bg-slate-100 font-semibold px-8 py-3 whitespace-nowrap"
              >
                <Crown className="w-5 h-5 mr-2" />
                Fazer Upgrade
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
