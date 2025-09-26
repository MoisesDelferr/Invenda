import React, { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { SearchBar } from '../components/UI/SearchBar';
import { Product } from '../types';
import { formatCurrency } from '../utils/dateHelpers';

interface AddStockScreenProps {
  products: Product[];
  onBack: () => void;
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const AddStockScreen: React.FC<AddStockScreenProps> = ({ 
  products, 
  onBack, 
  onUpdateStock 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockToAdd, setStockToAdd] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.variation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddStock = () => {
    if (selectedProduct && stockToAdd) {
      const additionalStock = parseInt(stockToAdd);
      const newTotalStock = selectedProduct.stock + additionalStock;
      
      onUpdateStock(selectedProduct.id, newTotalStock);
      alert(`Estoque atualizado!\nProduto: ${selectedProduct.name}\nEstoque anterior: ${selectedProduct.stock}\nAdicionado: ${additionalStock}\nNovo estoque: ${newTotalStock}`);
      
      setSelectedProduct(null);
      setStockToAdd('');
      setSearchQuery('');
    }
  };

  return (
    <div>
      <Header title="Adicionar Estoque" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {!selectedProduct ? (
          <>
            {/* Search Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-6 w-6 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">Buscar Produto</h2>
              </div>
              
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Digite o nome, modelo ou SKU..."
              />
            </Card>

            {/* Products List */}
            <div className="space-y-2">
              {filteredProducts.length === 0 && searchQuery && (
                <Card>
                  <div className="text-center py-4">
                    <p className="text-gray-500">Nenhum produto encontrado</p>
                  </div>
                </Card>
              )}

              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="text-gray-600">
                        {product.model} - {product.variation}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 10 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock} un.
                      </div>
                      <p className="text-gray-600 mt-1">
                        {formatCurrency(product.salePrice)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Add Stock Form */
          <Card>
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-8 w-8 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Adicionar Estoque</h2>
                <p className="text-gray-600">Produto selecionado</p>
              </div>
            </div>

            {/* Selected Product Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 text-lg">
                {selectedProduct.name}
              </h3>
              <p className="text-gray-600">
                {selectedProduct.model} - {selectedProduct.variation}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                SKU: {selectedProduct.sku}
              </p>
              <p className="text-emerald-600 font-semibold mt-2">
                Estoque atual: {selectedProduct.stock} unidades
              </p>
            </div>

            {/* Stock Input */}
            <div className="space-y-4">
              <Input
                label="Quantidade a Adicionar"
                type="number"
                placeholder="0"
                value={stockToAdd}
                onChange={setStockToAdd}
                min={1}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                  fullWidth
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={handleAddStock}
                  disabled={!stockToAdd || parseInt(stockToAdd) <= 0}
                  fullWidth
                >
                  Adicionar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};