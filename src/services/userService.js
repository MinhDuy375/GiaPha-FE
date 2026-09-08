import api from './api';

const userService = {
  // Lấy thông tin cá nhân hiện tại
  getCurrentUser: async () => {
    const res = await api.get('/user/me');
    return res.data;
  },

  // Cập nhật thông tin cá nhân (FullName)
  updateProfile: async (fullName) => {
    const res = await api.put('/user/me', { fullName });
    return res.data;
  },

  // Lấy danh sách người dùng trong dòng họ hiện tại
  getUsers: async () => {
    const res = await api.get('/user');
    return res.data;
  },

  // Đổi nhóm quyền (theo membershipId)
  updateUserRole: async (membershipId, roleGroupId) => {
    const res = await api.put(`/user/${membershipId}/role`, { roleGroupId });
    return res.data;
  },

  // Kích hoạt / Khóa tài khoản (theo userId)
  updateUserStatus: async (userId, isActive) => {
    const res = await api.put(`/user/${userId}/status`, { isActive });
    return res.data;
  },

  // Xóa người dùng khỏi dòng họ (theo membershipId)
  removeUser: async (membershipId) => {
    const res = await api.delete(`/user/${membershipId}`);
    return res.data;
  },
};

export default userService;
