import React from "react";
import { Product } from "../../../types/product";
import "./ProductTable.scss";

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="table-loading">
        <div>Загрузка товаров...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-empty">
        <p>Товары не найдены</p>
        <p>Добавьте первый товар</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th style={{ width: "50px" }}>#</th>
            <th>Название</th>
            <th>Штрих-код</th>
            <th style={{ width: "80px" }}>Ед. изм.</th> {/* ← ДОБАВИЛИ */}
            <th>Описание</th>
            <th style={{ width: "120px" }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={product.id}>
              <td>{index + 1}</td>
              <td>
                <div className="product-name">
                  <strong>{product.name}</strong>
                  {!product.isActive && (
                    <span className="status-inactive">(неактивен)</span>
                  )}
                </div>
              </td>
              <td>
                {product.barcode ? (
                  <span className="barcode">{product.barcode}</span>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {product.unit || "шт."} {/* ← ДОБАВИЛИ */}
              </td>
              <td>{product.description || "-"}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => onEdit(product)}
                    className="btn btn-edit btn-sm"
                    title="Редактировать"
                  >
                    <span className="btn-icon">✏️</span>
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="btn btn-delete btn-sm"
                    title="Удалить"
                  >
                    <span className="btn-icon">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
