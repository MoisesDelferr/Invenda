import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './screens/auth/ResetPasswordScreen';
import { MainLayout } from './components/Layout/MainLayout';
import { HomeScreen } from './screens/HomeScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { StockScreen } from './screens/StockScreen';
import { AddProductScreen } from './screens/AddProductScreen';
import { AddStockScreen } from './screens/AddStockScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { RegisterSaleScreen } from './screens/RegisterSaleScreen';
import { InstallmentSaleScreen } from './screens/InstallmentSaleScreen';
import { AddCustomerScreen } from './screens/AddCustomerScreen';
import { DeleteSalesScreen } from './screens/DeleteSalesScreen';
import { useStorage } from './hooks/useStorage';
import { Product } from './types';

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
  | 'delete-sales';

function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [screenData, setScreenData] = useState<any>(null);

  const {
    products,
    sales,
    customers,
    installmentSales,
    addProduct,
    updateProductStock,
    addSale,
    addMultipleItemsSale,
    addInstallmentSale,
    addCustomer,
    addPaymentToSale,
    deleteSale,
    getProductBySKU,
    searchProducts
  } = useStorage();

  const handleNavigate = (screen: Screen, data?: any) => {
    setCurrentScreen(screen);
    setScreenData(data);
  };

  const handleGoHome = () => {
    setCurrentScreen(user ? 'home' : 'login');
    setScreenData(null);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If user is not authenticated, show auth screens
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

  // User is authenticated, show main app
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigate} />;
        
      case 'dashboard':
        return (
          <DashboardScreen 
            sales={sales} 
            onBack={handleGoHome}
            onAddPayment={addPaymentToSale}
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
            product={screenData as Product}
            onBack={() => setCurrentScreen('stock')}
            onUpdateStock={updateProductStock}
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
              onBack={() => setCurrentScreen('installment-sale')}
              onAddCustomer={addCustomer}
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
        
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <MainLayout>
      {renderScreen()}
    </MainLayout>
  );
}

export default App;