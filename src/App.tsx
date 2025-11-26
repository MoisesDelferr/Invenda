Entendido. Você tem um aplicativo React que atualmente gerencia as telas (rotas) usando o estado local (`currentScreen` e `setCurrentScreen`) e `switch` statements, o que não funciona corretamente com a navegação direta por URL, como no caso do `/reset-password` enviado pelo Supabase.

Vou implementar o `react-router-dom` no seu arquivo `app.tsx`, mantendo a lógica de carregamento e autenticação o mais intacta possível, mas substituindo o gerenciamento de estado das telas (`currentScreen`) pelo roteador.

Aqui está o código completo com as modificações necessárias para usar o `react-router-dom`:

```tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from './hooks/useAuth';
import { useStorage } from './hooks/useStorage';

import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './screens/auth/ResetPasswordScreen';

import { MainLayout } from './components/Layout/MainLayout';

import { HomeScreen } from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import { StockScreen } from './screens/StockScreen';
import { AddProductScreen } from './screens/AddProductScreen';
import { AddStockScreen } from './screens/AddStockScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { RegisterSaleScreen } from './screens/RegisterSaleScreen';
import { InstallmentSaleScreen } from './screens/InstallmentSaleScreen';
import { AddCustomerScreen } from './screens/AddCustomerScreen';
import { DeleteSalesScreen } from './screens/DeleteSalesScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { CustomerDetailScreen } from './screens/CustomerDetailScreen';
import { EditCustomerScreen } from './screens/EditCustomerScreen';
import { SaleDetailScreen } from './screens/SaleDetailScreen';
import { BottomNavigation } from './components/Layout/BottomNavigation';
import { PaymentModal } from './components/PaymentModal';
import { OpenSalesListScreen } from './screens/OpenSalesListScreen';
import { AccountPlanScreen } from './screens/AccountPlanScreen';

import { Menu } from 'lucide-react';
import { ConfigScreen } from './screens/SettingsScreen';

// ⚠️ ATENÇÃO: A interface Screen e a prop initialScreen não são mais usadas
// diretamente para roteamento, mas mantidas por compatibilidade se outras partes
// do código as utilizarem. No entanto, o roteamento principal agora é feito por URL.

type Screen =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'reset-password'
  | 'home'
  | 'dashboard'
  | 'stock'
  | 'add-product'
  | 'add-stock'
  | 'product-detail'
  | 'register-sale'
  | 'installment-sale'
  | 'add-customer'
  | 'delete-sales'
  | 'customers'
  | 'customer-detail'
  | 'edit-customer'
  | 'sale-detail'
  | 'payment-modal'
  | 'open-sales-list'
  | 'account-plan'
  | 'config';

interface AppProps {
  initialScreen?: Screen;
}

// -------------------------------------------------------------------------
// 💡 Componente de Roteamento Principal (InternalRouter)
// -------------------------------------------------------------------------
// Componente Wrapper para usar hooks do router (useNavigate, useLocation)
// que só podem ser usados dentro do <Router>.
function InternalRouter() {
  const { user, loading: authLoading } = useAuth();
  const {
    products,
    sales,
    customers,
    installmentSales,
    loading: dataLoading,
    addProduct,
    updateProductStock,
    updateProductPrice,
    addMultipleItemsSale,
    addInstallmentSale,
    addCustomer,
    updateCustomer,
    addPaymentToSale,
    deleteSale,
    getProductBySKU,
    deleteProduct,
  } = useStorage();

  // O estado 'currentScreen' será substituído por 'useLocation().pathname' e 'useNavigate'
  // No entanto, para manter a lógica de screenData/handleNavigate para dados complexos:
  const [screenData, setScreenData] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // A partir de agora, o 'currentScreen' será inferido pela URL
  const currentPath = location.pathname.substring(1) as Screen | string; // Ex: /home -> home

  // Função handleNavigate atualizada para usar o `Maps` do react-router-dom
  const handleNavigate = (screen: Screen, data?: any) => {
    // Para navegação, o 'screen' agora é o caminho da URL
    navigate(`/${screen}`);
    // Mantém screenData para passar dados complexos entre rotas (embora não seja o ideal, mantém a lógica original)
    setScreenData(data);
  };
  
  const handleGoHome = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
    setScreenData(null);
  };

  // CORREÇÃO ESSENCIAL PARA O MENU: Sincroniza a tela após o login/carregamento de autenticação
  useEffect(() => {
    const authScreens = ['/login', '/register', '/forgot-password', '/reset-password'];
    // Se o carregamento terminou E o usuário está logado, mas está em uma rota de autenticação,
    // navega para '/home'.
    if (!authLoading && user && authScreens.includes(location.pathname)) {
      navigate('/home', { replace: true });
    }
    // Se o carregamento terminou E o usuário NÃO está logado, mas NÃO está em uma rota auth/reset-password,
    // navega para '/login'.
    else if (!authLoading && !user && !authScreens.includes(location.pathname) && location.pathname !== '/') {
        // Redireciona tudo que não for auth para login, exceto se for o reset-password vindo do email.
        // O Supabase envia o token para a URL, e o ResetPasswordScreen precisa ser carregado.
        if (!location.pathname.startsWith('/reset-password')) {
            navigate('/login', { replace: true });
        }
    }
  }, [authLoading, user, location.pathname, navigate]);


  // Loading
  if (authLoading || (user && dataLoading)) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // O bloco de renderização de telas foi movido para dentro do <Routes>

  // Os paths que precisam do BottomNavigation e do botão de Menu
  const isAuthScreen = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isConfigScreen = location.pathname === '/config';
  const isPaymentModal = location.pathname === '/payment-modal';

  return (
    <MainLayout>
      {/* Menu button */}
      {!isConfigScreen && user && ( // Adicionado 'user' para só mostrar se estiver logado
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => handleNavigate('config')}
            className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      )}

      <div
        className={
          user && !isAuthScreen && !isConfigScreen && !isPaymentModal
            ? 'pb-14' // ⬅️ Tente 'pb-14' (56px). Se ainda sobrepor, use 'pb-16' (64px).
            : ''
        }
      >
        <Routes>
          {/* ------------------------------------------------------------------ */}
          {/* 🔑 ROTAS DE AUTENTICAÇÃO (Sempre acessíveis, mas redirecionam se logado) */}
          {/* O componente AuthWrapper acima lida com o redirecionamento se o usuário estiver logado. */}
          {/* ------------------------------------------------------------------ */}
          <Route path="/" element={<LoginScreen onNavigate={handleNavigate} />} />
          <Route path="/login" element={<LoginScreen onNavigate={handleNavigate} />} />
          <Route path="/register" element={<RegisterScreen onNavigate={handleNavigate} />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen onNavigate={handleNavigate} />} />
          
          {/* 🎯 ROTA ESSENCIAL: /reset-password, que é acessada diretamente pelo link do Supabase */}
          <Route path="/reset-password" element={<ResetPasswordScreen onNavigate={handleNavigate} />} />
          
          {/* ------------------------------------------------------------------ */}
          {/* 🏠 ROTAS PRINCIPAIS (Protegidas pelo useEffect acima) */}
          {/* ------------------------------------------------------------------ */}
          
          <Route path="/home" element={<HomeScreen onNavigate={handleNavigate} />} />
          <Route path="/dashboard" element={
            <DashboardScreen
              sales={sales}
              installmentSales={installmentSales}
              onBack={handleGoHome}
              onViewSale={(sale) => handleNavigate('sale-detail', sale)}
              onViewInstallmentSale={(sale) => {
                const customer = customers.find((c) => c.id === sale.customerId);
                const customerInstallmentSales = installmentSales.filter((s) => s.customerId === sale.customerId);
                handleNavigate('customer-detail', { customer, installmentSales: customerInstallmentSales });
              }}
              onAddPayment={addPaymentToSale}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="/stock" element={
            <StockScreen
              products={products}
              onBack={handleGoHome}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="/add-product" element={
            <AddProductScreen
              onBack={() => handleNavigate('stock')}
              onAddProduct={addProduct}
            />
          } />
          <Route path="/add-stock" element={
            <AddStockScreen
              products={products}
              onBack={() => handleNavigate('stock')}
              onUpdateStock={updateProductStock}
            />
          } />
          <Route path="/product-detail" element={
            <ProductDetailScreen
              product={screenData} // Usa screenData
              onBack={() => handleNavigate('stock')}
              onUpdateStock={updateProductStock}
              onDeleteProduct={deleteProduct}
              onUpdatePrice={updateProductPrice}
            />
          } />
          <Route path="/register-sale" element={
            <RegisterSaleScreen
              products={products}
              onBack={handleGoHome}
              onAddSale={addMultipleItemsSale}
              onNavigate={handleNavigate}
              getProductBySKU={getProductBySKU}
            />
          } />
          <Route path="/installment-sale" element={
            <InstallmentSaleScreen
              customers={customers}
              saleData={screenData} // Usa screenData
              onBack={() => handleNavigate('register-sale')}
              onAddInstallmentSale={addInstallmentSale}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="/add-customer" element={
            <AddCustomerScreen
              onBack={() => {
                if (screenData?.fromInstallmentSale) {
                  // volta para parcelamento preservando os dados da venda
                  handleNavigate('installment-sale', screenData.saleData);
                } else {
                  handleNavigate('customers');
                }
              }}
              onAddCustomer={addCustomer}
              onSuccess={(newCustomer: Customer) => {
                if (screenData?.onSuccess) {
                  screenData.onSuccess(newCustomer); // devolve o cliente criado
                }
                if (screenData?.fromInstallmentSale) {
                  // volta para parcelamento preservando os dados da venda
                  handleNavigate('installment-sale', screenData.saleData);
                } else {
                  handleNavigate('customers');
                }
              }}
              fromInstallmentSale={screenData?.fromInstallmentSale}
            />
          } />
          <Route path="/delete-sales" element={
            <DeleteSalesScreen
              sales={sales}
              onBack={handleGoHome}
              onDeleteSale={deleteSale}
            />
          } />
          <Route path="/customers" element={
            <CustomersScreen
              customers={customers}
              installmentSales={installmentSales}
              onBack={handleGoHome}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="/customer-detail" element={
            <CustomerDetailScreen
              customer={screenData.customer} // Usa screenData
              installmentSales={screenData.installmentSales} // Usa screenData
              onBack={() => handleNavigate('customers')}
              onNavigate={handleNavigate}
              onAddPayment={addPaymentToSale}
            />
          } />
          <Route path="/edit-customer" element={
            <EditCustomerScreen
              customer={screenData} // Usa screenData
              onBack={() => {
                const customerInstallmentSales = installmentSales.filter((s) => s.customerId === screenData.id);
                handleNavigate('customer-detail', { customer: screenData, installmentSales: customerInstallmentSales });
              }}
              onUpdateCustomer={updateCustomer}
            />
          } />
          <Route path="/sale-detail" element={
            <SaleDetailScreen
              sale={screenData} // Usa screenData
              onBack={() => {
                const previousScreen = screenData.previousScreen || 'dashboard';
                handleNavigate(previousScreen as Screen);
              }}
            />
          } />
          <Route path="/payment-modal" element={
            <PaymentModal
              sale={screenData.sale} // Usa screenData
              onBack={() => handleNavigate(screenData.previousScreen || 'dashboard')}
              onAddPayment={addPaymentToSale}
            />
          } />
          <Route path="/open-sales-list" element={
            <OpenSalesListScreen
              installmentSales={installmentSales}
              onBack={() => handleNavigate('dashboard')}
              onNavigate={handleNavigate}
              onAddPayment={addPaymentToSale}
            />
          } />
          <Route path="/account-plan" element={
            <AccountPlanScreen />
          } />
          <Route path="/config" element={
            <ConfigScreen
              user={user}
              onBack={handleGoHome}
              onNavigate={handleNavigate}
            />
          } />
          
          {/* Rota 404/Fallback (Se nenhuma rota acima corresponder, tenta ir para Home) */}
          <Route path="*" element={user ? <HomeScreen onNavigate={handleNavigate} /> : <LoginScreen onNavigate={handleNavigate} />} />
        
        </Routes>
      </div>

      {/* Bottom Navigation */}
      {user && !isAuthScreen && !isConfigScreen && !isPaymentModal && (
        <BottomNavigation
          currentScreen={currentPath as Screen} // Agora usa o caminho da URL como screen atual
          onNavigate={handleNavigate}
        />
      )}
    </MainLayout>
  );
}

// -------------------------------------------------------------------------
// 🚀 Componente App (Apenas para envolver com o <Router>)
// -------------------------------------------------------------------------
function App({ initialScreen }: AppProps) {
    // ⚠️ ATENÇÃO: initialScreen foi mantido, mas não é mais usado na lógica de roteamento interna.
    // O roteamento agora é feito pelo <InternalRouter> dentro do <Router>.
    return (
        <Router>
            <InternalRouter />
        </Router>
    );
}

export default App;
