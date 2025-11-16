import React, { useState, useEffect } from 'react';

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

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    initialScreen || (user ? 'home' : 'login')
  );
  const [screenData, setScreenData] = useState<any>(null);

  // CORREÇÃO ESSENCIAL PARA O MENU: Sincroniza a tela após o login/carregamento de autenticação
  useEffect(() => {
    // Se o carregamento terminou E o usuário está logado, mas a tela ainda é de autenticação,
    // navega para 'home' para exibir o menu inferior.
    if (!authLoading && user && ['login', 'register', 'forgot-password', 'reset-password'].includes(currentScreen)) {
      setCurrentScreen('home');
    }
  }, [authLoading, user]);


  const handleNavigate = (screen: Screen, data?: any) => {
    setCurrentScreen(screen);
    setScreenData(data);
  };

  const handleGoHome = () => {
    setCurrentScreen(user ? 'home' : 'login');
    setScreenData(null);
  };

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

  // Auth
  if (!user) {
    const renderAuthScreen = () => {
      switch (currentScreen) {
        case 'register':
          return <RegisterScreen onNavigate={handleNavigate} />;
        case 'forgot-password':
          return <ForgotPasswordScreen onNavigate={handleNavigate} />;
        case 'reset-password':
          return <ResetPasswordScreen onNavigate={handleNavigate} />;
        default:
          return <LoginScreen onNavigate={handleNavigate} />;
      }
    };

    return (
      <MainLayout>
        {renderAuthScreen()}
      </MainLayout>
    );
  }

  // Render Screens
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
      case 'dashboard':
        return (
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
        );
      case 'stock':
        return (
          <StockScreen
            products={products}
            onBack={handleGoHome}
            onNavigate={handleNavigate}
          />
        );
      case 'add-product':
        return (
          <AddProductScreen
            onBack={() => setCurrentScreen('stock')}
            onAddProduct={addProduct}
          />
        );
      case 'add-stock':
        return (
          <AddStockScreen
            products={products}
            onBack={() => setCurrentScreen('stock')}
            onUpdateStock={updateProductStock}
          />
        );
       case 'product-detail':
        return (
          <ProductDetailScreen
            product={screenData}
            onBack={() => setCurrentScreen('stock')}
            onUpdateStock={updateProductStock}
            onDeleteProduct={deleteProduct}
            // ✅ CORREÇÃO 2: onUpdatePrice passada como prop.
            onUpdatePrice={updateProductPrice}
          />
        );
      case 'register-sale':
        return (
          <RegisterSaleScreen
            products={products}
            onBack={handleGoHome}
            onAddSale={addMultipleItemsSale}
            onNavigate={handleNavigate}
            getProductBySKU={getProductBySKU}
          />
        );
      case 'installment-sale':
        return (
          <InstallmentSaleScreen
            customers={customers}
            saleData={screenData}
            onBack={() => setCurrentScreen('register-sale')}
            onAddInstallmentSale={addInstallmentSale}
            onNavigate={handleNavigate}
          />
        );
      case 'add-customer':
  return (
    <AddCustomerScreen
      onBack={() => {
        if (screenData?.fromInstallmentSale) {
          // volta para parcelamento preservando os dados da venda
          setCurrentScreen('installment-sale');
          setScreenData(screenData.saleData);
        } else {
          setCurrentScreen('customers');
        }
      }}
      onAddCustomer={addCustomer}
      onSuccess={(newCustomer: Customer) => {
        if (screenData?.onSuccess) {
          screenData.onSuccess(newCustomer); // devolve o cliente criado
        }
        if (screenData?.fromInstallmentSale) {
          // volta para parcelamento preservando os dados da venda
          setCurrentScreen('installment-sale');
          setScreenData(screenData.saleData);
        } else {
          setCurrentScreen('customers');
        }
      }}
      fromInstallmentSale={screenData?.fromInstallmentSale}
    />
  );

      case 'delete-sales':
        return (
          <DeleteSalesScreen
            sales={sales}
            onBack={handleGoHome}
            onDeleteSale={deleteSale}
          />
        );
      case 'customers':
        return (
          <CustomersScreen
            customers={customers}
            installmentSales={installmentSales}
            onBack={handleGoHome}
            onNavigate={handleNavigate}
          />
        );
      case 'customer-detail':
        return (
          <CustomerDetailScreen
            customer={screenData.customer}
            installmentSales={screenData.installmentSales}
            onBack={() => setCurrentScreen('customers')}
            onNavigate={handleNavigate}
            onAddPayment={addPaymentToSale}
          />
        );
      case 'edit-customer':
        return (
          <EditCustomerScreen
            customer={screenData}
            onBack={() => {
              const customerInstallmentSales = installmentSales.filter((s) => s.customerId === screenData.id);
              handleNavigate('customer-detail', { customer: screenData, installmentSales: customerInstallmentSales });
            }}
            onUpdateCustomer={updateCustomer}
          />
        );
      case 'sale-detail':
        return (
          <SaleDetailScreen
            sale={screenData}
            onBack={() => {
              const previousScreen = screenData.previousScreen || 'dashboard';
              setCurrentScreen(previousScreen);
            }}
          />
        );
      case 'payment-modal':
        return (
          <PaymentModal
            sale={screenData.sale}
            onBack={() => setCurrentScreen(screenData.previousScreen || 'dashboard')}
            onAddPayment={addPaymentToSale}
          />
        );
      case 'open-sales-list':
        return (
          <OpenSalesListScreen
            installmentSales={installmentSales}
            onBack={() => setCurrentScreen('dashboard')}
            onNavigate={handleNavigate}
            onAddPayment={addPaymentToSale}
          />
        );
      case 'account-plan':
        return (
          <AccountPlanScreen />
        );
      case 'config':
        return (
          <ConfigScreen
            user={user}
            onBack={handleGoHome}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <MainLayout>
      {/* Menu button */}
      {currentScreen !== 'config' && (
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
          user && !['login', 'register', 'forgot-password', 'reset-password', 'config'].includes(currentScreen)
            ? 'pb-14' // ⬅️ Tente 'pb-14' (56px). Se ainda sobrepor, use 'pb-16' (64px).
            : ''
        }
      >
        {renderScreen()}
      </div>

      {/* Bottom Navigation */}
      {user && !['login', 'register', 'forgot-password', 'reset-password', 'config', 'payment-modal'].includes(currentScreen) && (
        <BottomNavigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
        />
      )}
    </MainLayout>
  );
}

export default App;