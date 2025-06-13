//  //context/authContext.tsx

// import { createContext, useState, useEffect, useContext } from "react";
// import type { ReactNode } from "react";
// import { useNavigate } from "react-router-dom";

// // 🔁 Updated interface to include refreshAuthState and isLoading
// interface AuthContextType {
//   isAuthenticated: boolean;
//   role: string | null;
//   isLoading: boolean;
//   logout: () => void;
//   refreshAuthState: () => void; // 👈 New method
// }

// const defaultAuthContext: AuthContextType = {
//   isAuthenticated: false,
//   role: null,
//   isLoading: true,
//   logout: () => {},
//   refreshAuthState: () => {},
// };

// export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [role, setRole] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(true); // 🚀 Track loading state
//   const navigate = useNavigate();

//   const refreshAuthState = () => {
//     const token = localStorage.getItem("token");
//     const userRole = localStorage.getItem("role");

//     if (token && userRole) {
//       setIsAuthenticated(true);
//       setRole(userRole);
//     } else {
//       setIsAuthenticated(false);
//       setRole(null);
//     }

//     setIsLoading(false); // ✅ Done checking auth state
//   };

//   useEffect(() => {
//     refreshAuthState();
//   }, []);

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("role");
//     localStorage.removeItem("userId");
//     localStorage.removeItem("username");
//     setIsAuthenticated(false);
//     setRole(null);
//     navigate("/login");
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         isAuthenticated,
//         role,
//         isLoading,
//         logout,
//         refreshAuthState, // ✅ Provide refresh function to context
//       }}
//     >
//       {!isLoading ? children : <div>Loading...</div>}
//     </AuthContext.Provider>
//   );
// };

// // Custom hook to use auth context
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };


import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

// 🔁 Updated interface to include refreshAuthState and isLoading
interface AuthContextType {
  isAuthenticated: boolean;
  role: string | null;
  isLoading: boolean;
  logout: () => void;
  refreshAuthState: () => void;
}

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  role: null,
  isLoading: true,
  logout: () => {},
  refreshAuthState: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const refreshAuthState = () => {
    const token = sessionStorage.getItem("token"); // 🔁 CHANGED
    const userRole = sessionStorage.getItem("role"); // 🔁 CHANGED

    if (token && userRole) {
      setIsAuthenticated(true);
      setRole(userRole);
    } else {
      setIsAuthenticated(false);
      setRole(null);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    refreshAuthState();
  }, []);

  const logout = () => {
    sessionStorage.removeItem("token"); // 🔁 CHANGED
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    setIsAuthenticated(false);
    setRole(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        isLoading,
        logout,
        refreshAuthState,
      }}
    >
      {!isLoading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
