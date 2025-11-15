import React, { useEffect, useState } from "react";
import { useDocumentStore } from "../../../store/document-store";
import { useOrganizationStore } from "../../../store/organization-store";
import { Document, DocumentType } from "../../../types/document";
import { useLocation } from "react-router-dom";
import MultiStepDocumentForm from "../components/MultiStepDocumentForm";

const DocumentListPage: React.FC = () => {
  const location = useLocation();
  const { documents, loading, error, loadDocuments, deleteDocument } =
    useDocumentStore();
  const { currentOrganization } = useOrganizationStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  useEffect(() => {
    if (location.state?.action === "setShowCreateForm") {
      setShowCreateForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (currentOrganization) {
      loadDocuments({
        organizationId: currentOrganization.id,
        type: selectedType ? selectedType : undefined,
      });
    }
  }, [loadDocuments, currentOrganization, selectedType]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить документ?")) {
      try {
        await deleteDocument(id);
      } catch (error) {
        // Ошибка уже обработана в store
      }
    }
  };

  // Функция для обновления статуса документа
  const updateDocumentStatus = async (documentId: number, status: string) => {
    try {
      const response = await fetch(
        `http://localhost:5039/api/documents/${documentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(status),
        }
      );

      if (!response.ok) {
        throw new Error("Ошибка обновления статуса");
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка при обновлении статуса:", error);
      throw error;
    }
  };

  const handleCompleteDocument = async (documentId: number) => {
    try {
      if (window.confirm("Вы уверены, что хотите завершить этот документ?")) {
        await updateDocumentStatus(documentId, "in_progress");
        // Обновляем список документов
        if (currentOrganization) {
          loadDocuments({ organizationId: currentOrganization.id });
        }
        alert("Документ завершен!");
      }
    } catch (error) {
      console.error("Ошибка при завершении документа:", error);
      alert("Ошибка при завершении документа");
    }
  };

  const getTypeName = (type: DocumentType): string => {
    switch (type) {
      case DocumentType.Inventory:
        return "Инвентаризация";
      case DocumentType.Receipt:
        return "Приход";
      case DocumentType.WriteOff:
        return "Списание";
      case DocumentType.Transfer:
        return "Перемещение";
      default:
        return "Неизвестно";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "draft":
      case "черновик":
        return "#6c757d";
      case "in_progress":
      case "в работе":
        return "#007bff";
      case "completed":
      case "завершен":
        return "#28a745";
      case "cancelled":
      case "отменен":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case "draft":
        return "Черновик";
      case "in_progress":
        return "В работе";
      case "completed":
        return "Завершен";
      case "cancelled":
        return "Отменен";
      default:
        return status;
    }
  };

  const filteredDocuments = documents.filter(
    (document) =>
      document.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (document.description &&
        document.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Модальное окно для просмотра документа
  const DocumentViewModal = ({
    document,
    onClose,
  }: {
    document: Document;
    onClose: () => void;
  }) => {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: 30,
            borderRadius: 8,
            width: 600,
            maxWidth: "90vw",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <h3>Просмотр документа #{document.number}</h3>

          <div style={{ marginBottom: 20 }}>
            <strong>Тип:</strong> {getTypeName(document.type)}
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong>Статус:</strong>
            <span
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                marginLeft: 8,
                backgroundColor: getStatusColor(document.status),
                color: "white",
                fontSize: 12,
              }}
            >
              {getStatusText(document.status)}
            </span>
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong>Склад:</strong> {document.warehouseName || "Не указан"}
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong>Описание:</strong> {document.description || "Нет описания"}
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong>Дата создания:</strong>{" "}
            {new Date(document.createdAt).toLocaleString()}
          </div>

          {/* Список товаров */}
          {document.items && document.items.length > 0 ? (
            <div>
              <h4>Товары ({document.items.length})</h4>
              <div style={{ maxHeight: 200, overflow: "auto" }}>
                {document.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 10,
                      border: "1px solid #ddd",
                      marginBottom: 5,
                      borderRadius: 4,
                    }}
                  >
                    <div>
                      <strong>{item.productName}</strong>
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Штрих-код: {item.productBarcode} • Ожидаемо:{" "}
                      {item.quantity} • Фактически: {item.scannedQuantity || 0}{" "}
                      • Разница: {item.difference || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              Нет добавленных товаров
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 20,
            }}
          >
            <button
              onClick={onClose}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!currentOrganization) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
        <p>Выберите организацию для работы с документами</p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h1>Документы</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          + Создать документ
        </button>
      </div>

      {/* Фильтры и поиск */}
      <div
        style={{ marginBottom: 20, display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType | "")}
          style={{
            padding: 10,
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 4,
            minWidth: 200,
          }}
        >
          <option value="">Все типы</option>
          <option value={DocumentType.Inventory}>Инвентаризация</option>
          <option value={DocumentType.Receipt}>Приход</option>
          <option value={DocumentType.WriteOff}>Списание</option>
          <option value={DocumentType.Transfer}>Перемещение</option>
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Поиск по номеру или описанию..."
          style={{
            flex: 1,
            padding: 10,
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 4,
            minWidth: 300,
          }}
        />

        <button
          onClick={() => {
            setSearchTerm("");
            setSelectedType("");
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Сбросить
        </button>
      </div>

      {/* Информация об организации */}
      <div
        style={{
          backgroundColor: "#e9ecef",
          padding: 15,
          borderRadius: 4,
          marginBottom: 20,
        }}
      >
        <strong>Текущая организация:</strong> {currentOrganization.name}
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#ffe6e6",
            padding: 10,
            borderRadius: 4,
            marginBottom: 20,
          }}
        >
          Ошибка: {error}
        </div>
      )}

      {/* Таблица документов */}
      {loading ? (
        <div>Загрузка документов...</div>
      ) : filteredDocuments.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          <p>Документы не найдены</p>
          <p>Создайте первый документ</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "white",
              borderRadius: 8,
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Номер
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Тип
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Дата
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Статус
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Описание
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    borderBottom: "1px solid #dee2e6",
                  }}
                >
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr
                  key={document.id}
                  style={{ borderBottom: "1px solid #dee2e6" }}
                >
                  <td style={{ padding: 12, fontWeight: "bold" }}>
                    {document.number}
                  </td>
                  <td style={{ padding: 12 }}>{getTypeName(document.type)}</td>
                  <td style={{ padding: 12 }}>
                    {new Date(document.date).toLocaleDateString("ru-RU")}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        backgroundColor: getStatusColor(document.status),
                        color: "white",
                        fontSize: 12,
                      }}
                    >
                      {getStatusText(document.status)}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>{document.description || "-"}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        justifyContent: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      {/* Кнопка Посмотреть */}
                      <button
                        onClick={() => setViewingDocument(document)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#17a2b8",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Посмотреть
                      </button>

                      {/* Кнопка Завершить (только для черновиков) */}
                      {document.status === "draft" && (
                        <button
                          onClick={() => handleCompleteDocument(document.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          Завершить
                        </button>
                      )}

                      {/* Кнопка Удалить */}
                      <button
                        onClick={() => handleDelete(document.id)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Форма создания документа */}
      {showCreateForm && (
        <MultiStepDocumentForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            setShowCreateForm(false);
            if (currentOrganization) {
              loadDocuments({ organizationId: currentOrganization.id });
            }
          }}
        />
      )}

      {/* Модальное окно просмотра документа */}
      {viewingDocument && (
        <DocumentViewModal
          document={viewingDocument}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
};

export default DocumentListPage;
