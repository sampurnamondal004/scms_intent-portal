const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.detail || data?.message || `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export function listIndents(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });
  const query = params.toString();
  return request(`/api/indent/list${query ? `?${query}` : ''}`);
}

export function createIndent(payload) {
  return request('/api/indent/create', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getIndent(indentId) {
  return request(`/api/indent/${indentId}`);
}

export function getIndentItems(indentId) {
  return request(`/api/indent/${indentId}/items`);
}

export function approveIndent(indentId, payload) {
  return request(`/api/indent/${indentId}/approve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function rejectIndent(indentId, payload) {
  return request(`/api/indent/${indentId}/reject`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
