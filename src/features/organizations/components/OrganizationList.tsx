import React, { useEffect, useState } from "react";
import { useOrganizationStore } from "../../../store/organization-store";
import { Organization } from "../../../types/api";
import OrganizationForm from "./OrganizationForm";

const OrganizationList: React.FC = () => {
  const { organizations, loading, loadOrganizations, deleteOrganization } =
    useOrganizationStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить организацию?")) {
      try {
        await deleteOrganization(id);
      } catch (error) {
        // Ошибка уже обработана в store
      }
    }
  };

  if (loading) {
    return <div>Загрузка организаций...</div>;
  }

  //if (error) {
  //  return <div style={{ color: "red" }}>Ошибка: {error}</div>;
  //}

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
        <h1>Организации</h1>
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
          + Добавить организацию
        </button>
      </div>

      {organizations.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
          <p>Нет организаций</p>
          <p>Создайте первую организацию для начала работы</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 15 }}>
          {organizations.map((org) => (
            <div
              key={org.id}
              style={{
                padding: 20,
                backgroundColor: "white",
                borderRadius: 8,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                border: "1px solid #dee2e6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 10px 0" }}>{org.name}</h3>
                  <div style={{ color: "#666", fontSize: 14 }}>
                    <p>
                      <strong>ИНН:</strong> {org.inn}
                    </p>
                    <p>
                      <strong>Адрес:</strong> {org.address}
                    </p>
                    <p>
                      <strong>Телефон:</strong> {org.phone}
                    </p>
                    {org.userRole && (
                      <p>
                        <strong>Роль:</strong> {org.userRole}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setEditingOrg(org)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Форма создания */}
      {showCreateForm && (
        <OrganizationForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            setShowCreateForm(false);
            loadOrganizations(); // Перезагружаем список
          }}
        />
      )}

      {/* Форма редактирования */}
      {editingOrg && (
        <OrganizationForm
          organization={editingOrg}
          onClose={() => setEditingOrg(null)}
          onSave={() => {
            setEditingOrg(null);
            loadOrganizations(); // Перезагружаем список
          }}
        />
      )}
    </div>
  );
};

export default OrganizationList;
