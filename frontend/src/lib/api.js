import axios from 'axios';

// Defaults to /api (proxied to the backend by Vite). Override with VITE_API_URL.
export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const client = axios.create({ baseURL: API_BASE, timeout: 8000 });

export async function fetchPosts({ signal } = {}) {
  const { data } = await client.get('/posts', { signal, params: { limit: 100 } });
  return data;
}

export async function createPost(payload) {
  const { data } = await client.post('/posts', payload);
  return data;
}

export const isCanceled = axios.isCancel;

/** Turn any request failure into one plain sentence a person can act on. */
export function describeError(err) {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response) return `The API answered with status ${err.response.status}.`;
  if (err?.code === 'ECONNABORTED') return 'The API took too long to answer.';
  return `Can't reach the API at ${API_BASE}.`;
}
