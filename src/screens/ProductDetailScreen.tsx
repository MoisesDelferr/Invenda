import React, { useState } from 'react';
import { Package, CreditCard as Edit3, Calendar, Clipboard, Trash2, Pencil } from 'lucide-react'; // Adicionado Pencil para o ícone de edição de preço
// Importante: Mantive o CreditCard como Edit3 no import original para não quebrar a edição de estoque.

// ====================================================================
// --- SIMULAÇÃO DE UTILS/COMPONENTS ---
// Esses componentes e funções foram mantidos como placeholders para que o código funcione.
// ====================================================================

const formatCurrency = (value) => `R$ ${value.toFixed(2).replace('.', ',')}`;
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR');

const Card = ({ children }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 transition duration-300 hover:shadow-lg">
    {children}
  </div>
);

const Header = ({ title, onBack }) => (
  <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center shadow-sm z-40">
    <button onClick={onBack} className="text-gray-600 hover:text-gray-900 mr-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
    </button>
    <h1 className="text-xl font-bold">{title}</h1>
  </div>
);

const Input = ({ label, type, value, onChange, min, required, step }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      step={step} // Adicionado step para inputs de float
      required={required}
      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border"
    />
  </div>
);

const Button = ({ children, onClick, variant, icon: Icon, disabled, fullWidth, size, className }) => {
  let baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition duration-150 ease-in-out ';
  
  if (variant === 'primary') {
    baseClasses += 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed';
  } else if (variant === 'outline') {
    baseClasses += 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50';
  }

  // Permite que o className customizado sobrescreva ou adicione estilos, como a cor vermelha.
  baseClasses += ` ${className || ''}`;
  
  if (size === 'sm') {
    baseClasses += ' px-2.5 py-1.5 text-sm';
  } else {
    baseClasses += ' px-4 py-2 text-base';
  }

  if (fullWidth) {
    baseClasses += ' w-full';
  }

  return (
    <button onClick={onClick} className={baseClasses} disabled={disabled}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

const ToastNotification = ({ message }) => {
    if (!message) return null;

    return (
        <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none">
            <div className="bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-xl">
                {message}
            </div>
        </div>
    );
};

// --- NOVO COMPONENTE: MODAL DE CONFIRMAÇÃO ---
const ModalConfirmation = ({ isOpen, title, message, onConfirm, onCancel, confirmText, isDestructive }) => {
  if (!isOpen) return null;

  const confirmClasses = isDestructive
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-emerald-600 text-white hover:bg-emerald-700';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-medium rounded-lg transition duration-150 ease-in-out ${confirmClasses}`}
          >
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
// ---------------------------------------------


// ====================================================================
// --- COMPONENTE PRINCIPAL COM LÓGICA DE EXCLUSÃO ---
// ====================================================================

export const ProductDetailScreen = ({
  product,
  onBack,
  onUpdateStock,
  onDeleteProduct, // Nova prop para a exclusão
  onUpdatePrice // **NOVA PROP PARA ATUALIZAR O PREÇO**
}) => {
  const [newStock, setNewStock] = useState(product.stock.toString());
  const [isEditingStock, setIsEditingStock] = useState(false); // Renomeado para clareza
  const [isEditingPrice, setIsEditingPrice] = useState(false); // **NOVO ESTADO**
  const [newPrice, setNewPrice] = useState(product.salePrice.toFixed(2)); // **NOVO ESTADO**
  const [toast, setToast] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Estado para o modal de exclusão

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 1500);
  };

  const handleCopySku = () => {
    const el = document.createElement('textarea');
    el.value = product.sku;
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand('copy');
      showToast("✅ Código copiado!");
    } catch (err) {
      console.error('Falha ao copiar:', err);
      showToast("❌ Falha ao copiar o código.");
    }
    document.body.removeChild(el);
  };

  const handleUpdateStock = async () => {
    const stockValue = parseInt(newStock);

    if (isNaN(stockValue) || stockValue < 0) {
      showToast("❌ Estoque deve ser um número positivo.");
      return;
    }

    try {
      const stockChange = stockValue - product.stock;
      // Note: onUpdateStock deve ser a função que chama o Supabase para atualizar.
      await onUpdateStock(product.id, stockChange);
      setIsEditingStock(false); // Atualizado
      showToast(`Estoque atualizado para ${stockValue} unidades`);
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast("❌ Erro ao atualizar estoque.");
    }
  };

  // **NOVA FUNÇÃO PARA LIDAR COM A ATUALIZAÇÃO DO PREÇO**
  const handleUpdatePrice = async () => {
    // Substitui vírgula por ponto para garantir que parseFloat funcione corretamente
    const priceString = newPrice.replace(',', '.');
    const priceValue = parseFloat(priceString);

    if (isNaN(priceValue) || priceValue <= 0) {
      showToast("❌ Preço deve ser um valor monetário positivo.");
      return;
    }

    try {
      // Chama a prop que fará a atualização do preço (simulada)
      await onUpdatePrice(product.id, priceValue);
      setIsEditingPrice(false);
      showToast(`Preço de venda atualizado para ${formatCurrency(priceValue)}`);
    } catch (error) {
      console.error('Error updating price:', error);
      showToast("❌ Erro ao atualizar o preço.");
    }
  };
  
  // FUNÇÃO PARA LIDAR COM A EXCLUSÃO
  const handleDeleteProduct = async () => {
    setShowDeleteModal(false); // Fecha o modal imediatamente

    try {
      // Chama a prop que fará a exclusão no Supabase (ex: supabase.from('products').delete().eq('id', product.id);)
      await onDeleteProduct(product.id); 

      showToast("🗑️ Produto excluído com sucesso!");
      
      // Volta para a tela anterior (lista de produtos) após a exclusão bem-sucedida
      setTimeout(onBack, 1000); 

    } catch (error) {
      console.error('Error deleting product:', error);
      showToast("❌ Erro ao excluir o produto. Verifique as dependências.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      
      <Header title="Detalhes do Produto" onBack={onBack} />
      
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        
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
              {/* SKU + botão copiar */}
              <div>
                <p className="text-sm font-medium text-gray-500">Código do Produto</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-900 font-mono">{product.sku}</p>
                  <button
                    onClick={handleCopySku}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition duration-150"
                  >
                    <Clipboard size={16} />
                  </button>
                </div>
              </div>

              {/* Preço de Venda (com edição) */}
              <div>
                <p className="text-sm font-medium text-gray-500">Preço de Venda</p>
                {isEditingPrice ? (
                    <div className="mt-1 space-y-2">
                        <Input
                            label="Novo Preço (R$)"
                            type="number"
                            value={newPrice}
                            onChange={setNewPrice}
                            min={0.01}
                            step={0.01} // Permite valores decimais
                            required
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditingPrice(false);
                                    setNewPrice(product.salePrice.toFixed(2)); // Reseta o valor
                                }}
                                size="sm"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleUpdatePrice}
                                disabled={parseFloat(newPrice.replace(',', '.')) === product.salePrice || isNaN(parseFloat(newPrice.replace(',', '.')))}
                                size="sm"
                            >
                                Salvar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-semibold text-lg">
                            {formatCurrency(product.salePrice)}
                        </p>
                        {/* Ícone do Lápis para Edição de Preço */}
                        <button
                            onClick={() => setIsEditingPrice(true)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition duration-150"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Estoque Atual</p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.stock > 10 ? 'bg-emerald-100 text-emerald-800'
                    : product.stock > 0 ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.stock} unidades
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Cadastrado em</p>
                <p className="text-gray-900 flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" />
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
              onClick={() => setIsEditingStock(!isEditingStock)} // Alterado para isEditingStock
              size="sm"
            >
              {isEditingStock ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {isEditingStock ? ( // Alterado para isEditingStock
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

        {/* NOVO: Botão de Excluir Produto */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-red-600">Excluir Produto</h3>
            <Button
              onClick={() => setShowDeleteModal(true)}
              icon={Trash2}
              className="bg-red-600 text-white hover:bg-red-700" // Cor de exclusão
              size="sm"
            >
              Excluir
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            A exclusão é definitiva. **As vendas associadas não serão afetadas** (desde que a chave estrangeira do Supabase esteja configurada como **`ON DELETE SET NULL`**).
          </p>
        </Card>
        
      </div>

      {/* Toast Notification */}
      <ToastNotification message={toast} />

      {/* Modal de Confirmação para Exclusão */}
      <ModalConfirmation
        isOpen={showDeleteModal}
        title="Confirmação de Exclusão Definitiva"
        message={`Tem certeza que deseja excluir o produto "${product.name}" (SKU: ${product.sku})? Esta ação é **definitiva** e não pode ser desfeita. O histórico de vendas já realizado será preservado.`}
        onConfirm={handleDeleteProduct}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Sim, Excluir Produto"
        isDestructive={true}
      />
    </div>
  );
};


// ====================================================================
// --- App DE EXEMPLO (Para fins de demonstração) ---
// ====================================================================

// Adicionei um componente App para tornar o código executável,
const initialProduct = {
  id: 'P001',
  sku: 'ABC-12345',
  name: 'Teclado Mecânico Pro',
  model: 'K-9000',
  variation: 'Azul',
  salePrice: 450.99,
  stock: 15,
  createdAt: new Date().toISOString(),
};

const App = () => {
    const [currentProduct, setCurrentProduct] = useState(initialProduct);

    // Função de simulação para atualizar o preço
    const handleUpdatePrice = (productId, newPriceValue) => {
        console.log(`Simulando atualização de PREÇO para ${productId}: R$ ${newPriceValue}`);
        setCurrentProduct(prev => ({ ...prev, salePrice: newPriceValue }));
        return Promise.resolve();
    };

    const handleUpdateStock = (productId, stockChange) => {
        // Lógica real de API/Supabase aqui.
        console.log(`Simulando atualização de estoque para ${productId}`);
        // O valor do novo estoque é calculado dentro do ProductDetailScreen, aqui só precisa ser aplicado.
        setCurrentProduct(prev => ({ ...prev, stock: prev.stock + stockChange }));
        return Promise.resolve();
    };

    const handleDeleteProduct = (productId) => {
      // Lógica real de API/Supabase aqui.
      console.log(`Simulando EXCLUSÃO definitiva do produto: ${productId}`);
      // Em uma aplicação real, você faria uma chamada API e navegaria de volta.
      // Aqui, apenas simulamos o sucesso.
      return Promise.resolve();
    };

    const handleBack = () => {
      alert("Simulando navegação de volta para a lista de produtos.");
      // Em uma aplicação real, você usaria react-router-dom: navigate('/products')
    }

    return (
        <ProductDetailScreen
            product={currentProduct}
            onBack={handleBack}
            onUpdateStock={handleUpdateStock}
            onDeleteProduct={handleDeleteProduct} // Passando a nova função
            onUpdatePrice={handleUpdatePrice} // **PASSANDO A NOVA FUNÇÃO DE PREÇO**
        />
    );
};

export default App;