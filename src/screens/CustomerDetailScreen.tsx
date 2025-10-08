import React from 'react';
import { User, Phone, CreditCard as Edit3, ShoppingBag, Calendar, DollarSign } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Customer, InstallmentSale } from '../types';
import { formatCurrency, formatDate } from '../utils/dateHelpers';

interface CustomerDetailScreenProps {
  customer: Customer | undefined;
  installmentSales: InstallmentSale[];
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  onAddPayment: (saleId: string, amount: number) => void;
}

// Tolerância para evitar erros de ponto flutuante em comparações financeiras.
const MINIMUM_OPEN_AMOUNT = 0.01;

export const CustomerDetailScreen: React.FC<CustomerDetailScreenProps> = ({
  customer,
  installmentSales,
  onBack,
  onNavigate,
  onAddPayment,
}) => {
  // CORREÇÃO PARA O WARNING DO REACT:
  // Move a chamada de onBack() para dentro de um useEffect.
  // Isso garante que a atualização de estado (navigation) ocorra *após* a renderização,
  // e não durante ela, evitando o aviso "Cannot update a component while rendering another".
  React.useEffect(() => {
    if (!customer) {
      onBack();
    }
  }, [customer, onBack]);


  // Guard clause: se customer é undefined, retorna null imediatamente para prevenir
  // que o resto do componente tente acessar customer.name, etc.
  if (!customer) {
    return null;
  }

  // CORREÇÃO: Cria uma versão segura do array. Se installmentSales não for um array, usa um array vazio [].
  const safeInstallmentSales = Array.isArray(installmentSales) ? installmentSales : [];
  
  if (safeInstallmentSales.length === 0 && installmentSales !== undefined) {
    // Log de aviso caso o array seja vazio, mas carregado
    console.log("Nenhuma venda a prazo encontrada para este cliente.");
  }

  // Função auxiliar para calcular o valor restante da venda
  const getRemainingAmount = (sale: InstallmentSale) => {
    const totalPaid = sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalReceived = sale.initialPayment + totalPaid;
    return sale.totalAmount - totalReceived;
  };

  const totalPurchases = safeInstallmentSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  
  // Filtra vendas abertas usando a tolerância MINIMUM_OPEN_AMOUNT
  const openSales = safeInstallmentSales.filter(sale => {
    const remaining = getRemainingAmount(sale);
    return remaining > MINIMUM_OPEN_AMOUNT;
  });

  const totalOpenAmount = openSales.reduce((sum, sale) => {
    // O cálculo da soma agora utiliza o valor já calculado e filtrado no openSales
    const remaining = getRemainingAmount(sale);
    return sum + remaining;
  }, 0);


  const sortedSales = [...safeInstallmentSales].sort((a, b) => {
    const aRemaining = getRemainingAmount(a);
    const bRemaining = getRemainingAmount(b);
    
    // Open sales first (usando a mesma lógica de tolerância)
    if (aRemaining > MINIMUM_OPEN_AMOUNT && bRemaining <= MINIMUM_OPEN_AMOUNT) return -1;
    if (bRemaining > MINIMUM_OPEN_AMOUNT && aRemaining <= MINIMUM_OPEN_AMOUNT) return 1;
    
    // Then by date (newest first)
    return b.date.getTime() - a.date.getTime();
  });

  return (
    <div>
      <Header title="Perfil do Cliente" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Customer Info */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{customer.name}</h1>
                <div className="flex items-center gap-1 text-gray-600">
                  <Phone size={14} />
                  <span className="text-sm">{customer.phone}</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => onNavigate('edit-customer', customer)}
              size="sm"
            >
              Editar
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-600 font-medium">Total em Compras</p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(totalPurchases)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Valor em Aberto</p>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(totalOpenAmount)}
              </p>
            </div>
          </div>
        </Card>

        {/* Purchase History */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">Histórico de Compras</h2>
          </div>

          {safeInstallmentSales.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma compra registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSales.map((sale) => {
                const remainingAmount = getRemainingAmount(sale);
                // Usa a tolerância para definir se está aberto
                const isOpen = remainingAmount > MINIMUM_OPEN_AMOUNT;
                
                return (
                  <div
                    key={sale.id}
                    className={`border rounded-lg p-4 ${
                      isOpen ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {formatDate(sale.date)}
                          </span>
                          {isOpen && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                              Em aberto
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {sale.items.length} {sale.items.length === 1 ? 'produto' : 'produtos'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Entrada: {formatCurrency(sale.initialPayment)} • 
                          {sale.installments}x de {formatCurrency(sale.installmentAmount)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          isOpen ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          {formatCurrency(sale.totalAmount)}
                        </p>
                        {isOpen && (
                          <p className="text-sm text-red-600 font-medium">
                            Restante: {formatCurrency(remainingAmount)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Products */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="space-y-1">
                        {sale.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.quantity}x {item.productName}
                            </span>
                            <span className="text-gray-900 font-medium">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Payment Button for Open Sales */}
                    {isOpen && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onNavigate('payment-modal', { 
                            sale, 
                            previousScreen: 'customer-detail' 
                          })}
                          fullWidth
                        >
                          Registrar Pagamento
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
