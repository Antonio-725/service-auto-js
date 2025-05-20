// src/routes/ProtectedRoute.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    // Not logged in
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole === "user") {
    // OTP verification required
    return <Navigate to="/otp" replace />;
  }

  if (userRole === "admin") {
    // Admin should go to admin dashboard
    return <Navigate to="/admin" replace />;
  }

  if (userRole !== "client") {
    // Any other unauthorized role goes to login
    return <Navigate to="/login" replace />;
  }

  // Only allow access if role is "client"
  return <>{children}</>;
};

export default ProtectedRoute;