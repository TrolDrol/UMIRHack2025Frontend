import { create } from "zustand";
import {
  Document,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentFilters,
  DocumentItem,
} from "../types/document";
import { documentService } from "../services/document-service";

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  documentItems: DocumentItem[];
  loading: boolean;
  error: string | null;

  // Действия
  loadDocuments: (filters?: DocumentFilters) => Promise<void>;
  loadDocument: (id: number) => Promise<void>;
  setCurrentDocument: (document: Document | null) => void;
  createDocument: (document: DocumentCreateRequest) => Promise<Document>;
  updateDocument: (
    id: number,
    document: DocumentUpdateRequest
  ) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
  clearDocuments: () => void;
  clearError: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  documentItems: [],
  loading: false,
  error: null,

  loadDocuments: async (filters) => {
    set({ loading: true, error: null });
    try {
      const documents = await documentService.getDocuments(filters);
      set({ documents, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка загрузки документов",
        loading: false,
      });
    }
  },

  loadDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      const document = await documentService.getDocument(id);
      const items = await documentService.getDocumentItems(id);
      set({ currentDocument: document, documentItems: items, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка загрузки документа",
        loading: false,
      });
    }
  },

  setCurrentDocument: (document) => {
    set({ currentDocument: document });
  },

  createDocument: async (documentData) => {
    set({ loading: true, error: null });
    try {
      const newDocument = await documentService.createDocument(documentData);
      set((state) => ({
        documents: [...state.documents, newDocument],
        loading: false,
      }));
      return newDocument;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка создания документа",
        loading: false,
      });
      throw error;
    }
  },

  updateDocument: async (id, documentData) => {
    set({ loading: true, error: null });
    try {
      await documentService.updateDocument(id, documentData);
      set((state) => ({
        documents: state.documents.map((doc) =>
          doc.id === id ? { ...doc, ...documentData } : doc
        ),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка обновления документа",
        loading: false,
      });
      throw error;
    }
  },

  updateDocumentStatus: async (id: number, status: string): Promise<void> => {
    set({ loading: true, error: null });
    try {
      await documentService.updateDocumentStatus(id, status);

      set((state) => {
        // Обновляем документ в списке документов
        const updatedDocuments = state.documents.map((doc) =>
          doc.id === id ? { ...doc, status } : doc
        );

        // Обновляем currentDocument если он активен
        const updatedCurrentDocument =
          state.currentDocument?.id === id
            ? { ...state.currentDocument, status }
            : state.currentDocument;

        return {
          documents: updatedDocuments,
          currentDocument: updatedCurrentDocument,
          loading: false,
        };
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          "Ошибка обновления статуса документа",
        loading: false,
      });
      throw error;
    }
  },

  deleteDocument: async (id: number) => {
    set({ loading: true, error: null });
    try {
      // Используем существующий endpoint для удаления документа
      await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Ошибка удаления документа",
        loading: false,
      });
      throw error;
    }
  },

  clearDocuments: () => {
    set({ documents: [], currentDocument: null, documentItems: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));
