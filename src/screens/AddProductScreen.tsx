import React, { useState } from 'react';
import { Package, Save } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Product } from '../types';

interface AddProductScreenProps {
  onBack: () => void;
  onAddProduct: (product: Omit<Product, 'id' | 'sku' | 'createdAt'>) => Product;
}

export const AddProductScreen: React.FC<AddProductScreenProps> = ({ onBack, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    salePrice: '',
    variation: '',
    stock: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const product = onAddProduct({
      name: formData.name,
      model: formData.model,
      salePrice: parseFloat(formData.salePrice),
      variation: formData.variation,
      stock: parseInt(formData.stock)
    });

    alert(`Produto criado com sucesso!\nSKU: ${product.sku}`);
    onBack();
  };

  const isFormValid = formData.name && formData.model && formData.salePrice && formData.variation && formData.stock;

  return (
    <div>
      <Header title="Novo Produto" onBack={onBack} />
      
      <div className="p-4">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Package className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cadastrar Produto</h2>
              <p className="text-gray-600">Preencha os dados do novo produto</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome do Produto"
              placeholder="Ex: Camiseta, Tênis, Chocolate..."
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              required
            />

            <Input
              label="Modelo"
              placeholder="Ex: Básica, Esportivo, Ao Leite..."
              value={formData.model}
              onChange={(value) => handleInputChange('model', value)}
              required
            />

            <Input
              label="Variação"
              placeholder="Ex: Azul P, Branco 42, 100g..."
              value={formData.variation}
              onChange={(value) => handleInputChange('variation', value)}
              required
            />

            <Input
              label="Preço de Venda"
              type="number"
              placeholder="0,00"
              value={formData.salePrice}
              onChange={(value) => handleInputChange('salePrice', value)}
              min={0}
              step={0.01}
              required
            />

            <Input
              label="Estoque Inicial"
              type="number"
              placeholder="0"
              value={formData.stock}
              onChange={(value) => handleInputChange('stock', value)}
              min={0}
              required
            />

            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                icon={Save}
                disabled={!isFormValid}
                fullWidth
                size="lg"
              >
                Cadastrar Produto
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-700">
              <strong>💡 Dica:</strong> O código SKU será gerado automaticamente após o cadastro.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};