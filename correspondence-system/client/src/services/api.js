const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers: options.body instanceof FormData ? options.headers : headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Cases
  getCases: () => request('/cases'),
  getCase: (id) => request(`/cases/${id}`),
  createCase: (data) => request('/cases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteCase: (id) => request(`/cases/${id}`, {
    method: 'DELETE',
  }),

  // Correspondence
  getCorrespondences: () => request('/correspondence'),
  getCorrespondence: (id) => request(`/correspondence/${id}`),
  createCorrespondence: (data) => request('/correspondence', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteCorrespondence: (id) => request(`/correspondence/${id}`, {
    method: 'DELETE',
  }),

  // Templates
  getTemplates: () => request('/templates'),
  uploadTemplate: (formData) => {
    return fetch('/api/templates/upload', {
      method: 'POST',
      body: formData,
    }).then(res => {
      if (!res.ok) return res.json().then(e => { throw new Error(e.error); });
      return res.json();
    });
  },
  deleteTemplate: (id) => request(`/templates/${id}`, {
    method: 'DELETE',
  }),

  // Reference Data (CRUD)
  getReferenceData: (category) => request(`/reference/${category}`),
  createReferenceData: (category, data) => request(`/reference/${category}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateReferenceData: (category, id, data) => request(`/reference/${category}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteReferenceData: (category, id) => request(`/reference/${category}/${id}`, {
    method: 'DELETE',
  }),

  // Translation Dictionary
  getDictionary: () => request('/dictionary'),
  createDictionaryEntry: (data) => request('/dictionary', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateDictionaryEntry: (id, data) => request(`/dictionary/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteDictionaryEntry: (id) => request(`/dictionary/${id}`, {
    method: 'DELETE',
  }),

  // Generate Draft Letter
  generateDraft: (correspondenceId) => request(`/correspondence/${correspondenceId}/generate-draft`, {
    method: 'POST',
  }),
};
