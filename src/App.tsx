import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { useAuthStore } from "./store/auth-store";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;
