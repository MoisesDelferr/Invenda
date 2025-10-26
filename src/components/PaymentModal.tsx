import React, { useState } from 'react';
import { DollarSign, Calendar, X, CheckCircle } from 'lucide-react';

// ===============================================
// MOCKS/DEFINIÇÕES AUTÔNOMAS PARA COMPILAÇÃO
// (Estas substituem as importações externas ausentes)
// ===============================================

// MOCK: Tipos de Dados
interface Payment {
  id: string;
  amount: number;
  date: string; // Espera-se uma string ISO (ex: "2024-01-01")
}

interface InstallmentSale {
  id: string;
  customerName: string;
  totalAmount: number;
  initialPayment: number;
  payments?: Payment[]; // '?' para opcional, pois 'sale.payments' pode ser undefined
}

// MOCK: Funções Utilitárias (dateHelpers)
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  // Garante que o ano só apareça se for diferente do ano atual.
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
  if (date.getFullYear() !== new Date().getFullYear()) {
    options.year = 'numeric';
  }
  return date.toLocaleDateString('pt-BR', options);
};


// MOCK: Componente Card (./UI/Card)
interface CardProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
}
const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={`bg-white p-6 rounded-xl shadow-2xl ${className}`}>{children}</div>
);


// MOCK: Componente Input (./UI/Input)
interface InputProps {
  label: string;
  type: string;
  placeholder: string;
  value: string | number;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  error?: string;
}
const Input: React.FC<InputProps> = ({ label, type, placeholder, value, onChange, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
      {...props}
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// MOCK: Componente Button (./UI/Button)
interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'outline';
  onClick: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}
const Button: React.FC<ButtonProps> = ({ children, variant, onClick, disabled, fullWidth = false }) => {
  const baseStyle = 'px-4 py-2 rounded-lg font-semibold transition-colors shadow-md';
  const style = variant === 'primary' 
    ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50' 
    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${style} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  );
};
// ===============================================
// FIM DOS MOCKS
// ===============================================


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
  // Novo estado para a mensagem de sucesso, substituindo alert()
  const [successMessage, setSuccessMessage] = useState('');
  
  // Cálculo de valores
  const totalPaid = sale.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  // Inclui o pagamento inicial
  const totalReceived = sale.initialPayment + totalPaid; 
  const remainingAmount = sale.totalAmount - totalReceived;

  const handleAddPayment = () => {
    // Limpa erros anteriores
    setError('');

    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setError('Digite um valor válido');
      return;
    }
    
    // Usando Math.round para evitar imprecisão de ponto flutuante na verificação
    const roundedRemaining = Math.round(remainingAmount * 100) / 100;
    const roundedAmount = Math.round(amount * 100) / 100;

    if (roundedAmount > roundedRemaining + 0.01) { // Adiciona uma pequena tolerância
      setError(`Valor não pode ser maior que o restante: ${formatCurrency(remainingAmount)}`);
      return;
    }

    // Chama a função para adicionar o pagamento no backend/estado global
    onAddPayment(sale.id, amount);
    
    // Calcula o novo valor restante após o pagamento (para exibir na mensagem)
    const newRemainingAmount = remainingAmount - amount;

    // Constrói a mensagem de sucesso
    let message = `Pagamento de ${formatCurrency(amount)} registrado com sucesso!`;
    
    // Verifica se o valor restante é igual ou muito próximo de zero
    if (Math.round(newRemainingAmount * 100) / 100 <= 0) {
      message += '\nVenda quitada completamente! 🎉';
    } else {
      message += `\nValor restante: ${formatCurrency(newRemainingAmount)}`;
    }
    
    // Define a mensagem de sucesso e limpa o input
    setSuccessMessage(message);
    setPaymentAmount('');
  };

  const handleCloseModal = () => {
    // Volta para a lista ou fecha o modal
    onBack();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-900">Registrar Pagamento</h2>
          </div>
          <button
            onClick={handleCloseModal}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Mensagem de Sucesso (Substituindo alert()) */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              {successMessage.split('\n').map((line, idx) => (
                <p key={idx} className={`text-emerald-800 text-sm ${idx === 0 ? 'font-semibold' : ''}`}>
                  {line}
                </p>
              ))}
            </div>
            <button 
              onClick={handleCloseModal}
              className="text-emerald-500 hover:text-emerald-700 transition-colors flex-shrink-0"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        )}
        
        {/* Sale Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">{sale.customerName}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Valor total:</span>
              <span className="font-medium">{formatCurrency(sale.totalAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Já pago (Entrada + Parcelas):</span>
              <span className="font-medium text-emerald-700">{formatCurrency(totalReceived)}</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-gray-600 font-bold">Restante a Pagar:</span>
              <span className="font-bold text-red-600">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment Form (só visível se não houver mensagem de sucesso e ainda houver saldo) */}
        {Math.round(remainingAmount * 100) / 100 > 0.01 && !successMessage && (
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
              error={error}
            />

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAddPayment}
                // Desabilita se o valor for inválido ou zero
                disabled={!parseFloat(paymentAmount) || parseFloat(paymentAmount) <= 0}
                fullWidth
              >
                Registrar
              </Button>
            </div>
          </div>
        )}

        {/* Mensagem se o saldo já estiver quitado */}
        {Math.round(remainingAmount * 100) / 100 <= 0.01 && !successMessage && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 shadow-sm flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm font-semibold">
                    Esta venda já está quitada.
                </p>
            </div>
        )}

        {/* Payment History */}
        {sale.payments && sale.payments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Histórico de Pagamentos</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {sale.payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center text-sm p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
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
