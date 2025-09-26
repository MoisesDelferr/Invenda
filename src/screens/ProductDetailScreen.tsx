import React, { useState } from 'react';
import { Package, Edit3, Calendar } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Product } from '../types';
import { formatCurrency, formatDate } from '../utils/dateHelpers';

interface ProductDetailScreenProps {
  product: Product;
  onBack: () => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ 
  product, 
  onBack, 
  onUpdateStock 
}) => {
  const [newStock, setNewStock] = useState(product.stock.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateStock = () => {
    const stockValue = parseInt(newStock);
    onUpdateStock(product.id, stockValue);
    setIsEditing(false);
    alert(`Estoque atualizado para ${stockValue} unidades`);
  };

  return (
    <div>
      <Header title="Detalhes do Produto" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Product Info */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-emerald-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-gray-600">{product.model} - {product.variation}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">SKU</p>
                <p className="text-gray-900 font-mono">{product.sku}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Preço de Venda</p>
                <p className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(product.salePrice)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Estoque Atual</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : product.stock > 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock} unidades
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cadastrado em</p>
                <p className="text-gray-900 flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(product.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Update Stock */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Atualizar Estoque</h2>
            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => setIsEditing(!isEditing)}
              size="sm"
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Nova Quantidade em Estoque"
                type="number"
                value={newStock}
                onChange={setNewStock}
                min={0}
                required
              />
              <Button
                variant="primary"
                onClick={handleUpdateStock}
                disabled={newStock === product.stock.toString()}
                fullWidth
              >
                Atualizar Estoque
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">
                Clique em "Editar" para atualizar o estoque
              </p>
            </div>
          )}
        </Card>

        {/* Stock Status */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-2">Status do Estoque</h3>
          {product.stock === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">⚠️ Produto sem estoque</p>
              <p className="text-red-600 text-sm mt-1">
                Este produto não pode ser vendido até que o estoque seja reposto.
              </p>
            </div>
          )}
          {product.stock > 0 && product.stock <= 10 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 font-medium">⚠️ Estoque baixo</p>
              <p className="text-yellow-600 text-sm mt-1">
                Considere repor o estoque deste produto.
              </p>
            </div>
          )}
          {product.stock > 10 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-800 font-medium">✅ Estoque adequado</p>
              <p className="text-emerald-600 text-sm mt-1">
                Produto disponível para venda.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};