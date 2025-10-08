import React, { useState } from 'react';
import { DollarSign, Calendar, X } from 'lucide-react';
import { Card } from './UI/Card';
import { Input } from './UI/Input';
import { Button } from './UI/Button';
import { InstallmentSale } from '../types';
import { formatCurrency, formatDate } from '../utils/dateHelpers';

interface PaymentModalProps {
  sale: InstallmentSale;
  onBack: () => void;
  onAddPayment: (saleId: string, amount: number) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  sale,
  onBack,
  onAddPayment
}) => {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState('');

  const totalPaid = sale.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const totalReceived = sale.initialPayment + totalPaid;
  const remainingAmount = sale.totalAmount - totalReceived;

  const handleAddPayment = () => {
    const amount = parseFloat(paymentAmount);
    
    if (!amount || amount <= 0) {
      setError('Digite um valor válido');
      return;
    }
    
    if (amount > remainingAmount) {
      setError(`Valor não pode ser maior que ${formatCurrency(remainingAmount)}`);
      return;
    }

    onAddPayment(sale.id, amount);
    
    const newRemainingAmount = remainingAmount - amount;
    if (newRemainingAmount <= 0.01) {
      alert(`Pagamento de ${formatCurrency(amount)} registrado com sucesso!\nVenda quitada completamente! 🎉`);
    } else {
      alert(`Pagamento de ${formatCurrency(amount)} registrado com sucesso!\nValor restante: ${formatCurrency(newRemainingAmount)}`);
    }
    
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Registrar Pagamento</h2>
          </div>
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Sale Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{sale.customerName}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor total:</span>
              <span className="font-medium">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Já pago:</span>
              <span className="font-medium">{formatCurrency(totalReceived)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-gray-600">Restante:</span>
              <span className="font-bold text-red-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="space-y-4">
          <Input
            label="Valor do Pagamento"
            type="number"
            placeholder="0,00"
            value={paymentAmount}
            onChange={setPaymentAmount}
            min={0}
            max={remainingAmount}
            step={0.01}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleAddPayment}
              disabled={!paymentAmount}
              fullWidth
            >
              Registrar
            </Button>
          </div>
        </div>

        {/* Payment History */}
        {sale.payments && sale.payments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Histórico de Pagamentos</h4>
            <div className="space-y-2">
              {sale.payments.map((payment, index) => (
                <div key={payment.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-600">
                      {formatDate(payment.date)}
                    </span>
                  </div>
                  <span className="font-medium text-emerald-600">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};