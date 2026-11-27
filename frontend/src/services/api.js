const API_URL = 'http://localhost:8080/api';

export const itemApi = {
  fetchAll: async () => {
    const res = await fetch(`${API_URL}/items`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch items');
    return res.json();
  },
  
  save: async (payload, isEditing, id) => {
    const url = isEditing ? `${API_URL}/items/${id}` : `${API_URL}/items`;
    const method = isEditing ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include' // <-- CRITICAL: Sends the SESSION_ID cookie
    });
    if (!res.ok) throw new Error('Failed to save item');
    return res;
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/items/${id}`, { 
      method: 'DELETE',
      credentials: 'include' // <-- CRITICAL: Sends the SESSION_ID cookie
    });
    if (!res.ok) throw new Error('Failed to delete item');
    return true;
  },

  fetchMasterData: async () => {
    const res = await fetch(`${API_URL}/master-data`, { credentials: 'include' });
    if (!res.ok) throw new Error('Failed to fetch master data');
    return res.json();
  }
};