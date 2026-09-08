import api from './api';

const relationshipService = {
    getRelationships: async () => (await api.get('/relationship')).data,
    createRelationship: async (data) => (await api.post('/relationship', data)).data,
    deleteRelationship: async (type, id) => (await api.delete(`/relationship/${type}/${id}`)).data,
};

export default relationshipService;
