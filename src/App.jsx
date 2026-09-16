import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FamilyTreeProvider } from './contexts/FamilyTreeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Onboarding from './pages/Onboarding';
import SelectTree from './pages/SelectTree';
import Dashboard from './pages/Dashboard';
import Permissions from './pages/Permissions';
import Profile from './pages/Profile';
import FamilyTree from './pages/FamilyTree';
import Members from './pages/Members';
import Relationships from './pages/Relationships';
import Statistics from './pages/Statistics';
import Events from './pages/Events';
import Kinship from './pages/Kinship';
import Gallery from './pages/Gallery';
import Membership from './pages/Membership';
import Users from './pages/Users';
import ImportExport from './pages/ImportExport';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <AuthProvider>
      <FamilyTreeProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Semi-protected: cần đăng nhập nhưng chưa cần chọn dòng họ */}
            <Route
              path="/change-password"
              element={
                <ProtectedRoute requiresTree={false}>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requiresTree={false}>
                  <Onboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute requiresTree={false}>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/family-tree"
              element={
                <ProtectedRoute requiresTree={true} requiredPermission="tree_view.view">
                  <FamilyTree />
                </ProtectedRoute>
              }
            />
            <Route
              path="/members"
              element={
                <ProtectedRoute requiresTree={true} requiredPermission="member_list.view">
                  <Members />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relationships"
              element={
                <ProtectedRoute requiresTree={true} requiredPermission="relationship.view">
                  <Relationships />
                </ProtectedRoute>
              }
            />
            <Route
              path="/statistics"
              element={
                <ProtectedRoute requiresTree={true} requiredPermission="statistics.view">
                  <Statistics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedRoute requiresTree={true} requiredPermission="event.view">
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route path="/kinship" element={<ProtectedRoute requiresTree={true} requiredPermission="kinship.view"><Kinship /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute requiresTree={true} requiredPermission="gallery.view"><Gallery /></ProtectedRoute>} />
            <Route path="/membership" element={<ProtectedRoute requiresTree={true} requiredPermission="membership.view"><Membership /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute requiresTree={true} requiredPermission="user.view"><Users /></ProtectedRoute>} />
            <Route path="/import-export" element={<ProtectedRoute requiresTree={true} requiredPermission="tree_view.export"><ImportExport /></ProtectedRoute>} />
            <Route
              path="/select-tree"
              element={
                <ProtectedRoute requiresTree={false}>
                  <SelectTree />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes (Requires Auth + Requires selecting a FamilyTree first) */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiresTree={true}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/permissions"
              element={
                <ProtectedRoute requiresTree={true} requiredPermission="role_group.view">
                  <Permissions />
                </ProtectedRoute>
              }
            />

            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ChatWidget />
        </Router>
      </FamilyTreeProvider>
    </AuthProvider>
  );
}

export default App;