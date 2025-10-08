import React, { useState, useMemo } from 'react';
import { ArrowLeft, Calendar, DollarSign, TrendingUp, Eye, AlertCircle, Filter, Package, ShoppingCart, Crown } from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Sale, InstallmentSale } from '../types';
import { formatDate, formatCurrency } from '../utils/dateHelpers';
import { useSubscription } from '../hooks/useSubscription';

interface DashboardScreenProps {
  sales: Sale[];
  installmentSales: InstallmentSale[];
  onBack: () => void;
  onViewSale: (sale: Sale) => void;
  onViewInstallmentSale: (sale: InstallmentSale) => void;
  onAddPayment: (saleId: string) => void;
  onNavigate: (screen: string, data?: any) => void;
}

export default function DashboardScreen({
  sales,
  installmentSales,
  onBack,
  onViewSale,
  onViewInstallmentSale,
  onAddPayment,
  onNavigate
}: DashboardScreenProps) {
  const { usageStats } = useSubscription();
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Combine and sort all sales
const allSales = useMemo(() => {
  // Group normal sales by date and payment method (assuming they're part of the same transaction)
  const salesByTransaction = new Map();
  
  sales.forEach(sale => {
    // Create a transaction key based on date (rounded to minute) and payment method
    const transactionKey = `${sale.date.toISOString().slice(0, 16)}-${sale.paymentMethod}`;
    
    if (!salesByTransaction.has(transactionKey)) {
      salesByTransaction.set(transactionKey, {
        id: sale.id, // Use first sale's ID as transaction ID
        date: sale.date,
        paymentMethod: sale.paymentMethod,
        isOpen: sale.isOpen,
        type: 'normal' as const,
        items: [],
        totalPrice: 0
      });
    }
    
    const transaction = salesByTransaction.get(transactionKey);
    transaction.items.push({
      productId: sale.productId,
      productName: sale.productName,
      productSku: sale.productSku,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice,
      totalPrice: sale.totalPrice
    });
    transaction.totalPrice += sale.totalPrice;
  });
  
  const groupedNormalSales = Array.from(salesByTransaction.values());

  // Installment sales remain as they are
  const groupedInstallmentSales = installmentSales.map(sale => ({
    ...sale,
    type: 'installment' as const,
  }));

  // Combine and sort
  const combinedSales = [...groupedNormalSales, ...groupedInstallmentSales];
  return combinedSales.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}, [sales, installmentSales]);

  // Filter sales based on selected period
  const filteredSales = useMemo(() => {
    if (filter === 'all') return allSales;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      if (filter === 'today') {
        return saleDate >= today;
      } else if (filter === 'week') {
        return saleDate >= weekAgo;
      } else if (filter === 'month') {
        return saleDate.getMonth() === selectedMonth && saleDate.getFullYear() === selectedYear;
      }
      return true;
    });
  }, [allSales, filter, selectedMonth, selectedYear]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => {
      if (sale.type === 'normal') {
        return sum + sale.totalPrice;
      } else {
        // For installment sales, count total value
        return sum + sale.totalAmount;
      }
    }, 0);

    const totalSales = filteredSales.length;
    
    // Calculate pending amount from ALL installment sales (not just filtered ones)
    const pendingAmount = installmentSales.reduce((sum, sale) => {
      const totalPaid = sale.payments?.reduce((paidSum, payment) => paidSum + payment.amount, 0) || 0;
      const totalReceived = sale.initialPayment + totalPaid;
      const remaining = sale.totalAmount - totalReceived;
      return sum + Math.max(0, remaining);
    }, 0);

    return { totalRevenue, totalSales, pendingAmount };
  }, [filteredSales, installmentSales]);

  const getRemainingAmount = (sale: InstallmentSale) => {
    const totalPaid = sale.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    const totalReceived = sale.initialPayment + totalPaid;
    return sale.totalAmount - totalReceived;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Dashboard de Vendas</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Usage Stats Banner */}
        {usageStats && !usageStats.is_premium && (
          <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Uso do Plano Gratuito</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('account-plan')}
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
              >
                Ver Detalhes
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Package className="w-4 h-4" />
                  <span>Produtos: {usageStats.products.count} / {usageStats.products.limit}</span>
                </div>
                {usageStats.products.limit && (
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        usageStats.products.percentage >= 100
                          ? 'bg-red-500'
                          : usageStats.products.percentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(usageStats.products.percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <ShoppingCart className="w-4 h-4" />
                  <span>Vendas: {usageStats.sales.count} / {usageStats.sales.limit}</span>
                </div>
                {usageStats.sales.limit && (
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        usageStats.sales.percentage >= 100
                          ? 'bg-red-500'
                          : usageStats.sales.percentage >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(usageStats.sales.percentage, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'today' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('today')}
          >
            Hoje
          </Button>
          <Button
            variant={filter === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('week')}
          >
            Esta Semana
          </Button>
          <Button
            variant={filter === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('month')}
          >
            Mês
          </Button>
        </div>
        
        {/* Month/Year Selector */}
        {filter === 'month' && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filtrar por Mês</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2024, i, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Receita Total</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(totals.totalRevenue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total de Vendas</p>
                <p className="text-xl font-bold text-gray-900">{totals.totalSales}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div 
                className="p-2 bg-orange-100 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors"
                onClick={() => onNavigate('open-sales-list')}
              >
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Valores em Aberto</p>
                <p 
                  className="text-xl font-bold text-orange-600 cursor-pointer hover:underline"
                  onClick={() => onNavigate('open-sales-list')}
                >
                  {formatCurrency(totals.pendingAmount)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sales List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Vendas Recentes</h2>
          
          {filteredSales.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda encontrada para o período selecionado</p>
            </Card>
          ) : (
            filteredSales.map((sale) => (
              <Card key={`${sale.type}-${sale.id}`} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.type === 'installment' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {sale.type === 'installment' ? 'Parcelada' : 'À Vista'}
                      </span>
                      {sale.type === 'installment' && getRemainingAmount(sale as InstallmentSale) > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Em Aberto
                        </span>
                      )}
                    </div>
                    
                    <p className="font-semibold text-gray-900">
                      {sale.type === 'normal' 
                        ? formatCurrency(sale.totalPrice)
                        : formatCurrency((sale as InstallmentSale).totalAmount)
                      }
                    </p>
                    
                    <p className="text-sm text-gray-600">
                      {formatDate(sale.date)}
                    </p>
                    
                    {sale.type === 'normal' && sale.items && sale.items.length > 1 && (
                      <p className="text-sm text-gray-600">
                        {sale.items.length} produtos
                      </p>
                    )}
                    
                    {sale.type === 'installment' && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          Cliente: {(sale as InstallmentSale).customerName}
                        </p>
                        {getRemainingAmount(sale as InstallmentSale) > 0.01 && (
                          <p className="text-red-600 font-medium">
                            Restante: {formatCurrency(getRemainingAmount(sale as InstallmentSale))}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (sale.type === 'normal') {
                          // For grouped normal sales, we need to create a compatible Sale object
                          const firstItem = sale.items[0];
                          const compatibleSale: Sale = {
                            id: sale.id,
                            productId: firstItem.productId,
                            productName: firstItem.productName,
                            productSku: firstItem.productSku,
                            quantity: firstItem.quantity,
                            unitPrice: firstItem.unitPrice,
                            totalPrice: sale.totalPrice,
                            paymentMethod: sale.paymentMethod,
                            isOpen: sale.isOpen,
                            payments: sale.payments || [],
                            date: sale.date,
                            // Add items for multi-product display
                            items: sale.items
                          };
                          onViewSale({ ...compatibleSale, previousScreen: 'dashboard' });
                        } else {
                          onViewInstallmentSale(sale as InstallmentSale);
                        }
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {sale.type === 'installment' && getRemainingAmount(sale as InstallmentSale) > 0.01 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onNavigate('payment-modal', { 
                          sale: sale as InstallmentSale, 
                          previousScreen: 'dashboard' 
                        })}
                      >
                        Pagar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}