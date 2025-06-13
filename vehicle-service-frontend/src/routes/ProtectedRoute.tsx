// src/routes/ProtectedRoute.tsx
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { verifyToken } from "../utils/apiClient";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const userRole = sessionStorage.getItem("role");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setIsValid(false);
        return;
      }
      try {
        await verifyToken(); // Verify token with backend
        setIsValid(true);
      } catch (error) {
        setIsValid(false); // Token invalid or expired
      }
    };
    checkToken();
  }, [token]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  if (!isValid || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole === "mechanic") {
  return <Navigate to="/otp" replace />;
}

if (userRole === "mechanic_verified") {
  return <>{children}</>;
}


  if (userRole === "user") {
    return <Navigate to="/otp" replace />;
  }

  if (userRole === "admin") {
    return <>{children}</>;
  }

  if (userRole !== "client") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
