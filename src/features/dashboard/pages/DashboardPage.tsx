import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganizationStore } from "../../../store/organization-store";
import { useProductStore } from "../../../store/product-store";
import { useWarehouseStore } from "../../../store/warehouse-store";
import { useDocumentStore } from "../../../store/document-store";
import { Document, DocumentType } from "../../../types/document";

const DashboardPage: React.FC = () => {
  const { currentOrganization } = useOrganizationStore();
  const { products, loadProducts } = useProductStore();
  const { warehouses, loadWarehouses } = useWarehouseStore();
  const { documents, loadDocuments } = useDocumentStore();
  const navigate = useNavigate();

  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    activeInventories: 0,
    monthlyDocuments: 0,
  });

  useEffect(() => {
    if (currentOrganization) {
      loadProducts({ organizationId: currentOrganization.id });
      loadWarehouses({ organizationId: currentOrganization.id });
      loadDocuments({ organizationId: currentOrganization.id });
    }
  }, [currentOrganization, loadProducts, loadWarehouses, loadDocuments]);

  useEffect(() => {
    if (documents.length > 0 || products.length > 0 || warehouses.length > 0) {
      // Берем последние 4 документа
      const recent = documents.slice(0, 4);
      setRecentDocuments(recent);

      // Считаем активные инвентаризации
      const activeInventories = documents.filter(
        (doc) =>
          doc.type === DocumentType.Inventory &&
          doc.status.toLowerCase() === "в работе"
      ).length;

      // Считаем документы за текущую неделю
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyDocs = documents.filter((doc) => {
        const docDate = new Date(doc.date);
        return (
          docDate.getMonth() === currentMonth &&
          docDate.getFullYear() === currentYear
        );
      }).length;

      setStats({
        totalProducts: products.length,
        totalWarehouses: warehouses.length,
        activeInventories,
        monthlyDocuments: documents.length,
      });
    }
  }, [products, warehouses, documents]);

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
      case "черновик":
        return "#fff3cd";
      case "в работе":
        return "#cce7ff";
      case "завершен":
        return "#d4edda";
      case "отменен":
        return "#f8d7da";
      default:
        return "#f8f9fa";
    }
  };

  const getStatusTextColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "черновик":
        return "#856404";
      case "в работе":
        return "#004085";
      case "завершен":
        return "#155724";
      case "отменен":
        return "#721c24";
      default:
        return "#6c757d";
    }
  };

  const handleCreateDocument = () => {
    navigate("/documents");
  };

  const handleCreateInventory = () => {
    navigate("/documents");
  };

  const handleViewDocument = (documentId: number) => {
    console.log("Просмотр документа:", documentId);
    // TODO: Добавить логику просмотра документа
  };

  if (!currentOrganization) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
        <p>Выберите организацию для просмотра статистики</p>
      </div>
    );
  }

  return (
    <div>
      {/* Карточки статистики */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 20,
          marginBottom: 30,
        }}
      >
        {/* Активные инвентаризации */}
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
            Активные инвентаризации
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: "10px 0",
              color: "#3498db",
            }}
          >
            {stats.activeInventories}
          </div>
          <div style={{ color: "#7f8c8d", fontSize: "0.8rem" }}>
            Требуют внимания
          </div>
        </div>

        {/* Товары в номенклатуре */}
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
            Товаров в номенклатуре
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: "10px 0",
              color: "#27ae60",
            }}
          >
            {stats.totalProducts}
          </div>
          <div style={{ color: "#7f8c8d", fontSize: "0.8rem" }}>
            +{stats.totalProducts} за неделю
          </div>
        </div>

        {/* Склады в системе */}
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
            Складов в системе
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: "10px 0",
              color: "#f39c12",
            }}
          >
            {stats.totalWarehouses}
          </div>
          <div style={{ color: "#7f8c8d", fontSize: "0.8rem" }}>
            {warehouses.filter((w) => w.isActive).length} активных
          </div>
        </div>

        {/* Документы за месяц */}
        <div
          style={{
            background: "white",
            borderRadius: 8,
            padding: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ color: "#7f8c8d", fontSize: "0.9rem" }}>
            Документов в системе
          </div>
          <div
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              margin: "10px 0",
              color: "#e74c3c",
            }}
          >
            {stats.monthlyDocuments}
          </div>
          <div style={{ color: "#7f8c8d", fontSize: "0.8rem" }}>
            +{stats.monthlyDocuments} за неделю
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div style={{ marginBottom: 30 }}>
        <h3 style={{ marginBottom: 15, fontWeight: 500, color: "#2c3e50" }}>
          Быстрые действия
        </h3>
        <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
          <button
            onClick={() =>
              navigate("/products", {
                state: { action: "setShowCreateForm", item: "true" },
              })
            }
            style={{
              padding: "10px 20px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#2980b9")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#3498db")}
          >
            <span style={{ marginRight: 8 }}>➕</span> Создать документ
          </button>

          <button
            onClick={() =>
              navigate("/products", {
                state: { action: "setShowCreateForm", item: "true" },
              })
            }
            style={{
              padding: "10px 20px",
              background: "#27ae60",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#219653")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#27ae60")}
          >
            <span style={{ marginRight: 8 }}>📦</span> Добавить товар
          </button>

          <button
            onClick={() =>
              navigate("/warehouses", {
                state: { action: "setShowCreateForm", item: "true" },
              })
            }
            style={{
              padding: "10px 20px",
              background: "transparent",
              border: "1px solid #bdc3c7",
              color: "#2c3e50",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              transition: "all 0.3s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f8f9fa")}
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <span style={{ marginRight: 8 }}>🏢</span> Добавить склад
          </button>
        </div>
      </div>

      {/* Последние документы */}
      <div
        style={{
          background: "white",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          marginBottom: 30,
        }}
      >
        <h3 style={{ marginBottom: 15, fontWeight: 500, color: "#2c3e50" }}>
          Последние документы
        </h3>

        {recentDocuments.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
            <p>Документы не найдены</p>
            <p>Создайте первый документ</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 15px",
                      borderBottom: "1px solid #bdc3c7",
                      fontWeight: 500,
                      color: "#7f8c8d",
                    }}
                  >
                    Номер
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 15px",
                      borderBottom: "1px solid #bdc3c7",
                      fontWeight: 500,
                      color: "#7f8c8d",
                    }}
                  >
                    Тип
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 15px",
                      borderBottom: "1px solid #bdc3c7",
                      fontWeight: 500,
                      color: "#7f8c8d",
                    }}
                  >
                    Дата
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 15px",
                      borderBottom: "1px solid #bdc3c7",
                      fontWeight: 500,
                      color: "#7f8c8d",
                    }}
                  >
                    Статус
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 15px",
                      borderBottom: "1px solid #bdc3c7",
                      fontWeight: 500,
                      color: "#7f8c8d",
                    }}
                  >
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentDocuments.map((document) => (
                  <tr
                    key={document.id}
                    style={{ borderBottom: "1px solid #f1f1f1" }}
                  >
                    <td style={{ padding: "12px 15px", fontWeight: "bold" }}>
                      {document.number}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      {getTypeName(document.type)}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      {new Date(document.date).toLocaleDateString("ru-RU")}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: 4,
                          backgroundColor: getStatusColor(document.status),
                          color: getStatusTextColor(document.status),
                          fontSize: "0.8rem",
                          fontWeight: 500,
                        }}
                      >
                        {document.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <button
                        style={{
                          color: "#3498db",
                          textDecoration: "none",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: "inherit",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                        onClick={() => handleViewDocument(document.id)}
                      >
                        Просмотр
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Активные мобильные сессии */}
      <div
        style={{
          background: "white",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ marginBottom: 15, fontWeight: 500, color: "#2c3e50" }}>
          Активные мобильные сессии
        </h3>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 15,
            background: "#f8f9fa",
            borderRadius: 4,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 500 }}>
              Инвентаризация {currentOrganization.name}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              Создана: {new Date().toLocaleDateString("ru-RU")}{" "}
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>
              Проверяющий: Система
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #bdc3c7",
                color: "#2c3e50",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              QR-код
            </button>
            <button
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #bdc3c7",
                color: "#2c3e50",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Завершить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
