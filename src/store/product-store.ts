import { create } from "zustand";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductFilters,
} from "../types/product";
import { productService } from "../services/product-service";

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;

  // Действия
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  setCurrentProduct: (product: Product | null) => void;
  createProduct: (product: ProductCreateRequest) => Promise<void>;
  updateProduct: (id: number, product: ProductUpdateRequest) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  searchProductByBarcode: (
    barcode: string,
    organizationId: number
  ) => Promise<Product | null>;
  clearError: () => void;
  clearProducts: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  loading: false,
  error: null,

  loadProducts: async (filters) => {
    set({ loading: true, error: null });
    try {
      const products = await productService.getProducts(filters);
      set({ products, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка загрузки товаров",
        loading: false,
      });
    }
  },

  setCurrentProduct: (product) => {
    set({ currentProduct: product });
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const newProduct = await productService.createProduct(productData);
      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка создания товара",
        loading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      await productService.updateProduct(id, productData);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? { ...product, ...productData } : product
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка обновления товара",
        loading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      await productService.deleteProduct(id);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка удаления товара",
        loading: false,
      });
      throw error;
    }
  },

  searchProductByBarcode: async (barcode, organizationId) => {
    try {
      const product = await productService.getProductByBarcode(
        barcode,
        organizationId
      );
      return product;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка поиска товара",
      });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
  clearProducts: () => {
    set({ products: [], currentProduct: null }); // Очистка товаров
  },
}));
