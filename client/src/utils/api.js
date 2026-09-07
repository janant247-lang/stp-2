/**
 * Centralized API helper with automatic JWT token injection
 */

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

export const api = {
  async get(endpoint) {
    const res = await fetch(`/api${endpoint}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  },

  async post(endpoint, data) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  },

  async put(endpoint, data) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  },

  async patch(endpoint, data) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  },

  async delete(endpoint) {
    const res = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(err.message || 'Request failed');
    }
    return res.json();
  }
};
