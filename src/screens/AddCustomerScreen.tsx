import React, { useState } from 'react';
import { User, Save, Phone } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Customer } from '../types';

interface AddCustomerScreenProps {
  onBack: () => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
}

export const AddCustomerScreen: React.FC<AddCustomerScreenProps> = ({
  onBack,
  onAddCustomer
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

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

    const customer = onAddCustomer({
      name: name.trim(),
      phone: phone.trim()
    });

    alert(`Cliente cadastrado com sucesso!\nNome: ${customer.name}\nTelefone: ${customer.phone}`);
    onBack();
  };

  const isFormValid = name.trim() && phone.trim();

  return (
    <div>
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
                disabled={!isFormValid}
                fullWidth
              >
                Salvar
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-700">
              <strong>💡 Dica:</strong> O cliente ficará disponível para vendas parceladas futuras.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};