import React, { useEffect, useState } from "react";
import { useWarehouseStore } from "../../../store/warehouse-store";
import { useOrganizationStore } from "../../../store/organization-store";
import { Warehouse } from "../../../types/warehouse";
import WarehouseForm from "../components/WarehouseForm";
import { useLocation } from "react-router-dom";
import { useProductStore } from "../../../store/product-store";
import { useDocumentStore } from "../../../store/document-store";

const WarehouseListPage: React.FC = () => {
  const { products } = useProductStore();
  const { documents } = useDocumentStore();
  const location = useLocation();
  const {
    warehouses,
    loading,
    error,
    loadWarehouses,
    deleteWarehouse,
    updateWarehouse,
  } = useWarehouseStore();
  const { currentOrganization } = useOrganizationStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  useEffect(() => {
    if (location.state?.action === "setShowCreateForm") {
      setShowCreateForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    if (currentOrganization) {
      loadWarehouses({ organizationId: currentOrganization.id });
    }
  }, [loadWarehouses, currentOrganization]);

  const getWarehouseStats = (warehouseId: number) => {
    // Документы этого склада
    const warehouseDocuments = documents.filter(
      (doc) => doc.warehouseId === warehouseId
    );

    // Уникальные товары в документах склада
    const uniqueProducts = new Set<number>();
    warehouseDocuments.forEach((doc) => {
      doc.items?.forEach((item) => {
        uniqueProducts.add(item.productId);
      });
    });

    return {
      productsCount: uniqueProducts.size,
      documentsCount: warehouseDocuments.length,
    };
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить склад?")) {
      try {
        await deleteWarehouse(id);
      } catch (error) {
        // Ошибка уже обработана в store
      }
    }
  };

  const handleToggleActive = async (warehouse: Warehouse) => {
    try {
      await updateWarehouse(warehouse.id, {
        id: warehouse.id,
        name: warehouse.name,
        address: warehouse.address,
        description: warehouse.description,
        isActive: !warehouse.isActive,
        organizationId: warehouse.organizationId,
      });
    } catch (error) {
      console.error("Ошибка при изменении статуса склада:", error);
    }
  };

  const filteredWarehouses = warehouses.filter((warehouse) => {
    const matchesSearch =
      warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (warehouse.address &&
        warehouse.address.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeFilter === "active") return matchesSearch && warehouse.isActive;
    if (activeFilter === "inactive")
      return matchesSearch && !warehouse.isActive;
    return matchesSearch;
  });

  if (!currentOrganization) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
        <p>Выберите организацию для работы со складами</p>
      </div>
    );
  }

  // Стили как в HTML макете
  const styles = {
    controlsPanel: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      flexWrap: "wrap" as const,
      gap: "15px",
    },
    searchBox: {
      flex: 1,
      maxWidth: "400px",
      position: "relative" as const,
    },
    searchInput: {
      width: "100%",
      padding: "10px 40px 10px 15px",
      border: "1px solid #bdc3c7",
      borderRadius: "4px",
      fontSize: "1rem",
    },
    searchIcon: {
      position: "absolute" as const,
      right: "15px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#7f8c8d",
    },
    filterButtons: {
      display: "flex",
      gap: "10px",
    },
    filterBtn: (isActive: boolean) => ({
      padding: "8px 16px",
      border: "1px solid #bdc3c7",
      background: isActive ? "#3498db" : "white",
      color: isActive ? "white" : "#2c3e50",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.3s",
    }),
    btn: {
      padding: "10px 20px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      transition: "all 0.3s",
    },
    btnPrimary: {
      background: "#3498db",
      color: "white",
    },
    btnOutline: {
      background: "transparent",
      border: "1px solid #bdc3c7",
      color: "#2c3e50",
    },
    btnSuccess: {
      background: "#27ae60",
      color: "white",
    },
    btnWarning: {
      background: "#f39c12",
      color: "white",
    },
    warehousesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
      gap: "20px",
      marginBottom: "30px",
    },
    warehouseCard: (isActive: boolean) => ({
      background: "white",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      borderLeft: `4px solid ${isActive ? "#3498db" : "#bdc3c7"}`,
      transition: "transform 0.3s, box-shadow 0.3s",
      opacity: isActive ? 1 : 0.7,
    }),
    warehouseHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "15px",
    },
    warehouseName: {
      fontSize: "1.2rem",
      fontWeight: 600,
      marginBottom: "5px",
    },
    warehouseAddress: {
      color: "#7f8c8d",
      fontSize: "0.9rem",
      marginBottom: "10px",
    },
    statusBadge: (isActive: boolean) => ({
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "0.8rem",
      fontWeight: 500,
      background: isActive ? "#d4edda" : "#f8d7da",
      color: isActive ? "#155724" : "#721c24",
    }),
    warehouseStats: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginBottom: "15px",
    },
    statItem: {
      display: "flex",
      flexDirection: "column" as const,
    },
    statValue: {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#3498db",
    },
    statLabel: {
      fontSize: "0.8rem",
      color: "#7f8c8d",
    },
    warehouseActions: {
      display: "flex",
      gap: "8px",
      marginTop: "15px",
    },
    actionBtn: {
      padding: "8px 12px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontWeight: 500,
      display: "flex",
      alignItems: "center",
      fontSize: "0.9rem",
    },
    errorAlert: {
      color: "#e74c3c",
      backgroundColor: "#ffe6e6",
      padding: "10px",
      borderRadius: "4px",
      marginBottom: "20px",
    },
  };

  return (
    <div>
      {/* Панель управления */}
      <div style={styles.controlsPanel}>
        <div style={styles.searchBox}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию склада..."
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterButtons}>
          <button
            style={styles.filterBtn(activeFilter === "all")}
            onClick={() => setActiveFilter("all")}
          >
            Все склады
          </button>
          <button
            style={styles.filterBtn(activeFilter === "active")}
            onClick={() => setActiveFilter("active")}
          >
            Активные
          </button>
          <button
            style={styles.filterBtn(activeFilter === "inactive")}
            onClick={() => setActiveFilter("inactive")}
          >
            Неактивные
          </button>
        </div>
        <button
          style={{ ...styles.btn, ...styles.btnPrimary }}
          onClick={() => setShowCreateForm(true)}
        >
          <span style={{ marginRight: "8px" }}>➕</span>
          Добавить склад
        </button>
      </div>

      {/* Сообщение об ошибке */}
      {error && <div style={styles.errorAlert}>Ошибка: {error}</div>}

      {/* Сетка складов */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Загрузка складов...
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          <p>Склады не найдены</p>
          <p>Добавьте первый склад</p>
        </div>
      ) : (
        <div style={styles.warehousesGrid}>
          {filteredWarehouses.map((warehouse) => (
            <div
              key={warehouse.id}
              style={styles.warehouseCard(warehouse.isActive)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
              }}
            >
              <div style={styles.warehouseHeader}>
                <div>
                  <div style={styles.warehouseName}>{warehouse.name}</div>
                  <div style={styles.warehouseAddress}>
                    {warehouse.address || "Адрес не указан"}
                  </div>
                </div>
                <span style={styles.statusBadge(warehouse.isActive)}>
                  {warehouse.isActive ? "Активен" : "Неактивен"}
                </span>
              </div>

              <div style={styles.warehouseStats}>
                <div style={styles.statItem}>
                  <span style={styles.statValue}>
                    {getWarehouseStats(warehouse.id).productsCount}
                  </span>
                  <span style={styles.statLabel}>Товаров</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statValue}>
                    {getWarehouseStats(warehouse.id).documentsCount}
                  </span>
                  <span style={styles.statLabel}>Документов</span>
                </div>
              </div>

              {warehouse.description && (
                <div
                  style={{
                    marginBottom: "15px",
                    fontSize: "0.9rem",
                    color: "#666",
                  }}
                >
                  {warehouse.description}
                </div>
              )}

              <div style={styles.warehouseActions}>
                <button
                  style={{ ...styles.actionBtn, ...styles.btnOutline }}
                  onClick={() => setEditingWarehouse(warehouse)}
                  title="Редактировать"
                >
                  <span style={{ marginRight: "4px" }}>✏️</span>
                  Редакт.
                </button>
                {warehouse.isActive ? (
                  <button
                    style={{ ...styles.actionBtn, ...styles.btnWarning }}
                    onClick={() => handleToggleActive(warehouse)}
                    title="Деактивировать"
                  >
                    <span style={{ marginRight: "4px" }}>⏸️</span>
                    Деактив.
                  </button>
                ) : (
                  <button
                    style={{ ...styles.actionBtn, ...styles.btnSuccess }}
                    onClick={() => handleToggleActive(warehouse)}
                    title="Активировать"
                  >
                    <span style={{ marginRight: "4px" }}>▶️</span>
                    Актив.
                  </button>
                )}
                <button
                  style={{ ...styles.actionBtn, ...styles.btnOutline }}
                  onClick={() => handleDelete(warehouse.id)}
                  title="Удалить"
                >
                  <span style={{ marginRight: "4px" }}>🗑️</span>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Форма создания */}
      {showCreateForm && (
        <WarehouseForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            setShowCreateForm(false);
            if (currentOrganization) {
              loadWarehouses({ organizationId: currentOrganization.id });
            }
          }}
        />
      )}

      {/* Форма редактирования */}
      {editingWarehouse && (
        <WarehouseForm
          warehouse={editingWarehouse}
          onClose={() => setEditingWarehouse(null)}
          onSave={() => {
            setEditingWarehouse(null);
            if (currentOrganization) {
              loadWarehouses({ organizationId: currentOrganization.id });
            }
          }}
        />
      )}
    </div>
  );
};

export default WarehouseListPage;
