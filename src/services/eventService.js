import api from './api';

const eventService = {
    getEvents: async () => (await api.get('/familyevent')).data,
    createEvent: async data => (await api.post('/familyevent', data)).data,
    deleteEvent: async id => (await api.delete(`/familyevent/${id}`)).data,
};

export default eventService;
