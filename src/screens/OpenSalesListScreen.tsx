import React from 'react';
import { AlertCircle, DollarSign, Calendar, User } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { InstallmentSale } from '../types';
import { formatCurrency, formatDate } from '../utils/dateHelpers';

interface OpenSalesListScreenProps {
  installmentSales: InstallmentSale[];
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  onAddPayment: (saleId: string, amount: number) => void;
}

export const OpenSalesListScreen: React.FC<OpenSalesListScreenProps> = ({
  installmentSales,
  onBack,
  onNavigate,
  onAddPayment
}) => {
  const getRemainingAmount = (sale: InstallmentSale) => {
    const totalPaid = sale.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const totalReceived = sale.initialPayment + totalPaid;
    return sale.totalAmount - totalReceived;
  };

  const openSales = installmentSales
    .filter(sale => getRemainingAmount(sale) > 0)
    .sort((a, b) => getRemainingAmount(b) - getRemainingAmount(a));

  const totalOpenAmount = openSales.reduce((sum, sale) => sum + getRemainingAmount(sale), 0);

  return (
    <div>
      <Header title="Vendas em Aberto" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Summary */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <h2 className="text-lg font-bold text-gray-900">Resumo</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Total de Vendas</p>
              <p className="text-2xl font-bold text-orange-700">{openSales.length}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(totalOpenAmount)}
              </p>
            </div>
          </div>
        </Card>

        {/* Open Sales List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Vendas Pendentes</h2>
          
          {openSales.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda em aberto</p>
              <p className="text-sm text-gray-400 mt-2">
                Todas as vendas parceladas foram quitadas!
              </p>
            </Card>
          ) : (
            openSales.map((sale) => {
              const remainingAmount = getRemainingAmount(sale);
              
              return (
                <Card key={sale.id} className="p-4 border-l-4 border-l-red-500">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">{sale.customerName}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar size={14} />
                        <span>{formatDate(sale.date)}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {sale.items.length} {sale.items.length === 1 ? 'produto' : 'produtos'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Valor restante</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatCurrency(remainingAmount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        de {formatCurrency(sale.totalAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Products Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="space-y-1">
                      {sale.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {formatCurrency(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                      {sale.items.length > 2 && (
                        <p className="text-xs text-gray-500">
                          +{sale.items.length - 2} produto(s) adicional(is)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso do pagamento</span>
                      <span className="text-gray-900 font-medium">
                        {Math.round(((sale.totalAmount - remainingAmount) / sale.totalAmount) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${((sale.totalAmount - remainingAmount) / sale.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    icon={DollarSign}
                    onClick={() => onNavigate('payment-modal', { 
                      sale, 
                      previousScreen: 'open-sales-list' 
                    })}
                    fullWidth
                  >
                    Registrar Pagamento
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};