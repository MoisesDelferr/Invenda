import { useState, useEffect } from 'react';
import { Product, Sale, Customer, InstallmentSale, SaleItem } from '../types';

export const useStorage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [installmentSales, setInstallmentSales] = useState<InstallmentSale[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedProducts = localStorage.getItem('invenda-products');
    const storedSales = localStorage.getItem('invenda-sales');
    const storedCustomers = localStorage.getItem('invenda-customers');
    const storedInstallmentSales = localStorage.getItem('invenda-installment-sales');

    if (storedProducts) {
      const parsedProducts = JSON.parse(storedProducts).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
      setProducts(parsedProducts);
    }

    if (storedSales) {
      const parsedSales = JSON.parse(storedSales).map((s: any) => ({
        ...s,
        date: new Date(s.date),
        payments: s.payments || []
      }));
      setSales(parsedSales);
    }

    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }));
      setCustomers(parsedCustomers);
    }

    if (storedInstallmentSales) {
      const parsedInstallmentSales = JSON.parse(storedInstallmentSales).map((s: any) => ({
        ...s,
        date: new Date(s.date),
        payments: s.payments || [],
        items: s.items || []
      }));
      setInstallmentSales(parsedInstallmentSales);
    }
  }, []);

  // Save products to localStorage
  const saveProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('invenda-products', JSON.stringify(newProducts));
  };

  // Save sales to localStorage
  const saveSales = (newSales: Sale[]) => {
    setSales(newSales);
    localStorage.setItem('invenda-sales', JSON.stringify(newSales));
  };

  // Save customers to localStorage
  const saveCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    localStorage.setItem('invenda-customers', JSON.stringify(newCustomers));
  };

  // Save installment sales to localStorage
  const saveInstallmentSales = (newInstallmentSales: InstallmentSale[]) => {
    setInstallmentSales(newInstallmentSales);
    localStorage.setItem('invenda-installment-sales', JSON.stringify(newInstallmentSales));
  };

// Generate short unique SKU
const generateSKU = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = '';
  for (let i = 0; i < 7; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};


  // Add product
  const addProduct = (productData: Omit<Product, 'id' | 'sku' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      sku: generateSKU(),
      createdAt: new Date()
    };

    const updatedProducts = [...products, newProduct];
    saveProducts(updatedProducts);
    return newProduct;
  };

  // Update product stock
  const updateProductStock = (productId: string, newStock: number) => {
    const updatedProducts = products.map(product =>
      product.id === productId ? { ...product, stock: newStock } : product
    );
    saveProducts(updatedProducts);
  };

  // Add sale
  const addSale = (saleData: Omit<Sale, 'id' | 'date' | 'totalPrice' | 'payments'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      totalPrice: saleData.quantity * saleData.unitPrice,
      payments: []
    };

    // Update product stock
    const product = products.find(p => p.id === saleData.productId);
    if (product && product.stock >= saleData.quantity) {
      updateProductStock(product.id, product.stock - saleData.quantity);
      
      const updatedSales = [...sales, newSale];
      saveSales(updatedSales);
      return newSale;
    }
    
    throw new Error('Estoque insuficiente');
  };

  // Add multiple items sale
  const addMultipleItemsSale = (items: SaleItem[], paymentMethod: 'dinheiro' | 'pix' | 'cartao') => {
    // Check stock for all items
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${item.productName}`);
      }
    }

    // Update stock for all items
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateProductStock(product.id, product.stock - item.quantity);
      }
    });

    // Create individual sales for each item (maintaining compatibility)
    const newSales = items.map(item => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      paymentMethod,
      isOpen: false,
      payments: []
    }));

    const updatedSales = [...sales, ...newSales];
    saveSales(updatedSales);
    return newSales;
  };

  // Add installment sale
  const addInstallmentSale = (saleData: Omit<InstallmentSale, 'id' | 'date' | 'payments'>) => {
    // Check stock for all items
    for (const item of saleData.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Estoque insuficiente para ${item.productName}`);
      }
    }

    // Update stock for all items
    saleData.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        updateProductStock(product.id, product.stock - item.quantity);
      }
    });

    const newInstallmentSale: InstallmentSale = {
      ...saleData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date(),
      payments: []
    };

    const updatedInstallmentSales = [...installmentSales, newInstallmentSale];
    saveInstallmentSales(updatedInstallmentSales);
    return newInstallmentSale;
  };

  // Add customer
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date()
    };

    const updatedCustomers = [...customers, newCustomer];
    saveCustomers(updatedCustomers);
    return newCustomer;
  };

  // Add payment to sale
  const addPaymentToSale = (saleId: string, amount: number) => {
    const updatedSales = sales.map(sale => {
      if (sale.id === saleId) {
        const newPayment = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          date: new Date()
        };
        
        const updatedPayments = [...sale.payments, newPayment];
        const totalPaid = updatedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const remainingAmount = (sale.openAmount || 0) - totalPaid;
        
        return {
          ...sale,
          payments: updatedPayments,
          isOpen: remainingAmount > 0
        };
      }
      return sale;
    });
    
    saveSales(updatedSales);
  };

  // Delete sale
  const deleteSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
      const product = products.find(p => p.id === sale.productId);
      if (product) {
        updateProductStock(product.id, product.stock + sale.quantity);
      }
      
      const updatedSales = sales.filter(s => s.id !== saleId);
      saveSales(updatedSales);
    }
  };

  // Get product by SKU
  const getProductBySKU = (sku: string): Product | undefined => {
    return products.find(product => product.sku.toLowerCase() === sku.toLowerCase());
  };

  // Search products
  const searchProducts = (query: string): Product[] => {
    const lowercaseQuery = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.model.toLowerCase().includes(lowercaseQuery) ||
      product.sku.toLowerCase().includes(lowercaseQuery) ||
      product.variation.toLowerCase().includes(lowercaseQuery)
    );
  };

  return {
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
  };
};