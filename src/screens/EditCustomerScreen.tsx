import React, { useState } from 'react';
import { User, Save } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Customer } from '../types';

interface EditCustomerScreenProps {
  customer: Customer;
  onBack: () => void;
  onUpdateCustomer: (customerId: string, customerData: Omit<Customer, 'id' | 'createdAt'>) => void;
}

export const EditCustomerScreen: React.FC<EditCustomerScreenProps> = ({
  customer,
  onBack,
  onUpdateCustomer
}) => {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Nome do cliente é obrigatório');
      return;
    }

    if (!phone.trim()) {
      alert('Telefone do cliente é obrigatório');
      return;
    }

    onUpdateCustomer(customer.id, {
      name: name.trim(),
      phone: phone.trim()
    });

    alert('Informações do cliente atualizadas com sucesso!');
    onBack();
  };

  const isFormValid = name.trim() && phone.trim();
  const hasChanges = name.trim() !== customer.name || phone.trim() !== customer.phone;

  return (
    <div>
      <Header title="Editar Cliente" onBack={onBack} />
      
      <div className="p-4">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Informações</h2>
              <p className="text-gray-600">Atualize os dados do cliente</p>
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
              required
            />

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                fullWidth
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                disabled={!isFormValid || !hasChanges}
                fullWidth
              >
                Salvar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};