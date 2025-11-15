import React, { useEffect, useState } from "react";
import { useProductStore } from "../../../store/product-store";
import { useOrganizationStore } from "../../../store/organization-store";
import { useProductListStore } from "../../../store/product-list-store";
import { Product } from "../../../types/product";
import ProductTable from "../components/ProductTable";
import ProductForm from "../components/ProductForm";
import "./ProductListPage.scss";
import { useLocation } from "react-router-dom";

const ProductListPage: React.FC = () => {
  const location = useLocation();
  const { products, loading, loadProducts, deleteProduct } = useProductStore();

  const { currentOrganization, setCurrentOrganization } =
    useOrganizationStore();

  const { organizationOptions, loadOrganizationOptions } =
    useProductListStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Загружаем опции организаций при монтировании компонента
  useEffect(() => {
    if (location.state?.action === "setShowCreateForm") {
      setShowCreateForm(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadOrganizationOptions();
  }, [loadOrganizationOptions]);

  useEffect(() => {
    if (currentOrganization) {
      loadProducts({ organizationId: currentOrganization.id });
    }
  }, [loadProducts, currentOrganization]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить товар?")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Ошибка при удалении товара:", error);
      }
    }
  };

  const handleOrganizationChange = (orgId: number) => {
    const selectedOrg = organizationOptions.find((opt) => opt.value === orgId);
    if (selectedOrg) {
      // Для product-list нам достаточно базовой информации
      setCurrentOrganization({
        id: selectedOrg.value,
        name: selectedOrg.label,
        inn: "",
        address: "",
        phone: "",
      });
    }
  };

  const handleRefresh = () => {
    if (currentOrganization) {
      loadProducts({ organizationId: currentOrganization.id });
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode && product.barcode.includes(searchTerm))
  );

  // Пагинация - ДОБАВЬ ЭТО
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Сбрасываем на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentOrganization]);

  if (!currentOrganization) {
    return (
      <div className="no-organization">
        <p>Выберите организацию для работы с товарами</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Остальной код остается таким же */}
      <div className="controls-panel">
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или штрих-коду..."
          />
        </div>
        <div className="pagination-controls-top">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={5}>5 на странице</option>
            <option value={10}>10 на странице</option>
            <option value={20}>20 на странице</option>
          </select>
        </div>
        <div className="controls-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <span className="btn-icon">➕</span> Добавить товар
          </button>
        </div>
      </div>

      {/* Таблица товаров */}
      <div className="products-table-container">
        <div className="table-header">
          <h3>Список товаров ({filteredProducts.length})</h3>
          <div className="table-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <span className="btn-icon">🔄</span> Обновить
            </button>
          </div>
        </div>

        <ProductTable
          products={currentProducts}
          onEdit={setEditingProduct}
          onDelete={handleDelete}
          loading={loading}
        />

        <div className="pagination">
          <div className="pagination-info">
            Показано {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredProducts.length)} из{" "}
            {filteredProducts.length} товаров
          </div>
          <div className="pagination-controls">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Назад
            </button>

            {/* Показываем номера страниц */}
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Вперед →
            </button>
          </div>
        </div>
      </div>

      {/* Формы */}
      {showCreateForm && (
        <ProductForm
          onClose={() => setShowCreateForm(false)}
          onSave={() => {
            setShowCreateForm(false);
            handleRefresh();
          }}
        />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={() => {
            setEditingProduct(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
};

export default ProductListPage;
