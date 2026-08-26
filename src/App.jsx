import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyTreeProvider } from './contexts/FamilyTreeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectTree from './pages/SelectTree';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <FamilyTreeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Requires Auth but select-tree can be accessed before choosing a tree) */}
            <Route
              path="/select-tree"
              element={
                <ProtectedRoute requiresTree={false}>
                  <SelectTree />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes (Requires Auth + Requires selecting a FamilyTree/Tenant first) */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiresTree={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </FamilyTreeProvider>
    </AuthProvider>
  );
}

export default App;