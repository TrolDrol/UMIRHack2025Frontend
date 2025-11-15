import { create } from "zustand";
import { Organization } from "../types/api";
import { organizationService } from "../services/organization-service";

interface OrganizationState {
  organizations: Organization[];
  currentOrganization: Organization | null;
  loading: boolean;
  error: string | null;

  // Действия
  loadOrganizations: () => Promise<void>;
  setCurrentOrganization: (organization: Organization | null) => void;
  createOrganization: (organization: Omit<Organization, "id">) => Promise<void>;
  updateOrganization: (
    id: number,
    organization: Partial<Organization>
  ) => Promise<void>;
  deleteOrganization: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useOrganizationStore = create<OrganizationState>((set) => ({
  organizations: [],
  currentOrganization: null,
  loading: false,
  error: null,

  loadOrganizations: async () => {
    set({ loading: true, error: null });
    try {
      const organizations = await organizationService.getOrganizations();
      set({ organizations, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка загрузки организаций",
        loading: false,
      });
    }
  },

  setCurrentOrganization: (organization) => {
    set({ currentOrganization: organization });
  },

  createOrganization: async (organizationData) => {
    set({ loading: true, error: null });
    try {
      const newOrganization = await organizationService.createOrganization(
        organizationData
      );
      set((state) => ({
        organizations: [...state.organizations, newOrganization],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка создания организации",
        loading: false,
      });
      throw error;
    }
  },

  updateOrganization: async (id, organizationData) => {
    set({ loading: true, error: null });
    try {
      await organizationService.updateOrganization(id, organizationData);
      set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === id ? { ...org, ...organizationData } : org
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка обновления организации",
        loading: false,
      });
      throw error;
    }
  },

  deleteOrganization: async (id) => {
    set({ loading: true, error: null });
    try {
      await organizationService.deleteOrganization(id);
      set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка удаления организации",
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
