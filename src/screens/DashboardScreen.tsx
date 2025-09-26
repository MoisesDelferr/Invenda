import React, { useMemo } from 'react';
import { Calendar, DollarSign, Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Sale } from '../types';
import { isToday, isThisWeek, isThisMonth, formatCurrency, formatDate, formatTime } from '../utils/dateHelpers';

interface DashboardScreenProps {
  sales: Sale[];
  onBack: () => void;
  onAddPayment: (saleId: string, amount: number) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ sales, onBack, onAddPayment }) => {
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [paymentAmount, setPaymentAmount] = React.useState('');
  const [selectedSale, setSelectedSale] = React.useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return sales.filter(sale => {
      const saleDate = sale.date;
      return saleDate.getFullYear() === year && saleDate.getMonth() === month - 1;
    });
  }, [sales, selectedMonth]);

  const dashboardData = useMemo(() => {
    const todaySales = filteredSales.filter(sale => isToday(sale.date));
    const weeklySales = filteredSales.filter(sale => isThisWeek(sale.date));
    const monthlySales = filteredSales.filter(sale => isThisMonth(sale.date));
    const openSales = filteredSales.filter(sale => sale.isOpen);
    const totalOpenAmount = openSales.reduce((sum, sale) => {
      const totalPaid = sale.payments.reduce((paidSum, payment) => paidSum + payment.amount, 0);
      return sum + ((sale.openAmount || 0) - totalPaid);
    }, 0);

    return {
      dailyTotal: todaySales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      weeklyTotal: weeklySales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      monthlyTotal: monthlySales.reduce((sum, sale) => sum + sale.totalPrice, 0),
      todaySales: todaySales.sort((a, b) => b.date.getTime() - a.date.getTime()),
      openSales,
      totalOpenAmount
    };
  }, [filteredSales]);

  const handleAddPayment = () => {
    if (selectedSale && paymentAmount) {
      const amount = parseFloat(paymentAmount);
      onAddPayment(selectedSale.id, amount);
      setSelectedSale(null);
      setPaymentAmount('');
    }
  };

  const getRemainingAmount = (sale: Sale) => {
    const totalPaid = sale.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return (sale.openAmount || 0) - totalPaid;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      dinheiro: 'Dinheiro',
      pix: 'PIX',
      cartao: 'Cartão'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const stats = [
    {
      title: 'Vendas Hoje',
      value: formatCurrency(dashboardData.dailyTotal),
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: 'Vendas Semana',
      value: formatCurrency(dashboardData.weeklyTotal),
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Vendas Mês',
      value: formatCurrency(dashboardData.monthlyTotal),
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Itens Vendidos Hoje',
      value: dashboardData.todaySales.reduce((sum, sale) => sum + sale.quantity, 0).toString(),
      icon: Package,
      color: 'text-orange-600'
    },
    {
      title: 'Vendas em Aberto',
      value: dashboardData.openSales.length.toString(),
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Valor em Aberto',
      value: formatCurrency(dashboardData.totalOpenAmount),
      icon: DollarSign,
      color: 'text-red-600'
    }
  ];

  return (
    <div>
      <Header title="Dashboard Vendas" onBack={onBack} />
      
      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <div className="flex justify-center mb-2">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.title}</p>
            </Card>
          ))}
        </div>

        {/* Month Filter */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Filtrar por Mês</h2>
          </div>
          <Input
            type="month"
            value={selectedMonth}
            onChange={setSelectedMonth}
          />
        </Card>

        {/* Payment Modal */}
        {selectedSale && (
          <Card className="border-2 border-orange-300 bg-orange-50">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900">Registrar Pagamento</h2>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900">{selectedSale.productName}</h3>
              <p className="text-sm text-gray-600">
                Valor restante: {formatCurrency(getRemainingAmount(selectedSale))}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Valor recebido"
                type="number"
                placeholder="0,00"
                value={paymentAmount}
                onChange={setPaymentAmount}
                min={0.01}
                step={0.01}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSale(null);
                    setPaymentAmount('');
                  }}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                  fullWidth
                >
                  Registrar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Sales List */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Vendas do Mês ({filteredSales.length})
          </h2>
          
          {filteredSales.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma venda registrada neste mês</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredSales.sort((a, b) => b.date.getTime() - a.date.getTime()).map((sale) => {
                const remainingAmount = getRemainingAmount(sale);
                const isOpenSale = sale.isOpen && remainingAmount > 0;
                
                return (
                <Card 
                  key={sale.id} 
                  className={isOpenSale ? 'bg-orange-50 border-orange-200' : ''}
                  onClick={isOpenSale ? () => setSelectedSale(sale) : undefined}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{sale.productName}</h3>
                        {isOpenSale && <Clock className="h-4 w-4 text-orange-600" />}
                        {!sale.isOpen && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      </div>
                      <p className="text-sm text-gray-600">SKU: {sale.productSku}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(sale.date)} às {formatTime(sale.date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {getPaymentMethodLabel(sale.paymentMethod)}
                      </p>
                      {isOpenSale && (
                        <p className="text-sm text-orange-600 font-medium mt-1">
                          Restante: {formatCurrency(remainingAmount)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${isOpenSale ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {formatCurrency(sale.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {sale.quantity}x {formatCurrency(sale.unitPrice)}
                      </p>
                      {isOpenSale && (
                        <div className="mt-2">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                            Clique para pagar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};