import { apiClient } from "./api-client";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductFilters,
} from "../types/product";

export const productService = {
  // Получить все товары организации
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();

    if (filters?.organizationId) {
      params.append("organizationId", filters.organizationId.toString());
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.barcode) {
      params.append("barcode", filters.barcode);
    }

    const response = await apiClient.get<Product[]>(
      `/api/products?${params.toString()}`
    );
    return response.data;
  },

  // Получить товар по ID
  async getProduct(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/api/products/${id}`);
    return response.data;
  },

  // Создать новый товар
  async createProduct(product: ProductCreateRequest): Promise<Product> {
    const response = await apiClient.post<Product>("/api/products", product);
    return response.data;
  },

  // Обновить товар
  async updateProduct(
    id: number,
    product: ProductUpdateRequest
  ): Promise<void> {
    const updateData = {
      ...product,
      id: id,
    };
    await apiClient.put<void>(`/api/products/${id}`, updateData);
  },

  // Удалить товар
  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/api/products/${id}`);
  },

  // Поиск товара по штрих-коду в организации
  async getProductByBarcode(
    barcode: string,
    organizationId: number
  ): Promise<Product | null> {
    try {
      const response = await apiClient.get<Product>(
        `/api/products/by-barcode/${barcode}?organizationId=${organizationId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Товар не найден
      }
      throw error;
    }
  },
};
