import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Farmacia Operaciones',
  description: 'Sistema farmacéutico con inventario, compras, ventas y usuarios'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

