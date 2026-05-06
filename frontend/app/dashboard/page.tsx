import { redirect } from 'next/navigation';
import { backendFetch } from '@/lib/backend';
import { Dashboard } from '@/components/Dashboard';

export default async function DashboardPage() {
  const response = await backendFetch('/auth/me');
  if (!response.ok) {
    redirect('/login');
  }
  const data = await response.json();
  return <Dashboard initialUser={data.usuario} />;
}

