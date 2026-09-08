import api from './api';

const familyTreeService = {
  getMyTrees: async () => {
    const response = await api.get('/familytree');
    return response.data;
  },

  createTree: async (name, description) => {
    const response = await api.post('/familytree', { name, description });
    return response.data;
  },

  joinTree: async (joinCode) => {
    const response = await api.post('/familytree/join', { joinCode: joinCode.trim().toUpperCase() });
    return response.data;
  }
};

export default familyTreeService;