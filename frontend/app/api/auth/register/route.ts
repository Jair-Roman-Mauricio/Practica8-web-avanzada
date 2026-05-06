import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/backend';

export async function POST(request: Request) {
  const body = await request.text();
  const response = await backendFetch('/auth/register', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' }
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (response.ok && data?.token) {
    const cookieStore = await cookies();
    cookieStore.set('token', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8
    });
  }

  return Response.json(data, { status: response.status });
}
