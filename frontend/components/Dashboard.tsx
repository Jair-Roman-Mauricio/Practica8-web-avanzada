'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Boxes,
  Building2,
  ClipboardList,
  LogOut,
  PackagePlus,
  Pill,
  ReceiptText,
  Users
} from 'lucide-react';

type Role = 'ADMIN' | 'VENDEDOR' | 'ALMACEN';
type User = { id: number; nombre: string; email: string; rol: Role; activo: boolean };
type Catalog = { id: number; descripcion: string };
type Lab = { id: number; razonSocial: string; direccion: string; telefono: string; email: string; contacto: string };
type Medicine = {
  id: number;
  descripcionMed: string;
  fechaFabricacion: string;
  fechaVencimiento: string;
  presentacion: string;
  stock: number;
  precioVentaUni: string;
  precioVentaPres: string;
  marca: string;
  TipoMedicamento?: Catalog;
  Especialidad?: Catalog;
};
type Order = {
  id: number;
  fechaEmision: string;
  situacion: string;
  motivo?: string;
  total: string;
  nroFacturaProv?: string;
  Laboratorio?: Lab;
  detalles?: Array<{ id: number; descripcion?: string; descripcionMed?: string; cantidad?: number; cantidadRequerida?: number; subtotal?: string; montoUni?: string }>;
};

type Tab = 'resumen' | 'medicamentos' | 'compras' | 'ventas' | 'catalogos' | 'usuarios';

const today = new Date().toISOString().slice(0, 10);

const emptyMedicine = {
  descripcionMed: '',
  fechaFabricacion: today,
  fechaVencimiento: today,
  presentacion: '',
  stock: 0,
  precioVentaUni: 0,
  precioVentaPres: 0,
  marca: '',
  tipoMedicamentoId: '',
  especialidadId: ''
};

const money = (value: string | number | undefined) => `S/ ${Number(value || 0).toFixed(2)}`;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    }
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Operación no completada');
  }
  return data as T;
}

export function Dashboard({ initialUser }: { initialUser: User }) {
  const router = useRouter();
  const [user] = useState(initialUser);
  const [tab, setTab] = useState<Tab>('resumen');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [types, setTypes] = useState<Catalog[]>([]);
  const [specialties, setSpecialties] = useState<Catalog[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const canAdmin = user.rol === 'ADMIN';
  const canPurchase = user.rol === 'ADMIN' || user.rol === 'ALMACEN';
  const canSell = user.rol === 'ADMIN' || user.rol === 'VENDEDOR';
  const canCatalog = canAdmin;
  const canViewMedicinesTab = canAdmin;

  const tabs = useMemo(() => [
    { id: 'resumen' as Tab, label: 'Resumen', icon: ClipboardList, show: true },
    { id: 'medicamentos' as Tab, label: 'Medicamentos', icon: Pill, show: canViewMedicinesTab },
    { id: 'compras' as Tab, label: 'Compras', icon: PackagePlus, show: canPurchase },
    { id: 'ventas' as Tab, label: 'Ventas', icon: ReceiptText, show: canSell },
    { id: 'catalogos' as Tab, label: 'Catálogos', icon: Building2, show: canCatalog },
    { id: 'usuarios' as Tab, label: 'Usuarios', icon: Users, show: canAdmin }
  ], [canAdmin, canCatalog, canPurchase, canSell, canViewMedicinesTab]);

  const loadData = useCallback(async () => {
    setError('');
    try {
      const tasks: Promise<unknown>[] = [];

      if (canAdmin || canPurchase || canSell) {
        tasks.push(api<Medicine[]>('/medicamentos').then(setMedicines));
      } else {
        setMedicines([]);
      }

      if (canAdmin) {
        tasks.push(api<Catalog[]>('/tipos-medicamento').then(setTypes));
        tasks.push(api<Catalog[]>('/especialidades').then(setSpecialties));
        tasks.push(api<User[]>('/usuarios').then(setUsers));
      } else {
        setTypes([]);
        setSpecialties([]);
        setUsers([]);
      }

      if (canAdmin || canPurchase) {
        tasks.push(api<Lab[]>('/laboratorios').then(setLabs));
      } else {
        setLabs([]);
      }

      if (canPurchase) {
        tasks.push(api<Order[]>('/compras').then(setPurchases));
      } else {
        setPurchases([]);
      }

      if (canSell) {
        tasks.push(api<Order[]>('/ventas').then(setSales));
      } else {
        setSales([]);
      }

      await Promise.all(tasks);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la información');
    }
  }, [canAdmin, canPurchase, canSell]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const notify = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 2500);
  };

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="topbarInner">
          <div>
            <div className="brand">Farmacia Operaciones</div>
            <div className="muted" style={{ fontSize: 14 }}>{user.nombre} · {user.rol}</div>
          </div>
          <button className="button buttonDanger" onClick={logout} type="button"><LogOut size={16} /> Salir</button>
        </div>
      </header>

      <nav className="tabs" aria-label="Secciones">
        {tabs.filter((item) => item.show).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`tab ${tab === item.id ? 'tabActive' : ''}`}
              onClick={() => setTab(item.id)}
              type="button"
            >
              <Icon size={16} /> {item.label}
            </button>
          );
        })}
      </nav>

      <main className="main">
        {error ? <div className="error" style={{ marginBottom: 16 }}>{error}</div> : null}
        {success ? <div className="success" style={{ marginBottom: 16 }}>{success}</div> : null}
        {tab === 'resumen' && <Resumen medicines={medicines} purchases={purchases} sales={sales} users={users} />}
        {tab === 'medicamentos' && canViewMedicinesTab && (
          <Medicamentos
            medicines={medicines}
            types={types}
            specialties={specialties}
            canEdit={canCatalog}
            onDone={() => { notify('Medicamento guardado'); loadData(); }}
            onError={setError}
          />
        )}
        {tab === 'compras' && canPurchase && (
          <Compras medicines={medicines} labs={labs} purchases={purchases} onDone={() => { notify('Compra registrada'); loadData(); }} onError={setError} />
        )}
        {tab === 'ventas' && canSell && (
          <Ventas medicines={medicines} sales={sales} onDone={() => { notify('Venta registrada'); loadData(); }} onError={setError} />
        )}
        {tab === 'catalogos' && canCatalog && (
          <Catalogos types={types} specialties={specialties} labs={labs} onDone={() => { notify('Catálogo actualizado'); loadData(); }} onError={setError} />
        )}
        {tab === 'usuarios' && canAdmin && (
          <Usuarios users={users} onDone={() => { notify('Usuario guardado'); loadData(); }} onError={setError} />
        )}
      </main>
    </div>
  );
}

function Resumen({ medicines, purchases, sales, users }: { medicines: Medicine[]; purchases: Order[]; sales: Order[]; users: User[] }) {
  const lowStock = medicines.filter((item) => item.stock <= 5).length;
  return (
    <>
      <section className="hero">
        <div className="panel panelAccent heroCopy">
          <div>
            <span className="eyebrow">Operación centralizada</span>
            <h1 className="pageTitle" style={{ marginTop: 18 }}>Control farmacéutico.</h1>
            <p className="heroLead">
              Inventario, compras, ventas y usuarios en una sola superficie con permisos por rol,
              movimientos trazables y una lectura clara del stock real.
            </p>
          </div>
          <div className="heroMeta">
            <button className="button" type="button">API protegida</button>
            <span className="heroNote">JWT + validaciones + operaciones con stock automático</span>
          </div>
        </div>
        <div className="heroStage">
          <h2>Stock vivo.</h2>
          <p>Compras suman unidades. Ventas validan disponibilidad y descuentan inventario.</p>
          <div className="stageLine" />
        </div>
      </section>
      <section className="metrics">
        <Metric label="Medicamentos" value={medicines.length} />
        <Metric label="Stock bajo" value={lowStock} />
        <Metric label="Compras" value={purchases.length} />
        <Metric label="Ventas" value={sales.length || users.length} />
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><span className="metricValue">{value}</span><span className="muted">{label}</span></div>;
}

function Medicamentos({ medicines, types, specialties, canEdit, onDone, onError }: {
  medicines: Medicine[];
  types: Catalog[];
  specialties: Catalog[];
  canEdit: boolean;
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState({ ...emptyMedicine });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api('/medicamentos', { method: 'POST', body: JSON.stringify(form) });
      setForm({ ...emptyMedicine });
      onDone();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : 'No se pudo guardar');
    }
  };

  return (
    <section className="sectionGrid">
      {canEdit ? (
        <div className="panel">
          <h2 className="sectionTitle">Nuevo medicamento</h2>
          <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
            <Input label="Descripción" value={form.descripcionMed} onChange={(value) => setForm({ ...form, descripcionMed: value })} />
            <Input label="Marca" value={form.marca} onChange={(value) => setForm({ ...form, marca: value })} />
            <Input label="Presentación" value={form.presentacion} onChange={(value) => setForm({ ...form, presentacion: value })} />
            <Input type="date" label="Fabricación" value={form.fechaFabricacion} onChange={(value) => setForm({ ...form, fechaFabricacion: value })} />
            <Input type="date" label="Vencimiento" value={form.fechaVencimiento} onChange={(value) => setForm({ ...form, fechaVencimiento: value })} />
            <Input type="number" label="Stock inicial" value={String(form.stock)} onChange={(value) => setForm({ ...form, stock: Number(value) })} />
            <Input type="number" label="Precio unitario" value={String(form.precioVentaUni)} onChange={(value) => setForm({ ...form, precioVentaUni: Number(value) })} />
            <Input type="number" label="Precio presentación" value={String(form.precioVentaPres)} onChange={(value) => setForm({ ...form, precioVentaPres: Number(value) })} />
            <Select label="Tipo" value={form.tipoMedicamentoId} options={types} onChange={(value) => setForm({ ...form, tipoMedicamentoId: value })} />
            <Select label="Especialidad" value={form.especialidadId} options={specialties} onChange={(value) => setForm({ ...form, especialidadId: value })} />
            <button className="button" type="submit"><Pill size={16} /> Registrar</button>
          </form>
        </div>
      ) : null}
      <div className="tableWrap" style={{ gridColumn: canEdit ? undefined : '1 / -1' }}>
        <div className="sectionHeader">
          <h2 className="sectionTitle">Medicamentos disponibles</h2>
          <span className="status">{medicines.length} registros</span>
        </div>
        <DataTable empty="No hay medicamentos registrados">
          <thead><tr><th>Medicamento</th><th>Tipo</th><th>Stock</th><th>Precio</th><th>Vence</th></tr></thead>
          <tbody>
            {medicines.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.descripcionMed}</strong><br /><span className="muted">{item.marca} · {item.presentacion}</span></td>
                <td>{item.TipoMedicamento?.descripcion || '-'}</td>
                <td><span className="status">{item.stock}</span></td>
                <td>{money(item.precioVentaUni)}</td>
                <td>{item.fechaVencimiento}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </div>
    </section>
  );
}

function Compras({ medicines, labs, purchases, onDone, onError }: {
  medicines: Medicine[];
  labs: Lab[];
  purchases: Order[];
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState({ fechaEmision: today, laboratorioId: '', nroFacturaProv: '', medicamentoId: '', cantidad: 1, precio: 1 });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api('/compras', {
        method: 'POST',
        body: JSON.stringify({
          fechaEmision: form.fechaEmision,
          laboratorioId: form.laboratorioId,
          nroFacturaProv: form.nroFacturaProv,
          detalles: [{ medicamentoId: form.medicamentoId, cantidad: form.cantidad, precio: form.precio }]
        })
      });
      onDone();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : 'No se pudo registrar la compra');
    }
  };

  return (
    <section className="sectionGrid">
      <div className="panel">
        <h2 className="sectionTitle">Orden de compra</h2>
        <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
          <Input type="date" label="Fecha" value={form.fechaEmision} onChange={(value) => setForm({ ...form, fechaEmision: value })} />
          <Select label="Laboratorio" value={form.laboratorioId} options={labs.map((lab) => ({ id: lab.id, descripcion: lab.razonSocial }))} onChange={(value) => setForm({ ...form, laboratorioId: value })} />
          <Input label="Factura proveedor" value={form.nroFacturaProv} onChange={(value) => setForm({ ...form, nroFacturaProv: value })} />
          <Select label="Medicamento" value={form.medicamentoId} options={medicines.map((med) => ({ id: med.id, descripcion: med.descripcionMed }))} onChange={(value) => setForm({ ...form, medicamentoId: value })} />
          <Input type="number" label="Cantidad" value={String(form.cantidad)} onChange={(value) => setForm({ ...form, cantidad: Number(value) })} />
          <Input type="number" label="Precio compra" value={String(form.precio)} onChange={(value) => setForm({ ...form, precio: Number(value) })} />
          <button className="button" type="submit"><PackagePlus size={16} /> Registrar compra</button>
        </form>
      </div>
      <Orders title="Compras registradas" orders={purchases} kind="compras" />
    </section>
  );
}

function Ventas({ medicines, sales, onDone, onError }: {
  medicines: Medicine[];
  sales: Order[];
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState({ fechaEmision: today, motivo: 'Venta mostrador', medicamentoId: '', cantidadRequerida: 1 });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api('/ventas', {
        method: 'POST',
        body: JSON.stringify({
          fechaEmision: form.fechaEmision,
          motivo: form.motivo,
          detalles: [{ medicamentoId: form.medicamentoId, cantidadRequerida: form.cantidadRequerida }]
        })
      });
      onDone();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : 'No se pudo registrar la venta');
    }
  };

  return (
    <section className="sectionGrid">
      <div className="panel">
        <h2 className="sectionTitle">Orden de venta</h2>
        <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
          <Input type="date" label="Fecha" value={form.fechaEmision} onChange={(value) => setForm({ ...form, fechaEmision: value })} />
          <Input label="Motivo" value={form.motivo} onChange={(value) => setForm({ ...form, motivo: value })} />
          <Select label="Medicamento" value={form.medicamentoId} options={medicines.map((med) => ({ id: med.id, descripcion: `${med.descripcionMed} · stock ${med.stock}` }))} onChange={(value) => setForm({ ...form, medicamentoId: value })} />
          <Input type="number" label="Cantidad" value={String(form.cantidadRequerida)} onChange={(value) => setForm({ ...form, cantidadRequerida: Number(value) })} />
          <button className="button" type="submit"><ReceiptText size={16} /> Registrar venta</button>
        </form>
      </div>
      <Orders title="Ventas registradas" orders={sales} kind="ventas" />
    </section>
  );
}

function Catalogos({ types, specialties, labs, onDone, onError }: {
  types: Catalog[];
  specialties: Catalog[];
  labs: Lab[];
  onDone: () => void;
  onError: (message: string) => void;
}) {
  const [tipo, setTipo] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [lab, setLab] = useState({ razonSocial: '', direccion: '', telefono: '', email: '', contacto: '' });

  const create = async (path: string, body: unknown) => {
    try {
      await api(path, { method: 'POST', body: JSON.stringify(body) });
      onDone();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : 'No se pudo guardar catálogo');
    }
  };

  return (
    <section className="sectionGrid">
      <div className="panel">
        <h2 className="sectionTitle">Catálogos</h2>
        <form className="form" onSubmit={(event) => { event.preventDefault(); create('/tipos-medicamento', { descripcion: tipo }); setTipo(''); }} style={{ marginTop: 18 }}>
          <Input label="Tipo de medicamento" value={tipo} onChange={setTipo} />
          <button className="button" type="submit">Agregar tipo</button>
        </form>
        <form className="form" onSubmit={(event) => { event.preventDefault(); create('/especialidades', { descripcion: especialidad }); setEspecialidad(''); }} style={{ marginTop: 24 }}>
          <Input label="Especialidad" value={especialidad} onChange={setEspecialidad} />
          <button className="button buttonSecondary" type="submit">Agregar especialidad</button>
        </form>
        <form className="form" onSubmit={(event) => { event.preventDefault(); create('/laboratorios', lab); setLab({ razonSocial: '', direccion: '', telefono: '', email: '', contacto: '' }); }} style={{ marginTop: 24 }}>
          <Input label="Razón social" value={lab.razonSocial} onChange={(value) => setLab({ ...lab, razonSocial: value })} />
          <Input label="Dirección" value={lab.direccion} onChange={(value) => setLab({ ...lab, direccion: value })} />
          <Input label="Teléfono" value={lab.telefono} onChange={(value) => setLab({ ...lab, telefono: value })} />
          <Input type="email" label="Email" value={lab.email} onChange={(value) => setLab({ ...lab, email: value })} />
          <Input label="Contacto" value={lab.contacto} onChange={(value) => setLab({ ...lab, contacto: value })} />
          <button className="button" type="submit"><Building2 size={16} /> Agregar laboratorio</button>
        </form>
      </div>
      <div className="tableWrap">
        <h2 className="sectionTitle">Valores registrados</h2>
        <p><strong>Tipos:</strong> {types.map((item) => item.descripcion).join(', ') || 'Sin datos'}</p>
        <p><strong>Especialidades:</strong> {specialties.map((item) => item.descripcion).join(', ') || 'Sin datos'}</p>
        <DataTable empty="No hay laboratorios">
          <thead><tr><th>Laboratorio</th><th>Contacto</th><th>Email</th></tr></thead>
          <tbody>{labs.map((item) => <tr key={item.id}><td>{item.razonSocial}</td><td>{item.contacto}</td><td>{item.email}</td></tr>)}</tbody>
        </DataTable>
      </div>
    </section>
  );
}

function Usuarios({ users, onDone, onError }: { users: User[]; onDone: () => void; onError: (message: string) => void }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: 'Password123', rol: 'VENDEDOR' });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await api('/usuarios', { method: 'POST', body: JSON.stringify({ ...form, activo: true }) });
      setForm({ nombre: '', email: '', password: 'Password123', rol: 'VENDEDOR' });
      onDone();
    } catch (submitError) {
      onError(submitError instanceof Error ? submitError.message : 'No se pudo guardar usuario');
    }
  };
  return (
    <section className="sectionGrid">
      <div className="panel">
        <h2 className="sectionTitle">Nuevo usuario</h2>
        <form className="form" onSubmit={submit} style={{ marginTop: 18 }}>
          <Input label="Nombre" value={form.nombre} onChange={(value) => setForm({ ...form, nombre: value })} />
          <Input type="email" label="Email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
          <Input type="password" label="Contraseña" value={form.password} onChange={(value) => setForm({ ...form, password: value })} />
          <label className="field"><span className="label">Rol</span><select className="select" value={form.rol} onChange={(event) => setForm({ ...form, rol: event.target.value })}><option>VENDEDOR</option><option>ALMACEN</option><option>ADMIN</option></select></label>
          <button className="button" type="submit"><Users size={16} /> Crear usuario</button>
        </form>
      </div>
      <div className="tableWrap">
        <h2 className="sectionTitle">Usuarios</h2>
        <DataTable empty="No hay usuarios">
          <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead>
          <tbody>{users.map((item) => <tr key={item.id}><td>{item.nombre}</td><td>{item.email}</td><td>{item.rol}</td><td><span className="status">{item.activo ? 'Activo' : 'Inactivo'}</span></td></tr>)}</tbody>
        </DataTable>
      </div>
    </section>
  );
}

function Orders({ title, orders, kind }: { title: string; orders: Order[]; kind: 'compras' | 'ventas' }) {
  return (
    <div className="tableWrap">
      <div className="sectionHeader">
        <h2 className="sectionTitle">{title}</h2>
        <span className="status">{orders.length} registros</span>
      </div>
      <DataTable empty="No hay órdenes registradas">
        <thead><tr><th>Nro</th><th>Fecha</th><th>Referencia</th><th>Total</th><th>Detalle</th></tr></thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.fechaEmision}</td>
              <td>{kind === 'compras' ? order.Laboratorio?.razonSocial || order.nroFacturaProv : order.motivo}</td>
              <td>{money(order.total)}</td>
              <td>{order.detalles?.map((detail) => detail.descripcion || detail.descripcionMed).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <input className="input" type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: Catalog[]; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <select className="select" value={value} onChange={(event) => onChange(event.target.value)} required>
        <option value="">Selecciona</option>
        {options.map((item) => <option key={item.id} value={item.id}>{item.descripcion}</option>)}
      </select>
    </label>
  );
}

function DataTable({ children, empty }: { children: React.ReactNode; empty: string }) {
  const childArray = Array.isArray(children) ? children : [children];
  const body = childArray.find((child: any) => child?.type === 'tbody') as React.ReactElement | undefined;
  const hasRows = Boolean(body?.props?.children && (!Array.isArray(body.props.children) || body.props.children.length > 0));

  if (!hasRows) return <div className="empty"><Boxes size={26} /><p>{empty}</p></div>;
  return <table className="table">{children}</table>;
}
