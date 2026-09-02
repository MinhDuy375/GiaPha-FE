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
  }
};

export default userService;
