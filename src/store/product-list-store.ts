import { create } from "zustand";
import { OrganizationOption } from "../types/organization";

interface ProductListState {
  organizationOptions: OrganizationOption[];
  loading: boolean;
  error: string | null;

  // Действия
  loadOrganizationOptions: () => Promise<void>;
  clearError: () => void;
}

export const useProductListStore = create<ProductListState>((set) => ({
  organizationOptions: [],
  loading: false,
  error: null,

  loadOrganizationOptions: async () => {
    set({ loading: true, error: null });
    try {
      // Импортируем здесь, чтобы избежать циклических зависимостей
      const { organizationService } = await import(
        "../services/organization-service"
      );
      const organizations = await organizationService.getOrganizations();

      const options: OrganizationOption[] = organizations.map((org) => ({
        value: org.id,
        label: org.name,
      }));

      set({ organizationOptions: options, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка загрузки организаций",
        loading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
