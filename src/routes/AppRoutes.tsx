import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import LoginForm from "../features/auth/components/LoginForm";
import ProductListPage from "../features/products/pages/ProductListPage";
import DocumentListPage from "../features/documents/pages/DocumentListPage";
import WarehouseListPage from "../features/warehouses/pages/WarehouseListPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import { useAuthStore } from "../store/auth-store";

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Публичные маршруты */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginForm /> : <Navigate to="/" replace />}
      />

      {/* Защищенные маршруты */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Layout>
              <DashboardPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/warehouses"
        element={
          isAuthenticated ? (
            <Layout>
              <WarehouseListPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/products"
        element={
          isAuthenticated ? (
            <Layout>
              <ProductListPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/documents"
        element={
          isAuthenticated ? (
            <Layout>
              <DocumentListPage />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/inventory"
        element={
          isAuthenticated ? (
            <Layout>
              <div style={{ padding: 20, textAlign: "center" }}>
                <h2>Инвентаризация</h2>
                <p>Раздел в разработке</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/mobile-sessions"
        element={
          isAuthenticated ? (
            <Layout>
              <div style={{ padding: 20, textAlign: "center" }}>
                <h2>Мобильные сессии</h2>
                <p>Раздел в разработке</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/reports"
        element={
          isAuthenticated ? (
            <Layout>
              <div style={{ padding: 20, textAlign: "center" }}>
                <h2>Отчеты</h2>
                <p>Раздел в разработке</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <Layout>
              <div style={{ padding: 20, textAlign: "center" }}>
                <h2>Настройки</h2>
                <p>Раздел в разработке</p>
              </div>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 страница */}
      <Route path="*" element={<div>Страница не найдена</div>} />
    </Routes>
  );
};

export default AppRoutes;
