'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@farmacia.test');
  const [password, setPassword] = useState('Admin12345');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    setLoading(false);
    if (!response.ok) {
      setError(data.message || 'No se pudo iniciar sesión');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <main className="authPage">
      <section className="authCard">
        <div style={{ marginBottom: 28 }}>
          <LockKeyhole size={30} strokeWidth={1.8} />
          <h1 className="authTitle" style={{ marginTop: 18 }}>Farmacia</h1>
          <p className="muted">Ingresa para gestionar inventario, compras, ventas y usuarios.</p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">Email</span>
            <input className="input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span className="label">Contraseña</span>
            <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}

