import api from './api';

const galleryService = {
    getImages: async () => (await api.get('/gallery')).data,
    upload: async data => (await api.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } })).data,
    delete: async id => (await api.delete(`/gallery/${id}`)).data,
};

export default galleryService;
