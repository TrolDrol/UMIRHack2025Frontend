import React, { useState, useEffect } from "react";
import { Organization } from "../../../types/api";
import { useOrganizationStore } from "../../../store/organization-store";

interface OrganizationFormProps {
  organization?: Organization | null;
  onClose: () => void;
  onSave: () => void;
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({
  organization,
  onClose,
  onSave,
}) => {
  const { createOrganization, updateOrganization, loading } =
    useOrganizationStore();
  const [formData, setFormData] = useState({
    name: "",
    inn: "",
    address: "",
    phone: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        inn: organization.inn || "",
        address: organization.address || "",
        phone: organization.phone || "",
      });
    }
  }, [organization]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    if (!formData.inn.trim()) {
      newErrors.inn = "ИНН обязателен";
    } else if (!/^\d{10,12}$/.test(formData.inn)) {
      newErrors.inn = "ИНН должен содержать 10 или 12 цифр";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Адрес обязателен";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Телефон обязателен";
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
      if (organization) {
        await updateOrganization(organization.id, formData);
      } else {
        await createOrganization(formData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      // Проверяем ошибку дублирования ИНН
      const errorDetails = error.response?.data?.details || "";
      const isDuplicateINN =
        errorDetails.includes("IX_organizations_inn") ||
        errorDetails.includes("duplicate key value violates unique constraint");

      if (isDuplicateINN) {
        // Показываем диалоговое окно
        alert("Организация с таким ИНН уже зарегистрирована");
        // Или устанавливаем ошибку для поля
        setErrors({ inn: "Организация с таким ИНН уже зарегистрирована" });
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Произошла ошибка при сохранении");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        <h3>
          {organization ? "Редактирование организации" : "Создание организации"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Название организации *
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
              placeholder="Введите название организации"
            />
            {errors.name && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.name}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              ИНН *
            </label>
            <input
              type="text"
              name="inn"
              value={formData.inn}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: `1px solid ${errors.inn ? "red" : "#ccc"}`,
                borderRadius: 4,
              }}
              placeholder="Введите ИНН (10 или 12 цифр)"
            />
            {errors.inn && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.inn}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 15 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Адрес *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: `1px solid ${errors.address ? "red" : "#ccc"}`,
                borderRadius: 4,
                resize: "vertical",
              }}
              placeholder="Введите юридический адрес"
            />
            {errors.address && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.address}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
            >
              Телефон *
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: 10,
                fontSize: 16,
                border: `1px solid ${errors.phone ? "red" : "#ccc"}`,
                borderRadius: 4,
              }}
              placeholder="Введите телефон"
            />
            {errors.phone && (
              <div style={{ color: "red", fontSize: 14, marginTop: 5 }}>
                {errors.phone}
              </div>
            )}
          </div>

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
              disabled={loading}
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading
                ? "Сохранение..."
                : organization
                ? "Обновить"
                : "Создать"}
            </button>
          </div>
          {errors.general && (
            <div
              style={{
                color: "red",
                fontSize: 14,
                marginTop: 10,
                padding: 10,
                backgroundColor: "#ffe6e6",
                borderRadius: 4,
              }}
            >
              {errors.general}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrganizationForm;
