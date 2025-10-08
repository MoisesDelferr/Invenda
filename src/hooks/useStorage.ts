import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Product, Sale, Customer, InstallmentSale, SaleItem } from '../types';

interface InstallmentSalePayload {
  customerId: string;
  items: SaleItem[];
  totalAmount: number;
  initialPayment: number;
  installments: number;
  installmentAmount: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao';
}

export function useStorage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [installmentSales, setInstallmentSales] = useState<InstallmentSale[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate SKU
 const generateSKU = (): string => {
    // Define o conjunto de caracteres permitidos.
    // Excluindo: I, O (parecem 1, 0) e L (parece 1).
    // Usando apenas maiúsculas para evitar confusão.
    const chars = '0123456789ABCDEFGHJKMNPQRSTUVWXYZ'; // Note: 'I', 'O', 'L' foram removidos.
    const length = 5; // Comprimento desejado do SKU
    let result = '';

    for (let i = 0; i < length; i++) {
        // Escolhe um caractere aleatório do conjunto 'chars'
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars[randomIndex];
    }

    return result;
};

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Fetch customers
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;

      // Fetch sales with items and payments (agora não filtramos status, pois deletamos em vez de cancelar)
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          *,
          sale_items(*),
          installment_payments(*)
        `)
        .order('sale_date', { ascending: false });

      if (salesError) throw salesError;

      // Transform data to match expected format
      const transformedProducts: Product[] = productsData?.map(p => ({
        id: p.id,
        name: p.name,
        model: p.model || '',
        variation: p.variation || '',
        salePrice: parseFloat(p.salePrice || 0),
        stock: p.stock || 0,
        sku: p.sku || '',
        createdAt: new Date(p.created_at)
      })) || [];

      const transformedCustomers: Customer[] = customersData?.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        address: c.address || ''
      })) || [];

      // Separate regular sales and installment sales
      const regularSales: Sale[] = [];
      const installmentSalesList: InstallmentSale[] = [];

      salesData?.forEach(sale => {
        if (sale.is_installment) {
          // Installment sale
          const customer = transformedCustomers.find(c => c.id === sale.customer_id);
          const payments = sale.installment_payments?.map((p: any) => ({
            date: new Date(p.payment_date),
            amount: parseFloat(p.amount || 0)
          })) || [];

          installmentSalesList.push({
            id: sale.id,
            customerId: sale.customer_id || '',
            customerName: customer?.name || 'Cliente',
            date: new Date(sale.sale_date),
            totalAmount: parseFloat(sale.total_amount || 0),
            initialPayment: parseFloat(sale.initial_payment || 0),
            installmentCount: sale.installment_count || 0,
            installmentValue: parseFloat(sale.installment_value || 0),
            payments,
            items: sale.sale_items?.map((item: any) => {
              const product = transformedProducts.find(p => p.id === item.product_id);
              return {
                productId: item.product_id || '',
                productName: product?.name || 'Produto',
                productSku: product?.sku || '',
                quantity: item.quantity || 0,
                unitPrice: parseFloat(item.unit_price || 0),
                totalPrice: parseFloat(item.subtotal || 0)
              };
            }) || []
          });
        } else {
          // Regular sale
          const saleItems = sale.sale_items?.map((si: any) => {
                const prod = transformedProducts.find(p => p.id === si.product_id);
                return {
                    productId: si.product_id || '',
                    productName: prod?.name || 'Produto',
                    productSku: prod?.sku || '',
                    quantity: si.quantity || 0,
                    unitPrice: parseFloat(si.unit_price || 0),
                    totalPrice: parseFloat(si.subtotal || 0)
                };
            }) || [];
            
            regularSales.push({
                id: sale.id,
                productId: saleItems[0]?.productId || '', 
                productName: saleItems[0]?.productName || 'Venda Múltipla', 
                productSku: saleItems[0]?.productSku || '', 
                quantity: 0,
                unitPrice: 0,
                totalPrice: parseFloat(sale.total_amount || 0),
                paymentMethod: sale.payment_type || 'dinheiro',
                isOpen: false,
                payments: [],
                date: new Date(sale.sale_date),
                items: saleItems
            });
        }
      });

      setProducts(transformedProducts);
      setCustomers(transformedCustomers);
      setSales(regularSales);
      setInstallmentSales(installmentSalesList);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Add product
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'sku' | 'createdAt'>): Promise<Product> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // ✅ CORREÇÃO 2: A chamada agora está correta, usando a função sem parâmetros.
    const sku = generateSKU(); 

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: productData.name,
        model: productData.model,
        variation: productData.variation,
        salePrice: productData.salePrice,
        stock: productData.stock,
        sku
      })
      .select()
      .single();

    if (error) throw error;

    const newProduct: Product = {
      id: data.id,
      name: data.name,
      model: data.model,
      variation: data.variation,
      salePrice: parseFloat(data.salePrice),
      stock: data.stock,
      sku: data.sku, // O SKU retornado do banco é usado para o estado local
      createdAt: new Date(data.created_at)
    };

    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, []);

  // Update product stock
  const updateProductStock = useCallback(async (productId: string, quantityChange: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    const newStock = product.stock + quantityChange;

    const { data, error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, stock: data.stock } : p
    ));
  }, [products]);

// 🌟 NOVO: Update product price
  const updateProductPrice = useCallback(async (productId: string, newPrice: number) => {
    const { data, error } = await supabase
      .from('products')
      .update({ salePrice: newPrice })
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;

    // Atualiza o estado local com o novo preço
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, salePrice: parseFloat(data.salePrice) } : p
    ));
  }, []); // Não precisa de 'products' como dependência aqui, pois o setProducts usa o prevState

  // Add multiple items sale
  const addMultipleItemsSale = useCallback(async (
    items: SaleItem[],
    paymentMethod: 'dinheiro' | 'pix' | 'cartao'
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        payment_type: paymentMethod,
        status: 'completed',
        is_installment: false
      })
      .select()
      .single();

    if (saleError) throw saleError;

    const saleItems = items.map(item => ({
      sale_id: saleData.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.totalPrice
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    for (const item of items) {
      await updateProductStock(item.productId, -item.quantity);
    }

    await fetchAllData();
  }, [updateProductStock, fetchAllData]);

  // Add installment sale
  const addInstallmentSale = useCallback(async (
    saleData: InstallmentSalePayload 
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { 
        customerId, 
        items, 
        totalAmount, 
        initialPayment, 
        installments, 
        installmentAmount, 
        paymentMethod 
    } = saleData;

    const { data: saleDataInserted, error: saleError } = await supabase
      .from('sales')
      .insert({
        user_id: user.id,
        customer_id: customerId,
        total_amount: totalAmount,
        payment_type: paymentMethod, 
        status: 'pending_installment', 
        is_installment: true,
        initial_payment: initialPayment,
        installment_count: installments,
        installment_value: installmentAmount
      })
      .select()
      .single();

    if (saleError) throw saleError;

    const saleItems = items.map(item => ({
      sale_id: saleDataInserted.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.totalPrice
    }));

    const { error: itemsError } = await supabase
      .from('sale_items')
      .insert(saleItems);

    if (itemsError) throw itemsError;

    for (const item of items) {
      await updateProductStock(item.productId, -item.quantity);
    }

    await fetchAllData();
  }, [updateProductStock, fetchAllData]);

  // Add customer
  const addCustomer = useCallback(async (customerData: Omit<Customer, 'id'>): Promise<Customer> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        name: customerData.name,
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || ''
      })
      .select()
      .single();

    if (error) throw error;

    const newCustomer: Customer = {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || ''
    };

    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  // Update customer
  const updateCustomer = useCallback(async (customerId: string, customerData: Partial<Customer>) => {
    const { error } = await supabase
      .from('customers')
      .update({
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address
      })
      .eq('id', customerId);

    if (error) throw error;

    setCustomers(prev => prev.map(c =>
      c.id === customerId ? { ...c, ...customerData } : c
    ));
  }, []);

  // Add payment to installment sale
  const addPaymentToSale = useCallback(async (saleId: string, amount: number) => {
    const { error } = await supabase
      .from('installment_payments')
      .insert({
        sale_id: saleId,
        amount
      });

    if (error) throw error;

    await fetchAllData();
  }, [fetchAllData]);

  // Delete sale (Agora realiza a exclusão completa e reverte o estoque)
  const deleteSale = useCallback(async (saleId: string) => {
    try {
        // 1. Obter os itens da venda
        const { data: saleItemsData, error: itemsError } = await supabase
            .from('sale_items')
            .select('*')
            .eq('sale_id', saleId);

        if (itemsError) throw itemsError;

        // 2. Reverter o estoque para cada produto
        for (const item of saleItemsData || []) {
            await updateProductStock(item.product_id, item.quantity); // Adiciona a quantidade de volta
        }

        // 3. Deletar pagamentos (tabela filha)
        const { error: paymentsError } = await supabase
            .from('installment_payments')
            .delete()
            .eq('sale_id', saleId);
        
        if (paymentsError) {
            console.warn('Alerta: Não foi possível deletar pagamentos parcelados. Continuando a exclusão da venda.', paymentsError);
        }
        
        // 4. Deletar os itens da venda (tabela filha)
        const { error: deleteItemsError } = await supabase
            .from('sale_items')
            .delete()
            .eq('sale_id', saleId);

        if (deleteItemsError) throw deleteItemsError;

        // 5. Deletar o registro principal da venda
        const { error: deleteSaleError } = await supabase
            .from('sales')
            .delete()
            .eq('id', saleId);

        if (deleteSaleError) throw deleteSaleError;

        // 6. Atualizar os dados
        await fetchAllData();
    } catch (error) {
        console.error('Erro ao excluir a venda e reverter estoque:', error);
        throw error;
    }
  }, [updateProductStock, fetchAllData]);
  const deleteProduct = useCallback(async (productId: string) => {
    try {
        // 1. Verifique se o produto está em alguma venda (opcional, mas recomendado)
        // Se houver FK (Foreign Key) na tabela 'sales' ou 'sale_items' configurada
        // como ON DELETE CASCADE ou SET NULL, esta etapa é menos crítica.
        // No entanto, é mais seguro verificar a integridade dos dados se
        // você não tem certeza da configuração do banco.

        // 2. Deletar o registro principal do produto
        const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (deleteError) throw deleteError;

        // 3. Atualizar o estado local
        setProducts(prev => prev.filter(p => p.id !== productId));
        
    } catch (error) {
        console.error('Erro ao excluir o produto:', error);
        throw error;
    }
}, []);

  // Add single item sale (legacy support)
  const addSale = useCallback(async (
    productId: string,
    quantity: number,
    unitPrice: number,
    paymentMethod: 'dinheiro' | 'pix' | 'cartao'
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) throw new Error('Product not found');

    await addMultipleItemsSale([{
      productId,
      productName: product.name,
      productSku: product.sku,
      quantity,
      unitPrice,
      totalPrice: quantity * unitPrice
    }], paymentMethod);
  }, [products, addMultipleItemsSale]);

  // Get product by SKU
  const getProductBySKU = useCallback((sku: string): Product | undefined => {
    return products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
  }, [products]);

  // Search products
  const searchProducts = useCallback((query: string): Product[] => {
    const lowerQuery = query.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.model.toLowerCase().includes(lowerQuery) ||
      p.variation.toLowerCase().includes(lowerQuery)
    );
  }, [products]);

  return {
    products,
    sales,
    customers,
    installmentSales,
    loading,
    addProduct,
    updateProductStock,
    // 📢 INCLUÍDO NO RETORNO
    updateProductPrice, 
    addSale,
    addMultipleItemsSale,
    addInstallmentSale,
    addCustomer,
    updateCustomer,
    addPaymentToSale,
    deleteSale,
    deleteProduct,
    getProductBySKU,
    searchProducts,
    refetch: fetchAllData
  };
}