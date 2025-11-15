import { create } from "zustand";
import {
  Warehouse,
  WarehouseCreateRequest,
  WarehouseUpdateRequest,
  WarehouseFilters,
} from "../types/warehouse";
import { warehouseService } from "../services/warehouse-service";

interface WarehouseState {
  warehouses: Warehouse[];
  currentWarehouse: Warehouse | null;
  loading: boolean;
  error: string | null;

  // Действия
  loadWarehouses: (filters?: WarehouseFilters) => Promise<void>;
  setCurrentWarehouse: (warehouse: Warehouse | null) => void;
  createWarehouse: (warehouse: WarehouseCreateRequest) => Promise<Warehouse>;
  updateWarehouse: (
    id: number,
    warehouse: WarehouseUpdateRequest
  ) => Promise<void>;
  deleteWarehouse: (id: number) => Promise<void>;
  clearWarehouses: () => void;
  clearError: () => void;
}

export const useWarehouseStore = create<WarehouseState>((set, get) => ({
  warehouses: [],
  currentWarehouse: null,
  loading: false,
  error: null,

  loadWarehouses: async (filters) => {
    set({ loading: true, error: null });
    try {
      const warehouses = await warehouseService.getWarehouses(filters);
      set({ warehouses, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка загрузки складов",
        loading: false,
      });
    }
  },

  setCurrentWarehouse: (warehouse) => {
    set({ currentWarehouse: warehouse });
  },

  createWarehouse: async (warehouseData) => {
    set({ loading: true, error: null });
    try {
      const newWarehouse = await warehouseService.createWarehouse(
        warehouseData
      );
      set((state) => ({
        warehouses: [...state.warehouses, newWarehouse],
        loading: false,
      }));
      return newWarehouse;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка создания склада",
        loading: false,
      });
      throw error;
    }
  },

  updateWarehouse: async (id, warehouseData) => {
    set({ loading: true, error: null });
    try {
      await warehouseService.updateWarehouse(id, warehouseData);
      set((state) => ({
        warehouses: state.warehouses.map((wh) =>
          wh.id === id ? { ...wh, ...warehouseData } : wh
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка обновления склада",
        loading: false,
      });
      throw error;
    }
  },

  deleteWarehouse: async (id) => {
    set({ loading: true, error: null });
    try {
      await warehouseService.deleteWarehouse(id);
      set((state) => ({
        warehouses: state.warehouses.filter((wh) => wh.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка удаления склада",
        loading: false,
      });
      throw error;
    }
  },

  clearWarehouses: () => {
    set({ warehouses: [], currentWarehouse: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));
