export interface Product {
  id: number;
  name: string;
  barcode?: string;
  description?: string;
  unit: string;
  isActive: boolean;
  organizationId: number;
  organizationName?: string;
  createdAt: string;
}

export interface ProductCreateRequest {
  name: string;
  barcode?: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
  organizationId: number;
}

export interface ProductUpdateRequest {
  id: number;
  name?: string;
  barcode?: string;
  description?: string;
  unit?: string;
  isActive?: boolean;
  organizationId?: number;
}

export interface ProductFilters {
  organizationId?: number;
  search?: string;
  barcode?: string;
}
