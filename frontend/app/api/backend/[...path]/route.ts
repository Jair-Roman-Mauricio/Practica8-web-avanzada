import { backendFetch, jsonResponse } from '@/lib/backend';

type Params = { params: Promise<{ path: string[] }> };

const proxy = async (request: Request, { params }: Params) => {
  const url = new URL(request.url);
  const resolvedParams = await params;
  const path = `/${resolvedParams.path.join('/')}${url.search}`;
  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const response = await backendFetch(path, {
    method: request.method,
    body: hasBody ? await request.text() : undefined,
    headers: hasBody ? { 'Content-Type': request.headers.get('Content-Type') || 'application/json' } : undefined
  });
  return jsonResponse(response);
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
