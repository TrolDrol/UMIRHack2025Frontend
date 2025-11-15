// Базовые типы для API
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface Organization {
  id: number;
  name: string;
  inn: string;
  address: string;
  phone: string;
  userRole?: string;
}

export interface Product {
  id: number;
  name: string;
  barcode: string;
  description?: string;
  organizationId: number;
}

export interface Document {
  id: number;
  type: string;
  number: string;
  status: string;
  dateCreated: string;
  documentDate: string;
  organizationId: number;
  warehouseId: number;
  createdById: number;
  warehouse: {
    id: number;
    name: string;
  };
  items: DocumentItem[];
}

export interface DocumentItem {
  id: number;
  documentId: number;
  productId: number;
  quantityExpected: number;
  quantityActual: number;
  product: {
    id: number;
    name: string;
  };
}
