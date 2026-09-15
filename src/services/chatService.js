import api from './api';

const chatService = {
  sendMessage(payload) {
    return api.post('/chat', payload);
  },
};

export default chatService;
