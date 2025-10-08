import React, { useState, useEffect } from 'react';
import { DollarSign, User, Calculator, ShoppingCart, Plus } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Customer, SaleItem, InstallmentSale } from '../types';
import { formatCurrency } from '../utils/dateHelpers';

interface InstallmentSaleScreenProps {
  customers: Customer[];
  saleData?: { items: SaleItem[]; paymentMethod: 'dinheiro' | 'pix' | 'cartao' };
  onBack: () => void;
  onAddInstallmentSale: (saleData: Omit<InstallmentSale, 'id' | 'date' | 'payments'>) => InstallmentSale;
  onNavigate: (screen: string, data?: any) => void;
}

export const InstallmentSaleScreen: React.FC<InstallmentSaleScreenProps> = ({
  customers,
  saleData,
  onBack,
  onAddInstallmentSale,
  onNavigate
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [initialPayment, setInitialPayment] = useState('0');
  const [installments, setInstallments] = useState('2');
  const [showSummary, setShowSummary] = useState(false);

  // Redirect back if saleData is not available
  useEffect(() => {
    if (!saleData || !saleData.items || saleData.items.length === 0) {
      onBack();
    }
  }, [saleData, onBack]);

  // Early return if saleData is not available
  if (!saleData || !saleData.items || saleData.items.length === 0) {
    return null;
  }

  const totalAmount = saleData.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const initialPaymentValue = parseFloat(initialPayment) || 0;
  const remainingAmount = totalAmount - initialPaymentValue;
  const installmentCount = parseInt(installments) || 1;
  const installmentAmount = remainingAmount / installmentCount;

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleRegisterSale = () => {
    if (!selectedCustomerId) {
      alert('Selecione um cliente');
      return;
    }

    if (initialPaymentValue >= totalAmount) {
      alert('O valor inicial deve ser menor que o total da venda');
      return;
    }

    if (installmentCount < 1) {
      alert('Número de parcelas deve ser maior que zero');
      return;
    }

    setShowSummary(true);
  };

  const handleConfirmSale = () => {
    if (!selectedCustomer) return;

    try {
      const installmentSaleData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        items: saleData.items,
        totalAmount,
        initialPayment: initialPaymentValue,
        installments: installmentCount,
        installmentAmount,
        remainingAmount,
        paymentMethod: saleData.paymentMethod
      };

      onAddInstallmentSale(installmentSaleData);
      
      alert(`Venda parcelada registrada com sucesso!\nCliente: ${selectedCustomer.name}\nTotal: ${formatCurrency(totalAmount)}\nEntrada: ${formatCurrency(initialPaymentValue)}\n${installmentCount}x de ${formatCurrency(installmentAmount)}`);
      
      onBack();
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao registrar venda parcelada');
      setShowSummary(false);
    }
  };

  if (showSummary) {
    return (
      <div className="flex flex-col h-screen">
        <Header title="Resumo da Venda Parcelada" onBack={() => setShowSummary(false)} />
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
          {/* Customer Info */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <User className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Cliente</h2>
            </div>
            
            {selectedCustomer && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900">{selectedCustomer.name}</h3>
                <p className="text-emerald-700">{selectedCustomer.phone}</p>
              </div>
            )}
          </Card>

          {/* Products */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Produtos</h2>
            </div>

            <div className="space-y-2">
              {saleData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
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
            </div>
          </Card>

          {/* Payment Summary */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Resumo do Pagamento</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valor total:</span>
                <span className="font-semibold">{formatCurrency(totalAmount)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pagamento inicial:</span>
                <span className="font-semibold">{formatCurrency(initialPaymentValue)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Valor restante:</span>
                <span className="font-semibold">{formatCurrency(remainingAmount)}</span>
              </div>
              
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">Parcelamento:</span>
                <span className="font-semibold text-emerald-600">
                  {installmentCount}x de {formatCurrency(installmentAmount)}
                </span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSummary(false)}
              fullWidth
            >
              Voltar
            </Button>
            <Button
              variant="primary"
              icon={ShoppingCart}
              onClick={handleConfirmSale}
              fullWidth
            >
              Concluir
            </Button>
          </div>
          {/* Aumento do espaço extra para garantir que os botões não sejam cortados */}
          <div className="h-5" /> 
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header title="Parcelamento da Venda" onBack={onBack} />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Total Amount */}
        <Card>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Valor Total da Venda</p>
            <p className="text-3xl font-bold text-emerald-600">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </Card>

        {/* Customer Selection */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Cliente</h2>
            </div>
            <Button
              variant="outline"
              icon={Plus}
             onClick={() => onNavigate('add-customer', { fromInstallmentSale: true })}
              size="sm"
            >
              Novo
            </Button>
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500 mb-4">Nenhum cliente cadastrado</p>
              <Button
                variant="primary"
                icon={Plus}
               onClick={() => onNavigate('add-customer', { fromInstallmentSale: true })}
              >
                Adicionar Primeiro Cliente
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>

              {selectedCustomer && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h3 className="font-semibold text-emerald-900">{selectedCustomer.name}</h3>
                  <p className="text-emerald-700">{selectedCustomer.phone}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Payment Configuration */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Configuração do Pagamento</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Valor do pagamento inicial"
              type="number"
              placeholder="0,00"
              value={initialPayment}
              onChange={setInitialPayment}
              min={0}
              step={0.01}
            />

            <Input
              label="Número de parcelas"
              type="number"
              value={installments}
              onChange={setInstallments}
              min={1}
            />

            {remainingAmount > 0 && installmentCount > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-gray-700">Resumo do Parcelamento</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    Valor restante: {formatCurrency(remainingAmount)}
                  </p>
                  <p className="text-emerald-600 font-semibold">
                    {installmentCount}x de {formatCurrency(installmentAmount)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Button
          variant="primary"
          icon={ShoppingCart}
          onClick={handleRegisterSale}
          disabled={!selectedCustomerId}
          fullWidth
          size="lg"
        >
          Registrar Venda
        </Button>
        {/* Aumento do espaço extra para garantir que o botão não seja cortado */}
        <div className="h-60" /> 
      </div>
    </div>
  );
};