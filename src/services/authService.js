import api from './api';

const authService = {
  login: async (emailOrUsername, password) => {
    const response = await api.post('/auth/login', { emailOrUsername, password });
    if (response.data.accessToken) {
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (username, email, password, defaultFamilyTreeName) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
      defaultFamilyTreeName
    });
    return response.data;
  },

  selectTree: async (familyTreeId) => {
    const response = await api.post('/auth/select-tree', { familyTreeId });
    if (response.data.accessToken) {
      // Ghi đè accessToken hiện tại bằng JWT#2 (token chứa family_tree_id và permissions)
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('currentFamilyTreeId', familyTreeId);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('permissions', JSON.stringify(response.data.permissions));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentFamilyTreeId');
    localStorage.removeItem('role');
    localStorage.removeItem('permissions');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getRole: () => localStorage.getItem('role'),
  
  getPermissions: () => {
    const permsStr = localStorage.getItem('permissions');
    return permsStr ? JSON.parse(permsStr) : [];
  },

  hasPermission: (permissionCode) => {
    const perms = authService.getPermissions();
    return perms.includes(permissionCode);
  }
};

export default authService;