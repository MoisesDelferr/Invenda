import React, { useState } from 'react';
import { Users, Search, User, Phone } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { SearchBar } from '../components/UI/SearchBar';
import { Customer, InstallmentSale } from '../types';
import { formatCurrency } from '../utils/dateHelpers';

interface CustomersScreenProps {
  customers: Customer[];
  installmentSales: InstallmentSale[];
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export const CustomersScreen: React.FC<CustomersScreenProps> = ({
  customers,
  installmentSales,
  onBack,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCustomerStats = (customerId: string) => {
    const customerSales = installmentSales.filter(sale => sale.customerId === customerId);
    const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const openAmount = customerSales.reduce((sum, sale) => {
      const totalPaid = sale.payments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
      const totalReceived = sale.initialPayment + totalPaid;
      return sum + Math.max(0, sale.totalAmount - totalReceived);
    }, 0);

    return { totalPurchases, openAmount };
  };

  const handleCustomerClick = (customer: Customer) => {
    const customerSales = installmentSales.filter(sale => sale.customerId === customer.id);
    onNavigate('customer-detail', { customer, installmentSales: customerSales });
  };

  return (
    <div>
      <Header title="Clientes" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nome ou telefone..."
        />

        {/* Customers List */}
        <div className="space-y-2">
          {filteredCustomers.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum cliente encontrado</p>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum cliente cadastrado</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Clientes são adicionados automaticamente ao fazer vendas parceladas
                    </p>
                  </>
                )}
              </div>
            </Card>
          ) : (
            filteredCustomers.map((customer) => {
              const stats = getCustomerStats(customer.id);
              
              return (
                <Card
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Phone size={14} />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total em compras</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(stats.totalPurchases)}
                      </p>
                      {stats.openAmount > 0 && (
                        <p className="text-sm text-red-600 font-medium mt-1">
                          Em aberto: {formatCurrency(stats.openAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};