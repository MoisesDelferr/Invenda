import React from 'react';

import { LoginScreen } from './screens/auth/LoginScreen';
import { RegisterScreen } from './screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from './screens/auth/ResetPasswordScreen';

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
import { OpenSalesListScreen } from './screens/OpenSalesListScreen';
import { AccountPlanScreen } from './screens/AccountPlanScreen';
import { ConfigScreen } from './screens/SettingsScreen';

import { MainLayout } from './components/Layout/MainLayout';
import { BottomNavigation } from './components/Layout/BottomNavigation';
import { PaymentModal } from './components/PaymentModal';
import { Menu } from 'lucide-react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useStorage();

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
   return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Rotas privadas */}
        {user && (
          <>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/stock" element={<StockScreen />} />
            <Route path="/add-product" element={<AddProductScreen />} />
            <Route path="/add-stock" element={<AddStockScreen />} />
            <Route path="/product-detail" element={<ProductDetailScreen />} />
            <Route path="/register-sale" element={<RegisterSaleScreen />} />
            <Route path="/installment-sale" element={<InstallmentSaleScreen />} />
            <Route path="/add-customer" element={<AddCustomerScreen />} />
            <Route path="/delete-sales" element={<DeleteSalesScreen />} />
            <Route path="/customers" element={<CustomersScreen />} />
            <Route path="/customer-detail" element={<CustomerDetailScreen />} />
            <Route path="/edit-customer" element={<EditCustomerScreen />} />
            <Route path="/sale-detail" element={<SaleDetailScreen />} />
            <Route path="/open-sales-list" element={<OpenSalesListScreen />} />
            <Route path="/account-plan" element={<AccountPlanScreen />} />
            <Route path="/config" element={<ConfigScreen />} />
          </>
        )}

        {/* Rota padrão */}
        <Route path="*" element={<LoginScreen />} />
      </Routes>
    </BrowserRouter>
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
