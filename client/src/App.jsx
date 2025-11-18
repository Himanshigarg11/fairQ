import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import GeneratePIT from "./pages/GeneratePIT";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import StaffDashboard from "./pages/dashboards/StaffDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import { Navbar } from "./components/Navbar";
import ScanPIT from "./pages/ScanPIT";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Customer"]}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/generate-pit"
              element={
                <ProtectedRoute allowedRoles={["Customer"]}>
                  <GeneratePIT />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Staff"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/staff/scan-pit"
              element={
                <ProtectedRoute allowedRoles={["Staff"]}>
                  <ScanPIT />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Unauthorized */}
            <Route
              path="/unauthorized"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      Unauthorized
                    </h1>
                    <p className="text-gray-600">
                      You don't have permission to access this page.
                    </p>
                  </div>
                </div>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;