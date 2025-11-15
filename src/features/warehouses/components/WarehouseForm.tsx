import React, { useState, useEffect } from "react";
import {
  Warehouse,
  WarehouseCreateRequest,
  WarehouseUpdateRequest,
} from "../../../types/warehouse";
import { useWarehouseStore } from "../../../store/warehouse-store";
import { useOrganizationStore } from "../../../store/organization-store";

interface WarehouseFormProps {
  warehouse?: Warehouse | null;
  onClose: () => void;
  onSave: () => void;
}

const WarehouseForm: React.FC<WarehouseFormProps> = ({
  warehouse,
  onClose,
  onSave,
}) => {
  const { createWarehouse, updateWarehouse, loading } = useWarehouseStore();
  const { currentOrganization } = useOrganizationStore();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        address: warehouse.address || "",
        description: warehouse.description || "",
        isActive: warehouse.isActive,
      });
    }
  }, [warehouse]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    if (!currentOrganization) {
      newErrors.organization = "Организация не выбрана";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (warehouse) {
        const updateData: WarehouseUpdateRequest = {
          id: warehouse.id,
          name: formData.name,
          address: formData.address || undefined,
          isActive: formData.isActive,
          organizationId: currentOrganization!.id,
        };
        await updateWarehouse(warehouse.id, updateData);
      } else {
        const warehouseData: WarehouseCreateRequest = {
          name: formData.name,
          address: formData.address || undefined,
          description: formData.description || undefined,
          isActive: formData.isActive,
          organizationId: currentOrganization!.id,
        };
        await createWarehouse(warehouseData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Ошибка при сохранении склада:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Произошла ошибка при сохранении склада");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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
          width: 500,
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <h3>{warehouse ? "Редактирование склада" : "Создание склада"}</h3>

        <form onSubmit={handleSubmit}>
          {/* Название склада */}
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Название склада *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: `1px solid ${errors.name ? "red" : "#ccc"}`,
                borderRadius: 4,
              }}
              placeholder="Введите название склада"
            />
            {errors.name && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.name}
              </div>
            )}
          </div>

          {/* Адрес */}
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Адрес
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
              placeholder="Введите адрес склада"
            />
          </div>

          {/* Описание */}
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4,
                resize: "vertical",
              }}
              placeholder="Введите описание склада"
            />
          </div>

          {/* Статус активности */}
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontWeight: "bold",
              }}
            >
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                style={{ width: 16, height: 16 }}
              />
              Активный склад
            </label>
            <div style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
              Неактивные склады нельзя использовать в документах
            </div>
          </div>

          {/* Информация об организации */}
          {currentOrganization && (
            <div
              style={{
                backgroundColor: "#e9ecef",
                padding: 15,
                borderRadius: 4,
                marginBottom: 20,
              }}
            >
              <strong>Организация:</strong> {currentOrganization.name}
              <br />
              <strong>ИНН:</strong> {currentOrganization.inn}
            </div>
          )}

          {/* Ошибки */}
          {errors.organization && (
            <div style={{ color: "red", fontSize: 14, marginBottom: 15 }}>
              {errors.organization}
            </div>
          )}

          {/* Кнопки */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || !currentOrganization}
              style={{
                padding: "10px 20px",
                backgroundColor: !currentOrganization ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Сохранение..." : warehouse ? "Обновить" : "Создать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseForm;
