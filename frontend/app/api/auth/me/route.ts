import { backendFetch, jsonResponse } from '@/lib/backend';

export async function GET() {
  const response = await backendFetch('/auth/me');
  return jsonResponse(response);
}

