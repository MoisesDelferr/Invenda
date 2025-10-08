export interface Product {
  id: string;
  name: string;
  model: string;
  salePrice: number;
  variation: string;
  stock: number;
  sku: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao';
  isOpen: boolean;
  openAmount?: number;
  payments: Payment[];
  date: Date;
  items?: SaleItem[]; // Optional field for grouped sales display
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InstallmentSale {
  id: string;
  customerId: string;
  customerName: string;
  items: SaleItem[];
  totalAmount: number;
  initialPayment: number;
  installments: number;
  installmentAmount: number;
  remainingAmount: number;
  paymentMethod: 'dinheiro' | 'pix' | 'cartao';
  date: Date;
  payments: Payment[];
}

export interface DashboardData {
  dailyTotal: number;
  weeklyTotal: number;
  monthlyTotal: number;
  todaySales: Sale[];
  openSales: Sale[];
  totalOpenAmount: number;
}