import api from './api';

const roleGroupService = {
  // Lấy toàn bộ nhóm quyền và quyền của từng nhóm
  getRoleGroups: async () => {
    const res = await api.get('/rolegroup');
    return res.data;
  },

  // Lấy cấu trúc ma trận quyền (modules -> menus -> permissions)
  getPermissionMatrix: async () => {
    const res = await api.get('/rolegroup/matrix');
    return res.data;
  },

  getNavigation: async () => {
    const res = await api.get('/rolegroup/navigation');
    return res.data;
  },

  // Tạo nhóm quyền mới
  createRoleGroup: async (name, description, permissionCodes) => {
    const res = await api.post('/rolegroup', { name, description, permissionCodes });
    return res.data;
  },

  // Cập nhật nhóm quyền
  updateRoleGroup: async (id, name, description, permissionCodes) => {
    const res = await api.put(`/rolegroup/${id}`, { name, description, permissionCodes });
    return res.data;
  },

  // Xóa nhóm quyền
  deleteRoleGroup: async (id) => {
    const res = await api.delete(`/rolegroup/${id}`);
    return res.data;
  },
};

export default roleGroupService;
