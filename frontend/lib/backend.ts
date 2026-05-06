import { cookies } from 'next/headers';

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000/api';

export const backendFetch = async (
  path: string,
  init: RequestInit = {},
  token?: string
) => {
  const cookieStore = await cookies();
  const authToken = token ?? cookieStore.get('token')?.value;
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });
};

export const jsonResponse = async (response: Response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return Response.json(data, { status: response.status });
};
