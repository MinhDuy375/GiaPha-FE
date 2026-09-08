import api from './api';

const eventService = {
    getEvents: async () => (await api.get('/familyevent')).data,
    createEvent: async data => (await api.post('/familyevent', data)).data,
    updateEvent: async (id, data) => (await api.put(`/familyevent/${id}`, data)).data,
    deleteEvent: async id => (await api.delete(`/familyevent/${id}`)).data,
};

export default eventService;
