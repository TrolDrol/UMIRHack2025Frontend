import { apiClient } from "./api-client";
import {
  Document,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentFilters,
  DocumentItem,
} from "../types/document";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

export const documentService = {
  // Получить все документы
  async getDocuments(filters?: DocumentFilters): Promise<Document[]> {
    const params = new URLSearchParams();

    if (filters?.organizationId) {
      params.append("organizationId", filters.organizationId.toString());
    }
    if (filters?.type) {
      params.append("type", filters.type.toString());
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.search) {
      params.append("search", filters.search);
    }

    const response = await apiClient.get<Document[]>(
      `/api/documents?${params.toString()}`
    );
    return response.data;
  },

  // Получить документ по ID
  async getDocument(id: number): Promise<Document> {
    const response = await apiClient.get<Document>(`/api/documents/${id}`);
    return response.data;
  },

  // Создать новый документ
  async createDocument(document: DocumentCreateRequest): Promise<Document> {
    const response = await apiClient.post<Document>("/api/documents", document);
    return response.data;
  },

  // Обновить документ
  async updateDocument(
    id: number,
    document: DocumentUpdateRequest
  ): Promise<void> {
    await apiClient.put<void>(`/api/documents/${id}`, document);
  },

  // В document-service.ts добавь:
  updateDocumentStatus: async (id: number, status: string): Promise<void> => {
    const response = await axios.put(
      `${API_BASE_URL}/documents/${id}/status`,
      `"${status}"`,
      {
        // ← оборачиваем статус в кавычки
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  // Получить позиции документа
  async getDocumentItems(documentId: number): Promise<DocumentItem[]> {
    const response = await apiClient.get<DocumentItem[]>(
      `/api/documents/${documentId}/items`
    );
    return response.data;
  },

  // Добавить позицию в документ
  async addDocumentItem(
    documentId: number,
    productId: number,
    quantity: number
  ): Promise<DocumentItem> {
    const response = await apiClient.post<DocumentItem>(
      `/api/documents/${documentId}/items`,
      { productId, quantity }
    );
    return response.data;
  },

  // Обновить позицию документа
  async updateDocumentItem(
    documentId: number,
    itemId: number,
    quantity: number
  ): Promise<void> {
    await apiClient.put<void>(`/api/documents/${documentId}/items/${itemId}`, {
      quantity,
    });
  },

  // Удалить позицию документа
  async deleteDocumentItem(documentId: number, itemId: number): Promise<void> {
    await apiClient.delete(`/api/documents/${documentId}/items/${itemId}`);
  },
};
