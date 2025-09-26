import React, { useState } from 'react';
import { Package, Plus, Search } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { SearchBar } from '../components/UI/SearchBar';
import { Product } from '../types';
import { formatCurrency } from '../utils/dateHelpers';

interface StockScreenProps {
  products: Product[];
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

export const StockScreen: React.FC<StockScreenProps> = ({ products, onBack, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.variation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Header title="Estoque" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar produtos..."
        />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => onNavigate('add-product')}
            fullWidth
          >
            Novo Produto
          </Button>
          <Button
            variant="secondary"
            icon={Package}
            onClick={() => onNavigate('add-stock')}
            fullWidth
          >
            Adicionar Estoque
          </Button>
        </div>

        {/* Products List */}
        <div className="space-y-2">
          {filteredProducts.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum produto encontrado</p>
                  </>
                ) : (
                  <>
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum produto cadastrado</p>
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => onNavigate('add-product')}
                      className="mt-4"
                    >
                      Cadastrar Primeiro Produto
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ) : (
            filteredProducts.map((product) => (
              <Card
                key={product.id}
                onClick={() => onNavigate('product-detail', product)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {product.name}
                    </h3>
                    <p className="text-gray-600">
                      {product.model} - {product.variation}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};