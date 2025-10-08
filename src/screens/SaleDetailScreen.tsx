import React from 'react';
import { ShoppingBag, Calendar, DollarSign, CreditCard, Package } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Sale } from '../types';
import { formatCurrency, formatDate, formatTime } from '../utils/dateHelpers';

interface SaleDetailScreenProps {
  sale: Sale;
  onBack: () => void;
}

export const SaleDetailScreen: React.FC<SaleDetailScreenProps> = ({
  sale,
  onBack
}) => {
  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      cartao: 'Cartão'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro':
        return DollarSign;
      case 'pix':
        return ShoppingBag;
      case 'cartao':
        return CreditCard;
      default:
        return DollarSign;
    }
  };

  const PaymentIcon = getPaymentMethodIcon(sale.paymentMethod);

  return (
    <div>
      <Header title="Detalhes da Venda" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Sale Summary */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Resumo da Venda</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} />
                <span className="text-sm">
                  {formatDate(sale.date)} às {formatTime(sale.date)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-emerald-700 font-medium">Valor Total</span>
              <span className="text-2xl font-bold text-emerald-800">
                {formatCurrency(sale.totalPrice)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Forma de Pagamento</p>
              <div className="flex items-center gap-2 mt-1">
                <PaymentIcon size={16} className="text-gray-600" />
                <span className="text-gray-900 font-medium">
                  {getPaymentMethodLabel(sale.paymentMethod)}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${
                  sale.isOpen ? 'bg-orange-500' : 'bg-emerald-500'
                }`} />
                <span className={`text-sm font-medium ${
                  sale.isOpen ? 'text-orange-600' : 'text-emerald-600'
                }`}>
                  {sale.isOpen ? 'Em aberto' : 'Pago'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Product Details */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-gray-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {sale.items && sale.items.length > 1 ? 'Produtos Vendidos' : 'Produto Vendido'}
            </h2>
          </div>

          {sale.items && sale.items.length > 1 ? (
            // Multiple products display
            <div className="space-y-3">
              {sale.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        SKU: {item.productSku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity}x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Summary */}
              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total da Venda:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(sale.totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Single product display (original)
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {sale.productName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    SKU: {sale.productSku}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600 text-lg">
                    {formatCurrency(sale.totalPrice)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {sale.quantity}x {formatCurrency(sale.unitPrice)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Payment History (if applicable) */}
        {sale.payments && sale.payments.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">Histórico de Pagamentos</h2>
            </div>

            <div className="space-y-2">
              {sale.payments.map((payment, index) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">
                      Pagamento {index + 1}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(payment.date)} às {formatTime(payment.date)}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};