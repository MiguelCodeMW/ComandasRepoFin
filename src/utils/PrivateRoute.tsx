import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token"); // Verifica si hay un token en localStorage

  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Si hay token, renderiza el componente hijo
  return children;
};

export default PrivateRoute;
