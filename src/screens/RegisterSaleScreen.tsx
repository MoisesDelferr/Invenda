import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, DollarSign, CreditCard, Package, Trash2 } from 'lucide-react';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Product, SaleItem } from '../types';
import { formatCurrency } from '../utils/dateHelpers';

interface RegisterSaleScreenProps {
  products: Product[];
  onBack: () => void;
  onAddSale: (items: SaleItem[], paymentMethod: 'dinheiro' | 'pix' | 'cartao') => any;
  onNavigate: (screen: string, data?: any) => void;
  getProductBySKU: (sku: string) => Product | undefined;
}

export const RegisterSaleScreen: React.FC<RegisterSaleScreenProps> = ({ 
  products, 
  onBack, 
  onAddSale,
  onNavigate,
  getProductBySKU 
}) => {
  const [skuInput, setSkuInput] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [salePrice, setSalePrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'pix' | 'cartao'>('dinheiro');
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState('');

  // Auto search product when SKU changes
  useEffect(() => {
    if (skuInput.trim().length >= 3) {
      const product = getProductBySKU(skuInput.trim());
      if (product) {
        setSelectedProduct(product);
        setSalePrice(product.salePrice.toString());
        setError('');
      } else {
        setSelectedProduct(null);
        setSalePrice('');
        if (skuInput.trim().length >= 5) {
          setError('Produto não encontrado');
        }
      }
    } else {
      setSelectedProduct(null);
      setSalePrice('');
      setError('');
    }
  }, [skuInput, getProductBySKU]);

  const handleAddMoreProducts = () => {
    if (!selectedProduct) {
      setError('Selecione um produto');
      return;
    }

    const saleQuantity = parseInt(quantity);
    const unitPrice = parseFloat(salePrice);

    if (saleQuantity <= 0) {
      setError('Quantidade deve ser maior que zero');
      return;
    }

    if (saleQuantity > selectedProduct.stock) {
      setError(`Estoque insuficiente. Disponível: ${selectedProduct.stock}`);
      return;
    }

    if (unitPrice <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    const newItem: SaleItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      quantity: saleQuantity,
      unitPrice: unitPrice,
      totalPrice: saleQuantity * unitPrice
    };

    setSaleItems(prev => [...prev, newItem]);
    
    // Clear form
    setSkuInput('');
    setSelectedProduct(null);
    setQuantity('1');
    setSalePrice('');
    setError('');
  };

  const handleRemoveItem = (index: number) => {
    setSaleItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleRegisterSale = () => {
    if (saleItems.length === 0) {
      setError('Adicione pelo menos um produto à venda');
      return;
    }
    setShowSummary(true);
  };

  const handleConfirmSale = () => {
    try {
      onAddSale(saleItems, paymentMethod);
      
      const totalValue = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);
      alert(`Venda registrada com sucesso!\nTotal: ${formatCurrency(totalValue)}\nPagamento: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}`);
      
      // Reset form
      setSaleItems([]);
      setShowSummary(false);
      setPaymentMethod('dinheiro');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar venda');
      setShowSummary(false);
    }
  };

  const handleInstallmentSale = () => {
    if (saleItems.length === 0) {
      setError('Adicione pelo menos um produto à venda');
      return;
    }
    
    const saleData = {
      items: saleItems,
      paymentMethod
    };
    
    onNavigate('installment-sale', saleData);
  };

  const totalAmount = saleItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (showSummary) {
    return (
      <div>
        <Header title="Resumo da Venda" onBack={() => setShowSummary(false)} />
        
        <div className="p-4 space-y-4">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Produtos da Venda</h2>
            </div>

            <div className="space-y-3">
              {saleItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">
                        {formatCurrency(item.totalPrice)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.quantity}x {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Forma de Pagamento</h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'dinheiro', label: 'Dinheiro', icon: DollarSign },
                { value: 'pix', label: 'PIX', icon: ShoppingCart },
                { value: 'cartao', label: 'Cartão', icon: CreditCard }
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-2 ${
                    paymentMethod === method.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <method.icon size={20} />
                  <span className="text-sm font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSummary(false)}
              fullWidth
            >
              Voltar
            </Button>
            <Button
              variant="primary"
              icon={ShoppingCart}
              onClick={handleConfirmSale}
              fullWidth
            >
              Concluir Venda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Registrar Venda" onBack={onBack} />
      
      <div className="p-4 space-y-4">
        {/* SKU Input */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Código do Produto</h2>
          </div>

          <Input
            label="SKU"
            placeholder="Digite o código SKU..."
            value={skuInput}
            onChange={setSkuInput}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </Card>

        {/* Product Found */}
        {selectedProduct && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Produto Encontrado</h2>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-emerald-900 text-lg">
                {selectedProduct.name}
              </h3>
              <p className="text-emerald-700">
                {selectedProduct.model} - {selectedProduct.variation}
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                SKU: {selectedProduct.sku}
              </p>
              <div className="flex justify-between items-center mt-3">
                <p className="text-emerald-700">
                  <strong>Preço:</strong> {formatCurrency(selectedProduct.salePrice)}
                </p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedProduct.stock > 10 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  Estoque: {selectedProduct.stock} un.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="Quantidade"
                type="number"
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={selectedProduct.stock}
              />

              <Input
                label="Preço Unitário"
                type="number"
                value={salePrice}
                onChange={setSalePrice}
                min={0}
                step={0.01}
              />

              <Button
                variant="primary"
                icon={Plus}
                onClick={handleAddMoreProducts}
                disabled={!quantity || !salePrice || parseInt(quantity) <= 0 || parseFloat(salePrice) <= 0}
                fullWidth
              >
                Adicionar produto
              </Button>
            </div>
          </Card>
        )}

        {/* Sale Items */}
        {saleItems.length > 0 && (
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <ShoppingCart className="h-6 w-6 text-emerald-600" />
              <h2 className="text-lg font-bold text-gray-900">Produtos Adicionados</h2>
            </div>

            <div className="space-y-2">
              {saleItems.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.productSku}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">
                          {formatCurrency(item.totalPrice)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  icon={ShoppingCart}
                  onClick={handleRegisterSale}
                  fullWidth
                >
                  Registrar Venda
                </Button>
                
                <Button
                  variant="secondary"
                  icon={DollarSign}
                  onClick={handleInstallmentSale}
                  fullWidth
                >
                  Venda Parcelada
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Tips */}
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">💡 Dicas Rápidas</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Digite o código SKU para encontrar o produto automaticamente</p>
            <p>• Adicione quantos produtos quiser à mesma venda</p>
            <p>• O valor total é calculado automaticamente</p>
            <p>• Escolha entre venda normal ou parcelada</p>
          </div>
        </Card>
      </div>
    </div>
  );
};