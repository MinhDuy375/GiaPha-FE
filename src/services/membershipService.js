import api from './api';

const membershipService = {
    join: async joinCode => (await api.post('/familytree/join', { joinCode })).data,
    getCurrentTree: async () => (await api.get('/familytree/current')).data,
    getJoinRequests: async () => (await api.get('/familytree/join-requests')).data,
    getRoleGroups: async () => (await api.get('/familytree/role-groups')).data,
    approve: async (id, data) => (await api.put(`/familytree/join-requests/${id}/approve`, data)).data,
    reject: async id => (await api.put(`/familytree/join-requests/${id}/reject`)).data,
};

export default membershipService;
