import api from './api';

const memberService = {
  // Lấy dữ liệu đầy đủ để render cây gia phả
  getTreeData: async () => {
    const res = await api.get('/member/tree-data');
    return res.data;
  },

  // Lấy danh sách thành viên
  getMembers: async () => {
    const res = await api.get('/member');
    return res.data;
  },

  // Tạo thành viên mới
  createMember: async (data) => {
    const res = await api.post('/member', data);
    return res.data;
  },

  // Cập nhật thành viên
  updateMember: async (id, data) => {
    const res = await api.put(`/member/${id}`, data);
    return res.data;
  },

  uploadAvatar: async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/member/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  // Xóa thành viên
  deleteMember: async (id) => {
    const res = await api.delete(`/member/${id}`);
    return res.data;
  },

  // Tính danh xưng giữa 2 người
  getKinship: async (fromId, toId) => {
    const res = await api.get('/member/kinship', { params: { fromId, toId } });
    return res.data;
  }
};

export default memberService;
