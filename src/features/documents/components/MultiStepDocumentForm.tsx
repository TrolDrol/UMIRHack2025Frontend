import React, { useState, useEffect } from "react";
import {
  Document,
  DocumentCreateRequest,
  DocumentType,
  DocumentItem,
} from "../../../types/document";
import { useDocumentStore } from "../../../store/document-store";
import { useOrganizationStore } from "../../../store/organization-store";
import { useWarehouseStore } from "../../../store/warehouse-store";
import { useProductStore } from "../../../store/product-store";
import { Product } from "../../../types/product";
import { Warehouse } from "../../../types/warehouse";

interface MultiStepDocumentFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface DocumentItemWithProduct extends DocumentItem {
  product?: Product;
  scannedQuantity: number;
}

const MultiStepDocumentForm: React.FC<MultiStepDocumentFormProps> = ({
  onClose,
  onSave,
}) => {
  const { createDocument, loading } = useDocumentStore();
  const { currentOrganization } = useOrganizationStore();
  const { warehouses, loadWarehouses } = useWarehouseStore();
  const { products, loadProducts } = useProductStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: DocumentType.Inventory,
    description: "",
    warehouseId: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<
    DocumentItemWithProduct[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Загружаем склады и товары при монтировании
  useEffect(() => {
    if (currentOrganization) {
      loadWarehouses({ organizationId: currentOrganization.id });
      loadProducts({ organizationId: currentOrganization.id });
    }
  }, [currentOrganization, loadWarehouses, loadProducts]);

  // Фильтруем товары для поиска
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  // Добавление товара в документ
  const handleAddProduct = (product: Product) => {
    const existingItem = selectedProducts.find(
      (item) => item.productId === product.id
    );

    if (!existingItem) {
      const newItem: DocumentItemWithProduct = {
        id: 0,
        documentId: 0,
        productId: product.id,
        productName: product.name,
        productBarcode: product.barcode,
        quantity: 0,
        scannedQuantity: 0,
        difference: 0,
        product: product,
      };
      setSelectedProducts([...selectedProducts, newItem]);
    }
  };

  // Обновление количества товара
  const handleUpdateQuantity = (
    productId: number,
    field: "quantity" | "scannedQuantity",
    value: number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? {
              ...item,
              [field]: value,
              difference:
                field === "scannedQuantity"
                  ? value - item.quantity
                  : item.scannedQuantity - value,
            }
          : item
      )
    );
  };

  // Удаление товара из документа
  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  };

  // Валидация формы
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!currentOrganization) {
      newErrors.organization = "Организация не выбрана";
    }

    if (step === 1 && !formData.warehouseId) {
      newErrors.warehouseId = "Выберите склад";
    }

    if (step === 2 && selectedProducts.length === 0) {
      newErrors.products = "Добавьте хотя бы один товар";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Сохранение как черновик - ИСПОЛЬЗУЕМ STORE КАК В DocumentForm!
  const handleSaveDraft = async () => {
    if (!validateForm()) return;

    try {
      // 1. Создаем основной документ через STORE (как в DocumentForm)
      const documentData: DocumentCreateRequest = {
        type: formData.type,
        organizationId: currentOrganization!.id,
        description: formData.description || undefined,
        warehouseId: formData.warehouseId
          ? Number(formData.warehouseId)
          : undefined,
        documentDate: new Date().toISOString(),
      };

      console.log(
        "📤 Отправляемые данные документа:",
        JSON.stringify(documentData, null, 2)
      );

      // ИСПОЛЬЗУЕМ STORE вместо прямого fetch!
      const newDocument = await createDocument(documentData);
      console.log("✅ Документ создан:", newDocument);

      // 2. Добавляем товары в документ (пока пропустим эту часть для теста)
      console.log("📦 Пропускаем добавление товаров для теста...");

      // 3. Для теста - просто закрываем форму
      console.log("🎉 Документ-черновик успешно создан!");
      onSave();
      onClose();
    } catch (error: any) {
      console.error("❌ Ошибка при создании документа:", error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Произошла ошибка при сохранении документа");
      }
    }
  };

  // Добавь эту функцию для обновления статуса
  // В DocumentListPage.tsx обнови функцию updateDocumentStatus:
  const updateDocumentStatus = async (documentId: number, status: string) => {
    try {
      console.log(`🔄 Отправляем запрос на обновление статуса:`, {
        documentId,
        status,
        url: `http://localhost:5039/api/documents/${documentId}/status`,
      });

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

      console.log(`📊 Ответ сервера:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Текст ошибки:", errorText);
        throw new Error(
          `Ошибка обновления статуса: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("✅ Успешный ответ:", result);
      return result;
    } catch (error) {
      console.error("❌ Ошибка при обновлении статуса:", error);
      throw error;
    }
  };

  // Обнови handleComplete
  const handleComplete = async () => {
    if (!validateForm()) return;

    try {
      // 1. Создаем основной документ
      const documentData: DocumentCreateRequest = {
        type: formData.type,
        organizationId: currentOrganization!.id,
        description: formData.description || undefined,
        warehouseId: formData.warehouseId
          ? Number(formData.warehouseId)
          : undefined,
        documentDate: new Date().toISOString(),
      };

      console.log("📤 Создаем документ для завершения:", documentData);

      const newDocument = await createDocument(documentData);
      console.log("✅ Документ создан:", newDocument);

      // 2. Добавляем товары
      if (selectedProducts.length > 0) {
        console.log(`📦 Добавляем ${selectedProducts.length} товаров...`);

        for (const item of selectedProducts) {
          try {
            await fetch(
              `http://localhost:5039/api/documents/${newDocument.id}/items`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  documentId: newDocument.id,
                  productId: item.productId,
                  quantityExpected: item.quantity || 0,
                  quantityActual: item.scannedQuantity || 0,
                }),
              }
            );
          } catch (error) {
            console.error(
              `❌ Ошибка при добавлении товара ${item.productId}:`,
              error
            );
          }
        }
      }

      // 3. Меняем статус на "в работе"
      console.log("🔄 Меняем статус на 'in_progress'...");
      await updateDocumentStatus(newDocument.id, "in_progress");
      console.log("✅ Статус изменен на 'в работе'");

      console.log("🎉 Документ успешно создан и завершен!");
      onSave();
      onClose();
    } catch (error: any) {
      console.error("❌ Ошибка при завершении документа:", error);
      alert(`Ошибка: ${error.message}`);
    }
  };

  // Шаг 1: Выбор типа документа и склада
  const Step1 = () => (
    <div>
      <h3>Шаг 1: Основные данные документа</h3>

      {/* Тип документа */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
        >
          Тип документа *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              type: Number(e.target.value) as DocumentType,
            }))
          }
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          <option value={DocumentType.Inventory}>Инвентаризация</option>
          <option value={DocumentType.Receipt}>Приход</option>
          <option value={DocumentType.WriteOff}>Списание</option>
          <option value={DocumentType.Transfer}>Перемещение</option>
        </select>
      </div>

      {/* Выбор склада */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
        >
          Склад *
        </label>
        <select
          name="warehouseId"
          value={formData.warehouseId}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              warehouseId: e.target.value,
            }))
          }
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        >
          <option value="">Выберите склад</option>
          {warehouses
            .filter((wh) => wh.isActive)
            .map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name} {warehouse.address && `- ${warehouse.address}`}
              </option>
            ))}
        </select>
        {errors.warehouseId && (
          <div style={{ color: "red", fontSize: 12 }}>{errors.warehouseId}</div>
        )}
      </div>

      {/* Описание */}
      <div style={{ marginBottom: 20 }}>
        <label
          style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
        >
          Описание
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          rows={3}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 16,
            border: "1px solid #ccc",
            borderRadius: 4,
            resize: "vertical",
          }}
          placeholder="Введите описание документа"
        />
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
          Отмена
        </button>
        <button
          onClick={() => validateForm() && setStep(2)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Далее
        </button>
      </div>
    </div>
  );

  // Шаг 2: Добавление товаров
  const Step2 = () => (
    <div style={{ display: "flex", gap: 20, minHeight: 400 }}>
      {/* Левая часть - поиск и список товаров */}
      <div style={{ flex: 1 }}>
        <h4>Доступные товары</h4>

        {/* Поиск */}
        <div style={{ marginBottom: 15 }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или штрих-коду..."
            style={{
              width: "100%",
              padding: 8,
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          />
        </div>

        {/* Список товаров */}
        <div style={{ maxHeight: 300, overflow: "auto" }}>
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                padding: 10,
                border: "1px solid #ddd",
                marginBottom: 5,
                borderRadius: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div>
                  <strong>{product.name}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {product.barcode && `Штрих-код: ${product.barcode}`} •{" "}
                  {product.unit}
                </div>
              </div>
              <button
                onClick={() => handleAddProduct(product)}
                disabled={selectedProducts.some(
                  (item) => item.productId === product.id
                )}
                style={{
                  padding: "5px 10px",
                  backgroundColor: selectedProducts.some(
                    (item) => item.productId === product.id
                  )
                    ? "#ccc"
                    : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: selectedProducts.some(
                    (item) => item.productId === product.id
                  )
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {selectedProducts.some((item) => item.productId === product.id)
                  ? "Добавлен"
                  : "Добавить"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Правая часть - выбранные товары */}
      <div style={{ flex: 1 }}>
        <h4>Товары в документе ({selectedProducts.length})</h4>

        {selectedProducts.map((item) => (
          <div
            key={item.productId}
            style={{
              padding: 10,
              border: "1px solid #ddd",
              marginBottom: 10,
              borderRadius: 4,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div>
                  <strong>{item.productName}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {item.productBarcode && `Штрих-код: ${item.productBarcode}`} •{" "}
                  {item.product?.unit}
                </div>
              </div>
              <button
                onClick={() => handleRemoveProduct(item.productId)}
                style={{
                  background: "none",
                  border: "none",
                  color: "red",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <div>
                <label style={{ fontSize: 12 }}>Ожидаемое</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleUpdateQuantity(
                      item.productId,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  style={{
                    width: 80,
                    padding: 5,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Фактическое</label>
                <input
                  type="number"
                  value={item.scannedQuantity}
                  onChange={(e) =>
                    handleUpdateQuantity(
                      item.productId,
                      "scannedQuantity",
                      Number(e.target.value)
                    )
                  }
                  style={{
                    width: 80,
                    padding: 5,
                    border: "1px solid #ccc",
                    borderRadius: 4,
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12 }}>Разница</label>
                <div
                  style={{
                    padding: 5,
                    width: 80,
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: 4,
                    background: "#f8f9fa",
                    color: item.difference === 0 ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.difference}
                </div>
              </div>
            </div>
          </div>
        ))}

        {errors.products && (
          <div style={{ color: "red", fontSize: 12 }}>{errors.products}</div>
        )}
      </div>
    </div>
  );

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
          width: 900,
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>Создание документа</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <div
              style={{
                padding: "5px 10px",
                background: step === 1 ? "#007bff" : "#e9ecef",
                color: step === 1 ? "white" : "#666",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              Шаг 1
            </div>
            <div
              style={{
                padding: "5px 10px",
                background: step === 2 ? "#007bff" : "#e9ecef",
                color: step === 2 ? "white" : "#666",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              Шаг 2
            </div>
          </div>
        </div>

        {step === 1 && <Step1 />}
        {step === 2 && (
          <>
            <Step2 />
            <div
              style={{
                display: "flex",
                gap: 10,
                justifyContent: "flex-end",
                marginTop: 20,
              }}
            >
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  background: "white",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Назад
              </button>
              <button
                onClick={handleSaveDraft}
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
                {loading ? "Сохранение..." : "Сохранить черновик"}
              </button>
              <button
                onClick={handleComplete}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Сохранение..." : "Завершить"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MultiStepDocumentForm;
