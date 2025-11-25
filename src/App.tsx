import React from 'react';
// ✅ CORREÇÕES: Adicionando as importações dos hooks e do componente ausentes.
import { useAuth } from './hooks/useAuth'; 
import { useStorage } from './hooks/useStorage'; 
import { HomeScreen } from './screens/HomeScreen';

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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 

function App() {
  const { user, loading: authLoading } = useAuth();
  const { loading: dataLoading } = useStorage();
  
  // Condicional de carregamento
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

  // Lógica de Roteamento com react-router-dom
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
        <Route path="/reset-password" element={<ResetPasswordScreen />} />

        {/* Rotas privadas (acessíveis apenas se 'user' existir) */}
        {user ? (
          <Route element={<MainLayout withBottomNavigation={true} />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            {/* Redireciona qualquer rota desconhecida para o dashboard se estiver logado */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        ) : (
          /* Redireciona qualquer rota não pública para o login se não estiver logado */
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
  // O código de roteamento manual (com switch/case e currentScreen) que estava abaixo
  // foi REMOVIDO pois é uma arquitetura de roteamento conflitante com o react-router-dom.
  // A lógica de layout e navegação inferior deve ser tratada dentro dos componentes de rota.
}

export default App;
