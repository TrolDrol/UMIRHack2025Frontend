import React, { useState, useEffect } from "react";
import {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "../../../types/product";
import { useProductStore } from "../../../store/product-store";
import { useOrganizationStore } from "../../../store/organization-store";
import { useProductListStore } from "../../../store/product-list-store"; // Добавляем новый store
import "./ProductForm.scss";

interface ProductFormProps {
  product?: Product | null;
  onClose: () => void;
  onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onClose,
  onSave,
}) => {
  const { createProduct, updateProduct, loading } = useProductStore();
  const { currentOrganization } = useOrganizationStore();
  const { organizationOptions, loadOrganizationOptions } =
    useProductListStore(); // Используем новый store

  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    description: "",
    unit: "piece",
    category: "",
    organizationId: currentOrganization?.id.toString() || "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadOrganizationOptions();
  }, [loadOrganizationOptions]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        barcode: product.barcode || "",
        description: product.description || "",
        unit: mapUnitToSelectValue(product.unit) || "piece",
        category: "",
        organizationId: product.organizationId.toString(),
      });
    } else if (currentOrganization) {
      setFormData((prev) => ({
        ...prev,
        organizationId: currentOrganization.id.toString(),
      }));
    }
  }, [product, currentOrganization, organizationOptions]);

  // Вспомогательная функция для преобразования единиц измерения
  const mapUnitToSelectValue = (unit: string): string => {
    const unitMap: { [key: string]: string } = {
      "шт.": "piece",
      "кор.": "box",
      кг: "kg",
      м: "meter",
    };
    return unitMap[unit] || "piece";
  };

  // Вспомогательная функция для преобразования обратно
  const mapUnitFromSelectValue = (selectValue: string): string => {
    const unitMap: { [key: string]: string } = {
      piece: "шт.",
      box: "кор.",
      kg: "кг",
      meter: "м",
    };
    return unitMap[selectValue] || "шт.";
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }

    if (!formData.barcode.trim()) {
      newErrors.barcode = "Штрих-код обязателен";
    }

    if (!formData.organizationId) {
      newErrors.organizationId = "Организация обязательна";
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
      const productData: ProductCreateRequest = {
        name: formData.name,
        barcode: formData.barcode,
        description: formData.description || undefined,
        unit: mapUnitFromSelectValue(formData.unit),
        isActive: true,
        organizationId: Number(formData.organizationId),
      };

      if (product) {
        const updateData: ProductUpdateRequest = {
          id: product.id,
          name: formData.name,
          barcode: formData.barcode,
          description: formData.description || undefined,
          unit: mapUnitFromSelectValue(formData.unit),
          isActive: true,
          organizationId: Number(formData.organizationId),
        };
        await updateProduct(product.id, updateData);
      } else {
        await createProduct(productData);
      }
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Ошибка при создании товара:", error);
      const errorDetails = error.response?.data?.details || "";
      if (
        errorDetails.includes("barcode") ||
        errorDetails.includes("duplicate")
      ) {
        alert("Товар с таким штрих-кодом уже существует в этой организации");
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Произошла ошибка при сохранении товара");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{product ? "Редактирование товара" : "Добавить новый товар"}</h3>
          <button className="close" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <form id="productForm" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productName">Название товара *</label>
                <input
                  type="text"
                  id="productName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`form-control ${errors.name ? "error" : ""}`}
                  required
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="productBarcode">Штрих-код *</label>
                <input
                  type="text"
                  id="productBarcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className={`form-control ${errors.barcode ? "error" : ""}`}
                  required
                />
                {errors.barcode && (
                  <div className="error-message">{errors.barcode}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="productDescription">Описание</label>
              <textarea
                id="productDescription"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="productCategory">Категория</label>
                <select
                  id="productCategory"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Выберите категорию</option>
                  <option value="electronics">Электроника</option>
                  <option value="office">Офисная техника</option>
                  <option value="furniture">Мебель</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="productUnit">Единица измерения</label>
                <select
                  id="productUnit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="piece">Штука</option>
                  <option value="box">Коробка</option>
                  <option value="kg">Килограмм</option>
                  <option value="meter">Метр</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="productOrganization">Организация *</label>
              <select
                id="productOrganization"
                name="organizationId"
                value={formData.organizationId}
                onChange={handleChange}
                className={`form-control ${
                  errors.organizationId ? "error" : ""
                }`}
                required
              >
                <option value="">Выберите организацию</option>
                {organizationOptions.map((org) => (
                  <option key={org.value} value={org.value}>
                    {org.label}
                  </option>
                ))}
              </select>
              {errors.organizationId && (
                <div className="error-message">{errors.organizationId}</div>
              )}
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button
            className="btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Сохранение..."
              : product
              ? "Обновить"
              : "Сохранить товар"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
