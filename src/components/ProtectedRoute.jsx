import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFamilyTree } from '../contexts/FamilyTreeContext';

const ProtectedRoute = ({ children, requiresTree = true, requiredPermission = null }) => {
  const { isAuthenticated, loading } = useAuth();
  const { currentTreeId, hasPermission } = useFamilyTree();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0e17', color: '#fff' }}>
        <div>Đang tải thông tin phiên làm việc...</div>
      </div>
    );
  }

  // 1. Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Kiểm tra xem đã chọn dòng họ chưa (nếu route yêu cầu)
  if (requiresTree && !currentTreeId) {
    return <Navigate to="/select-tree" replace />;
  }

  // 3. Kiểm tra permission cụ thể trong dòng họ hiện tại
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0e17', color: '#ff4d4d', fontFamily: 'Outfit, sans-serif' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>403</h1>
        <p style={{ fontSize: '1.2rem', color: '#8c9ba5' }}>Bạn không có quyền thực hiện chức năng này.</p>
        <button 
          onClick={() => window.history.back()} 
          style={{ marginTop: '2rem', padding: '0.8rem 2rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: '600' }}
        >
          Quay lại trang trước
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;