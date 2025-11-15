export interface Warehouse {
  id: number;
  name: string;
  address?: string;
  description?: string;
  organizationId: number;
  organizationName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseCreateRequest {
  name: string;
  address?: string;
  description?: string;
  organizationId: number;
  isActive?: boolean;
}

export interface WarehouseUpdateRequest {
  id: number;
  name: string;
  address?: string;
  description?: string;
  isActive: boolean;
  organizationId: number;
}

export interface WarehouseFilters {
  organizationId?: number;
  search?: string;
}
