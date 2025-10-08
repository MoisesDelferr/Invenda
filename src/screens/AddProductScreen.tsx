import React, { useState } from 'react';
import { Package, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Header } from '../components/Layout/Header';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { Product } from '../types';
import { useSubscription } from '../hooks/useSubscription';
import { UpgradeModal } from '../components/UpgradeModal';
import { supabase } from '../lib/supabase';

// ❌ REMOVIDA: A função generateSku foi removida para garantir que o SKU seja gerado apenas no useStorage.

interface AddProductScreenProps {
  onBack: () => void;
  // ✅ CORREÇÃO DE TIPAGEM: Espera dados parciais e retorna uma Promise<Product>
  onAddProduct: (productData: Omit<Product, 'id' | 'sku' | 'createdAt'>) => Promise<Product>;
}

export const AddProductScreen: React.FC<AddProductScreenProps> = ({ onBack, onAddProduct }) => {
  const { checkCanCreateProduct } = useSubscription();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    salePrice: '',
    variation: '',
    stock: ''
  });
  // ✅ NOVO: Estado para controlar a submissão e prevenir cliques duplos/duplicação
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ currentCount: number; limit: number; message: string } | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("Erro de autenticação: usuário não está logado.");
      return;
    }

    // ✅ INÍCIO DA SUBMISSÃO: Desabilita o botão imediatamente
    setIsSubmitting(true);

    try {
      const canCreate = await checkCanCreateProduct();

      if (!canCreate.allowed) {
        setLimitInfo({
          currentCount: canCreate.current_count,
          limit: canCreate.limit || 0,
          message: canCreate.message || 'Limite atingido'
        });
        setShowUpgradeModal(true);
        // O 'finally' cuidará de resetar isSubmitting
        return;
      }

      // --- PREVENÇÃO DE DUPLICAÇÃO ---
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', formData.name)
        .eq('model', formData.model)
        .eq('variation', formData.variation)
        .maybeSingle();

      if (fetchError) {
        console.error('Erro ao verificar produto existente:', fetchError);
        alert('Erro ao verificar produto existente.');
        return;
      }

      if (existingProduct) {
        alert('Este produto já foi cadastrado anteriormente.');
        return;
      }
      // --- FIM DA PREVENÇÃO ---

      // ✅ DADOS DE INSERÇÃO: Objeto simples, sem SKU ou user_id.
      const productToInsert = {
        name: formData.name,
        model: formData.model,
        salePrice: parseFloat(formData.salePrice),
        variation: formData.variation,
        stock: parseInt(formData.stock),
      };

      // ✅ CHAMADA ÚNICA: Usa a função do useStorage e espera o produto retornado (com o SKU correto)
      const product = await onAddProduct(productToInsert);

      // ✅ CONSISTÊNCIA: Alert usa o SKU retornado pelo banco
      alert(`Produto criado com sucesso!\nSKU: ${product.sku}`);
      onBack();
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Erro ao criar produto. Tente novamente.');
    } finally {
      // ✅ FINALIZAÇÃO: Libera o botão, garantindo que só houve uma submissão
      setIsSubmitting(false); 
    }
  };

  const isFormValid =
    formData.name && formData.model && formData.salePrice && formData.variation && formData.stock;

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
                // ✅ ALTERAÇÃO: Desabilita se o formulário for inválido OU estiver submetendo
                disabled={!isFormValid || isSubmitting}
                fullWidth
                size="lg"
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Produto'} 
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

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Limite de Produtos Atingido"
        message={limitInfo?.message || 'Você atingiu o limite de produtos do plano gratuito.'}
        currentCount={limitInfo?.currentCount}
        limit={limitInfo?.limit}
      />
    </div>
  );
};