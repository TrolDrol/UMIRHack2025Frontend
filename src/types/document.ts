export enum DocumentType {
  Inventory = 1, // Инвентаризация
  Receipt = 2, // Приход
  WriteOff = 3, // Списание
  Transfer = 4, // Перемещение
}

export interface Document {
  id: number;
  type: DocumentType;
  typeName: string;
  number: string;
  date: string;
  status: string;
  organizationId: number;
  organizationName?: string;
  warehouseId?: number;
  warehouseName?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  scannedQuantity?: number;
  items?: DocumentItem[];
}

export interface DocumentItem {
  id: number;
  documentId: number;
  productId: number;
  productName: string;
  productBarcode?: string;
  quantity: number;
  scannedQuantity?: number;
  difference?: number;
  price?: number;
  total?: number;
}

export interface DocumentCreateRequest {
  type: DocumentType;
  organizationId: number;
  warehouseId?: number;
  description?: string;
  documentDate: string;
}

export interface DocumentUpdateRequest {
  id: number;
  description?: string;
  status?: string;
}

export interface DocumentFilters {
  organizationId?: number;
  type?: DocumentType;
  status?: string;
  search?: string;
}
