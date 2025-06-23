import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Otp from "./pages/Otp";

// Client Dashboard
import ClientDashboard from "./dashboards/ClientDashboard";
import ServicesPage from "./pages/client/ServicesPage";
import BookServicePage from "./pages/client/BookServicePage";
import PaymentsPage from "./pages/client/PaymentsPage";
import NotificationsPage from "./pages/client/NotificationsPage";
import ProfilePage from "./pages/client/ProfilePage";
import SupportPage from "./pages/client/SupportPage";
import InvoiceView from './components/InvoiceView';


// Admin Dashboard (Example)
import AdminDashboard from "./dashboards/AdminDashboard"; // Make sure this exists

import MechanicDashboard from "./dashboards/MechanicDashboard";

// Protected Route
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/otp" element={<Otp />} />

        {/* Admin Dashboard - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/mechanic"
  element={
    <ProtectedRoute>
      <MechanicDashboard />
    </ProtectedRoute>
  }
/>

        {/* Protected Client Dashboard */}
        <Route
          element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          }
        >
        <Route path="/invoices/:id" element={
  <ProtectedRoute>
    <InvoiceView />
  </ProtectedRoute>
} />
          <Route index element={<ServicesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="book" element={<BookServicePage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>

        {/* Redirect root URL to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Fallback for any other routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;