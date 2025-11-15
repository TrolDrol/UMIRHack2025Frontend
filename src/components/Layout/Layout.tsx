import React, { useState, useEffect } from "react"; // ← ДОБАВЬТЕ useEffect
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth-store";
import OrganizationSelector from "./OrganizationSelector";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false);
    };

    if (isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const menuItems = [
    { path: "/", label: "Главная", icon: "📊" },
    { path: "/products", label: "Товары", icon: "📦" },
    { path: "/warehouses", label: "Склады", icon: "🏢" },
    { path: "/documents", label: "Документы", icon: "📄" },
    { path: "/inventory", label: "Инвентаризация", icon: "🔍" },
    { path: "/mobile-sessions", label: "Мобильные сессии", icon: "📱" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      {/* Сайдбар */}
      <div
        style={{
          width: sidebarCollapsed ? 70 : 250,
          background: "#2c3e50",
          color: "white",
          height: "100vh",
          position: "fixed",
          overflowY: "auto",
          transition: "width 0.3s ease",
        }}
      >
        {/* Логотип */}
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {!sidebarCollapsed && (
            <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>
              Складской учет
            </h1>
          )}
          {sidebarCollapsed && <div style={{ fontSize: "1.5rem" }}>🏢</div>}
        </div>

        {/* Навигация */}
        <nav style={{ padding: "20px 0" }}>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                padding: sidebarCollapsed ? "12px 20px" : "12px 20px",
                cursor: "pointer",
                transition: "background 0.3s",
                textDecoration: "none",
                color: "white",
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                backgroundColor:
                  location.pathname === item.path ? "#3498db" : "transparent",
              }}
              onMouseOver={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }
              }}
              onMouseOut={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span
                style={{
                  marginRight: sidebarCollapsed ? 0 : 10,
                  width: 20,
                  textAlign: "center",
                  fontSize: "1.1rem",
                }}
              >
                {item.icon}
              </span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Кнопка свернуть/развернуть */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              padding: "8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarCollapsed ? 70 : 250,
          padding: "20px",
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* Хедер */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            paddingBottom: "15px",
            borderBottom: "1px solid #bdc3c7",
            position: "relative",
          }}
        >
          <h2 style={{ margin: 0, fontWeight: 500, color: "#2c3e50" }}>
            {getPageTitle(location.pathname)}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            {/* Селектор организации */}
            <OrganizationSelector />

            {/* Аватар пользователя с выпадающим меню */}
            <div style={{ position: "relative" }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen(!isUserMenuOpen);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#3498db",
                  border: "none",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {user ? getInitials(user.fullName) : "U"}
              </button>

              {/* Выпадающее меню */}
              {isUserMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 5,
                    background: "white",
                    border: "1px solid #bdc3c7",
                    borderRadius: 4,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    minWidth: 200,
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      padding: "15px",
                      borderBottom: "1px solid #f1f1f1",
                    }}
                  >
                    <div style={{ fontWeight: 500, color: "#2c3e50" }}>
                      {user?.fullName || "Пользователь"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#7f8c8d",
                        marginTop: 2,
                      }}
                    >
                      Товаровед
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "10px 15px",
                      background: "none",
                      border: "none",
                      color: "#e74c3c",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.9rem",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#f8f9fa")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Контент страницы */}
        <main>{children}</main>
      </div>
    </div>
  );
};

// Вспомогательная функция для получения заголовка страницы
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Главная панель";
    case "/products":
      return "Товары";
    case "/warehouses":
      return "Склады";
    case "/documents":
      return "Документы";
    case "/inventory":
      return "Инвентаризация";
    case "/mobile-sessions":
      return "Мобильные сессии";
    case "/reports":
      return "Отчеты";
    case "/settings":
      return "Настройки";
    default:
      return "Складской учет";
  }
};

export default Layout;
