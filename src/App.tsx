import React, { useState, useEffect } from 'react';
// IMPORTANTE: Removemos 'BrowserRouter as Router' para não duplicar, mas mantivemos os outros.
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'; 

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

// ⚠️ Se o tipo Customer estiver em outro arquivo, você DEVE importá-lo aqui.
// Exemplo (se for o caso): import { Customer } from './types/Customer';

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
// 💡 Novo Componente Principal 'App'
// Ele assume que já está dentro de um <Router> em 'index.tsx'/'main.tsx'.
// -------------------------------------------------------------------------
function App({ initialScreen }: AppProps) {
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

  const [screenData, setScreenData] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // O estado 'currentScreen' não é mais usado, mas o 'currentPath' sim.
  const currentPath = location.pathname.substring(1) as Screen | string; 

  // Função handleNavigate atualizada para usar o `Maps` do react-router-dom
  const handleNavigate = (screen: Screen, data?: any) => {
    navigate(`/${screen}`);
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
    
    if (!authLoading && user && authScreens.includes(location.pathname)) {
      navigate('/home', { replace: true });
    }
    else if (!authLoading && !user && !authScreens.includes(location.pathname) && location.pathname !== '/') {
        // Redireciona tudo que não for auth para login.
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

  const isAuthScreen = ['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isConfigScreen = location.pathname === '/config';
  const isPaymentModal = location.pathname === '/payment-modal';

  return (
    <MainLayout>
      {/* Menu button */}
      {!isConfigScreen && user && ( 
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
            ? 'pb-14'
            : ''
        }
      >
        <Routes>
          {/* ------------------------------------------------------------------ */}
          {/* 🔑 ROTAS DE AUTENTICAÇÃO */}
          {/* ------------------------------------------------------------------ */}
          <Route path="/" element={<LoginScreen onNavigate={handleNavigate} />} />
          <Route path="/login" element={<LoginScreen onNavigate={handleNavigate} />} />
          <Route path="/register" element={<RegisterScreen onNavigate={handleNavigate} />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen onNavigate={handleNavigate} />} />
          
          {/* 🎯 ROTA DE RESET DE SENHA (Acessada pelo Supabase) */}
          <Route path="/reset-password" element={<ResetPasswordScreen onNavigate={handleNavigate} />} />
          
          {/* ------------------------------------------------------------------ */}
          {/* 🏠 ROTAS PRINCIPAIS */}
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
              product={screenData} 
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
              saleData={screenData} 
              onBack={() => handleNavigate('register-sale')}
              onAddInstallmentSale={addInstallmentSale}
              onNavigate={handleNavigate}
            />
          } />
          <Route path="/add-customer" element={
            <AddCustomerScreen
              onBack={() => {
                if (screenData?.fromInstallmentSale) {
                  handleNavigate('installment-sale', screenData.saleData);
                } else {
                  handleNavigate('customers');
                }
              }}
              // ⚠️ NOTE: Se o tipo Customer não estiver definido, use 'any' aqui
              onAddCustomer={addCustomer}
              onSuccess={(newCustomer: any) => { 
                if (screenData?.onSuccess) {
                  screenData.onSuccess(newCustomer);
                }
                if (screenData?.fromInstallmentSale) {
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
              customer={screenData.customer} 
              installmentSales={screenData.installmentSales} 
              onBack={() => handleNavigate('customers')}
              onNavigate={handleNavigate}
              onAddPayment={addPaymentToSale}
            />
          } />
          <Route path="/edit-customer" element={
            <EditCustomerScreen
              customer={screenData} 
              onBack={() => {
                const customerInstallmentSales = installmentSales.filter((s) => s.customerId === screenData.id);
                handleNavigate('customer-detail', { customer: screenData, installmentSales: customerInstallmentSales });
              }}
              onUpdateCustomer={updateCustomer}
            />
          } />
          <Route path="/sale-detail" element={
            <SaleDetailScreen
              sale={screenData} 
              onBack={() => {
                const previousScreen = screenData.previousScreen || 'dashboard';
                handleNavigate(previousScreen as Screen);
              }}
            />
          } />
          <Route path="/payment-modal" element={
            <PaymentModal
              sale={screenData.sale} 
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
          
          {/* Rota 404/Fallback */}
          <Route path="*" element={user ? <HomeScreen onNavigate={handleNavigate} /> : <LoginScreen onNavigate={handleNavigate} />} />
        
        </Routes>
      </div>

      {/* Bottom Navigation */}
      {user && !isAuthScreen && !isConfigScreen && !isPaymentModal && (
        <BottomNavigation
          currentScreen={currentPath as Screen} 
          onNavigate={handleNavigate}
        />
      )}
    </MainLayout>
  );
}

export default App;
