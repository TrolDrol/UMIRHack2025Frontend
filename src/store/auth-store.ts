import { create } from "zustand";
import { User } from "../types/api";
import { useOrganizationStore } from "./organization-store";
import { useProductStore } from "./product-store";
import { useDocumentStore } from "./document-store";
import { useWarehouseStore } from "./warehouse-store";
import { authService } from "../services/auth-service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  initialize: () => {
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    if (user && token) {
      set({ user, isAuthenticated: true });
    }
  },

  login: async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    set({ user: response.user, isAuthenticated: true });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await authService.register(userData);
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    set({ user: response.user, isAuthenticated: true });
  },

  logout: () => {
    authService.logout();

    const organizationStore = useOrganizationStore.getState();
    const productStore = useProductStore.getState();
    const documentStore = useDocumentStore.getState();
    const warehouseStore = useWarehouseStore.getState();

    organizationStore.setCurrentOrganization(null);
    productStore.clearProducts();
    documentStore.clearDocuments();
    warehouseStore.clearWarehouses();

    set({ user: null, isAuthenticated: false });
  },
}));
