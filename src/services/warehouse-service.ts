import { apiClient } from "./api-client";
import {
  Warehouse,
  WarehouseCreateRequest,
  WarehouseUpdateRequest,
  WarehouseFilters,
} from "../types/warehouse";

export const warehouseService = {
  // Получить все склады организации
  async getWarehouses(filters?: WarehouseFilters): Promise<Warehouse[]> {
    const params = new URLSearchParams();

    if (filters?.organizationId) {
      params.append("organizationId", filters.organizationId.toString());
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await apiClient.get<Warehouse[]>(
      `/api/warehouses?${params.toString()}`
    );
    return response.data;
  },

  // Получить склад по ID
  async getWarehouse(id: number): Promise<Warehouse> {
    const response = await apiClient.get<Warehouse>(`/api/warehouses/${id}`);
    return response.data;
  },

  // Создать новый склад
  async createWarehouse(warehouse: WarehouseCreateRequest): Promise<Warehouse> {
    const response = await apiClient.post<Warehouse>(
      "/api/warehouses",
      warehouse
    );
    return response.data;
  },

  // Обновить склад
  async updateWarehouse(
    id: number,
    warehouse: WarehouseUpdateRequest
  ): Promise<void> {
    await apiClient.put<void>(`/api/warehouses/${id}`, warehouse);
  },

  // Удалить склад
  async deleteWarehouse(id: number): Promise<void> {
    await apiClient.delete(`/api/warehouses/${id}`);
  },
};
