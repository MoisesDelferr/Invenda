import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Customer } from '../types';

interface AddCustomerScreenProps {
  onBack: () => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  onSuccess?: (newCustomer: Customer) => void;
  fromInstallmentSale?: boolean;
}

export const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({
  onBack,
  onAddCustomer,
  onSuccess,
  fromInstallmentSale = false
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      setToastMessage('');
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      displayToast('Nome do cliente é obrigatório!');
      return;
    }

    const customer = onAddCustomer({
      name: name.trim(),
      phone: phone.trim()
    });

    if (fromInstallmentSale) {
      displayToast('✅ Cliente cadastrado com sucesso! Retornando para a venda...');
    } else {
      displayToast('✅ Cliente cadastrado com sucesso!');
    }

    setTimeout(() => {
      if (onSuccess) {
        onSuccess(customer);
      } else {
        onBack();
      }
    }, 1000);
  };

  const isFormValid = !!name.trim();

  return (
    <div className="relative">
      {showToast && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50 p-3 bg-emerald-600 text-white font-medium rounded-lg shadow-xl transition-opacity duration-300">
          {toastMessage}
        </div>
      )}

      <Header title="Adicionar Cliente" onBack={onBack} />

      <div className="p-4">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <User className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Novo Cliente</h2>
              <p className="text-gray-600">Preencha os dados do cliente</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Cliente"
              placeholder="Digite o nome completo"
              value={name}
              onChange={setName}
              required
            />

            <Input
              label="Número de Telefone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={setPhone}
            />

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="outline" onClick={onBack} fullWidth>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" icon={Save} disabled={!isFormValid} fullWidth>
                Salvar
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-emerald-700">
              <strong>💡 Dica:</strong> O cliente ficará disponível para vendas parceladas futuras.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
