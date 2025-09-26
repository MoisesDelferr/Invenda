import React from 'react';
import { Trash2, Package, AlertTriangle } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Sale } from '../types';
import { isToday, formatTime, formatCurrency } from '../utils/dateHelpers';

interface DeleteSalesScreenProps {
  sales: Sale[];
  onBack: () => void;
  onDeleteSale: (saleId: string) => void;
}

export const DeleteSalesScreen: React.FC<DeleteSalesScreenProps> = ({ 
  sales, 
  onBack, 
  onDeleteSale 
}) => {
  const todaySales = sales.filter(sale => isToday(sale.date))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const handleDeleteSale = (sale: Sale) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir esta venda?\n\n` +
      `Produto: ${sale.productName}\n` +
      `Quantidade: ${sale.quantity}\n` +
      `Valor: ${formatCurrency(sale.totalPrice)}\n\n` +
      `O estoque será automaticamente restaurado.`
    );

    if (confirmDelete) {
      onDeleteSale(sale.id);
      alert('Venda excluída com sucesso!\nEstoque foi restaurado automaticamente.');
    }
  };

  return (
    <div>
      <Header title="Excluir Vendas" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Warning */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
            <h2 className="text-lg font-bold text-gray-900">Atenção</h2>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              Ao excluir uma venda, a quantidade vendida retornará automaticamente ao estoque do produto.
            </p>
          </div>
        </Card>

        {/* Today's Sales */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-bold text-gray-900">Vendas de Hoje</h2>
          </div>

          {todaySales.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma venda registrada hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySales.map((sale) => (
                <div
                  key={sale.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {sale.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        SKU: {sale.productSku}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTime(sale.date)}
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
                  
                  <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => handleDeleteSale(sale)}
                    size="sm"
                    fullWidth
                  >
                    Excluir Venda
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Informações</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Apenas vendas do dia atual podem ser excluídas</p>
            <p>• O estoque é restaurado automaticamente</p>
            <p>• A ação não pode ser desfeita</p>
            <p>• Confirme sempre antes de excluir</p>
          </div>
        </Card>
      </div>
    </div>
  );
};