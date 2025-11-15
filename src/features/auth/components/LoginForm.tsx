import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/auth-store";

type FormType = "login" | "register" | "forgot";

// Компонент модального окна для условий использования
interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    onClose();
    // Отправляем событие что условия приняты
    const event = new CustomEvent("termsAccepted");
    window.dispatchEvent(event);
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
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          padding: 30,
          maxWidth: 600,
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0, color: "#2c3e50" }}>Условия использования</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#7f8c8d",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ lineHeight: 1.6, color: "#2c3e50" }}>
          <h3 style={{ color: "#2c3e50", marginBottom: 15 }}>
            1. Общие положения
          </h3>
          <p style={{ marginBottom: 15 }}>
            Настоящие Условия использования регулируют отношения между
            Пользователем и Сервисом "Складской учет" в отношении использования
            веб-приложения и предоставляемых услуг.
          </p>

          <h3 style={{ color: "#2c3e50", marginBottom: 15 }}>
            2. Регистрация и учетная запись
          </h3>
          <p style={{ marginBottom: 15 }}>
            Для использования функционала системы требуется регистрация учетной
            записи. Пользователь обязуется предоставлять достоверную информацию
            при регистрации и поддерживать ее в актуальном состоянии.
          </p>

          <h3 style={{ color: "#2c3e50", marginBottom: 15 }}>
            3. Ответственность
          </h3>
          <p style={{ marginBottom: 15 }}>
            Пользователь несет ответственность за сохранность своих учетных
            данных. Все действия, совершенные с использованием учетной записи
            Пользователя, считаются совершенными самим Пользователем.
          </p>

          <h3 style={{ color: "#2c3e50", marginBottom: 15 }}>
            4. Обработка данных
          </h3>
          <p style={{ marginBottom: 15 }}>
            Сервис обрабатывает персональные данные в соответствии с Политикой
            конфиденциальности. Используя Сервис, Пользователь соглашается с
            условиями обработки его данных.
          </p>

          <h3 style={{ color: "#2c3e50", marginBottom: 15 }}>5. Ограничения</h3>
          <p style={{ marginBottom: 15 }}>
            Запрещается использование Сервиса для незаконной деятельности,
            распространения вредоносного программного обеспечения или нарушения
            прав третьих лиц.
          </p>

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: 15,
              borderRadius: 8,
              marginTop: 20,
            }}
          >
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#7f8c8d" }}>
              <strong>Дата последнего обновления:</strong> 2024 г.
              <br />
              По вопросам, связанным с условиями использования, обращайтесь в
              службу поддержки.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 25,
            gap: 10,
          }}
        >
          <button
            onClick={handleAccept}
            style={{
              padding: "10px 20px",
              background: "#3498db",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Принять условия
          </button>
        </div>
      </div>
    </div>
  );
};

// Основной компонент формы входа
const LoginForm: React.FC = () => {
  const { login, register, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeForm, setActiveForm] = useState<FormType>("login");
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Перенаправление если уже авторизован
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Обработка принятия условий из модального окна
  useEffect(() => {
    const handleTermsAccepted = () => {
      setAgreeTerms(true);
    };

    window.addEventListener("termsAccepted", handleTermsAccepted);

    return () => {
      window.removeEventListener("termsAccepted", handleTermsAccepted);
    };
  }, []);

  // Валидация email
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Проверка силы пароля
  const checkPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      if (name === "agreeTerms") setAgreeTerms(checked);
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));

    // Проверка силы пароля
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }

    // Очистка ошибок при изменении
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateLoginForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = "Пожалуйста, введите корректный email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль не может быть пустым";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Пожалуйста, введите ваше ФИО";
    }

    if (!validateEmail(formData.email)) {
      newErrors.email = "Пожалуйста, введите корректный email";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!agreeTerms) {
      newErrors.agreeTerms =
        "Пожалуйста, согласитесь с условиями использования";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateLoginForm()) return;

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || "Ошибка входа" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateRegisterForm()) return;

    try {
      // Используем реальную регистрацию через API
      await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      });

      // После успешной регистрации автоматически входим
      navigate("/");
    } catch (error: any) {
      setErrors({ submit: error.message || "Ошибка регистрации" });
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setErrors({ email: "Пожалуйста, введите корректный email" });
      return;
    }

    // Здесь будет логика восстановления пароля
    console.log("Восстановление пароля для:", formData.email);
    alert("Ссылка для восстановления пароля отправлена на ваш email!");

    setActiveForm("login");
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    maxWidth: 900,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
    overflow: "hidden",
    minHeight: 550,
  };

  const welcomeSectionStyle: React.CSSProperties = {
    flex: 1,
    background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    color: "white",
    padding: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  };

  const welcomeSectionBeforeStyle: React.CSSProperties = {
    content: '""',
    position: "absolute",
    top: "-50%",
    right: "-50%",
    width: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.1)",
    transform: "rotate(30deg)",
  };

  const authFormsStyle: React.CSSProperties = {
    flex: 1,
    padding: 40,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const formTabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: 12,
    textAlign: "center" as const,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.3s",
    borderBottom: `3px solid ${isActive ? "#3498db" : "transparent"}`,
    color: isActive ? "#3498db" : "#2c3e50",
  });

  const formPageStyle: React.CSSProperties = {
    display: activeForm === "login" ? "block" : "none",
    animation: "fadeIn 0.5s ease-in-out",
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "12px 15px",
    border: `2px solid ${hasError ? "#e74c3c" : "#bdc3c7"}`,
    borderRadius: 8,
    fontSize: "1rem",
    transition: "all 0.3s",
    background: "#f8f9fa",
  });

  const linkButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    fontWeight: 500,
    textDecoration: "none",
    padding: 0,
    fontSize: "inherit",
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={containerStyle}>
        {/* Левая часть - приветствие */}
        <div style={welcomeSectionStyle}>
          <div style={welcomeSectionBeforeStyle} />

          <div style={{ marginBottom: 30 }}>
            <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 5 }}>
              Складской учет
            </h1>
            <div style={{ fontSize: "1rem", opacity: 0.8 }}>
              Профессиональная система управления
            </div>
          </div>

          <ul style={{ listStyle: "none", marginTop: 30 }}>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
                fontSize: "0.95rem",
              }}
            >
              <span style={{ marginRight: 12, fontSize: "1.2rem" }}>📊</span>
              <span>Учет товаров и остатков</span>
            </li>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
                fontSize: "0.95rem",
              }}
            >
              <span style={{ marginRight: 12, fontSize: "1.2rem" }}>📄</span>
              <span>Электронный документооборот</span>
            </li>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
                fontSize: "0.95rem",
              }}
            >
              <span style={{ marginRight: 12, fontSize: "1.2rem" }}>🔍</span>
              <span>Проведение инвентаризаций</span>
            </li>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
                fontSize: "0.95rem",
              }}
            >
              <span style={{ marginRight: 12, fontSize: "1.2rem" }}>📱</span>
              <span>Мобильное приложение для проверок</span>
            </li>
            <li
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 15,
                fontSize: "0.95rem",
              }}
            >
              <span style={{ marginRight: 12, fontSize: "1.2rem" }}>🏢</span>
              <span>Управление несколькими складами</span>
            </li>
          </ul>

          <div style={{ marginTop: "auto", opacity: 0.8, fontSize: "0.9rem" }}>
            © 2025 Складской учет. Все права защищены.
          </div>
        </div>

        {/* Правая часть - формы */}
        <div style={authFormsStyle}>
          <div style={{ width: "100%" }}>
            {/* Переключатель форм */}
            <div
              style={{
                display: "flex",
                marginBottom: 30,
                borderBottom: "2px solid #bdc3c7",
              }}
            >
              <div
                style={formTabStyle(activeForm === "login")}
                onClick={() => setActiveForm("login")}
              >
                Вход
              </div>
              <div
                style={formTabStyle(activeForm === "register")}
                onClick={() => setActiveForm("register")}
              >
                Регистрация
              </div>
            </div>

            {/* Форма входа */}
            <div
              style={{
                ...formPageStyle,
                display: activeForm === "login" ? "block" : "none",
              }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 600,
                  marginBottom: 30,
                  color: "#2c3e50",
                  textAlign: "center",
                }}
              >
                Вход в систему
              </h2>

              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.email)}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    Пароль
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.password)}
                    placeholder="Введите ваш пароль"
                    required
                  />
                  {errors.password && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Кнопка "Забыли пароль?" */}
                <div style={{ textAlign: "right", marginBottom: 20 }}>
                  <button
                    type="button"
                    style={linkButtonStyle}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.textDecoration = "underline")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.textDecoration = "none")
                    }
                    onClick={() => setActiveForm("forgot")}
                  >
                    Забыли пароль?
                  </button>
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: 12,
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#2980b9")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#3498db")
                  }
                >
                  Войти в систему
                </button>
              </form>

              {errors.submit && (
                <div
                  style={{
                    color: "#e74c3c",
                    textAlign: "center",
                    marginTop: 15,
                  }}
                >
                  {errors.submit}
                </div>
              )}

              <div
                style={{
                  textAlign: "center",
                  marginTop: 25,
                  paddingTop: 20,
                  borderTop: "1px solid #bdc3c7",
                }}
              >
                Нет аккаунта?{" "}
                <button
                  type="button"
                  style={linkButtonStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                  onClick={() => setActiveForm("register")}
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>

            {/* Форма регистрации */}
            <div
              style={{ display: activeForm === "register" ? "block" : "none" }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 600,
                  marginBottom: 30,
                  color: "#2c3e50",
                  textAlign: "center",
                }}
              >
                Регистрация
              </h2>

              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    ФИО
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.fullName)}
                    placeholder="Иванов Иван Иванович"
                    required
                  />
                  {errors.fullName && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.fullName}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.email)}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    Пароль
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.password)}
                    placeholder="Создайте надежный пароль"
                    required
                  />
                  <div
                    style={{
                      marginTop: 5,
                      height: 4,
                      background: "#f0f0f0",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(passwordStrength / 4) * 100}%`,
                        background:
                          passwordStrength < 2
                            ? "#e74c3c"
                            : passwordStrength < 4
                            ? "#f39c12"
                            : "#27ae60",
                        transition: "width 0.3s, background-color 0.3s",
                      }}
                    />
                  </div>
                  {errors.password && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.password}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    Подтверждение пароля
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.confirmPassword)}
                    placeholder="Повторите ваш пароль"
                    required
                  />
                  {errors.confirmPassword && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={agreeTerms}
                      onChange={handleInputChange}
                      required
                    />
                    <span>
                      Я согласен с{" "}
                      <button
                        type="button"
                        style={linkButtonStyle}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.textDecoration = "underline")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.textDecoration = "none")
                        }
                        onClick={() => setIsTermsModalOpen(true)}
                      >
                        условиями использования
                      </button>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.agreeTerms}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: 12,
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#2980b9")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#3498db")
                  }
                >
                  Создать аккаунт
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 25,
                  paddingTop: 20,
                  borderTop: "1px solid #bdc3c7",
                }}
              >
                Уже есть аккаунт?{" "}
                <button
                  type="button"
                  style={linkButtonStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                  onClick={() => setActiveForm("login")}
                >
                  Войти
                </button>
              </div>
            </div>

            {/* Форма восстановления пароля */}
            <div
              style={{ display: activeForm === "forgot" ? "block" : "none" }}
            >
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 600,
                  marginBottom: 30,
                  color: "#2c3e50",
                  textAlign: "center",
                }}
              >
                Восстановление пароля
              </h2>

              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: 20 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 500,
                      color: "#2c3e50",
                      fontSize: "0.9rem",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={inputStyle(!!errors.email)}
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <div
                      style={{
                        color: "#e74c3c",
                        fontSize: "0.8rem",
                        marginTop: 5,
                      }}
                    >
                      {errors.email}
                    </div>
                  )}
                </div>

                <p
                  style={{
                    marginBottom: 20,
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  На указанный email будет отправлена ссылка для восстановления
                  пароля.
                </p>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: 12,
                    background: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: "1rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#2980b9")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#3498db")
                  }
                >
                  Отправить ссылку
                </button>
              </form>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 25,
                  paddingTop: 20,
                  borderTop: "1px solid #bdc3c7",
                }}
              >
                <button
                  type="button"
                  style={linkButtonStyle}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                  onClick={() => setActiveForm("login")}
                >
                  ← Назад к входу
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно условий использования */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        input:focus {
          outline: none;
          border-color: #3498db !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
