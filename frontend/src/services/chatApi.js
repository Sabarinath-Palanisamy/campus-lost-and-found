const API_URL = 'http://localhost:8080/api/chat';

export const chatApi = {
  // RESTORED: This fetches the actual messages for the chatbox
  getConversation: async (itemId, receiverId) => {
    const res = await fetch(`${API_URL}/${itemId}/${receiverId}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  getConversations: async () => {
    const res = await fetch(`${API_URL}/conversations`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  // NEW: Fetches the number of unread messages for the badge
  getUnreadCount: async () => {
    const res = await fetch(`${API_URL}/unread-count`, { credentials: 'include' });
    if (!res.ok) return { count: 0 };
    return res.json();
  },
  
  sendMessage: async (itemId, receiverId, content, messageType = 'TEXT') => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, receiverId, content, messageType }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  processHandshake: async (itemId, receiverId, action) => {
    const res = await fetch(`${API_URL}/${itemId}/handshake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId, action }),
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Handshake failed');
    return res.json();
  }
};  