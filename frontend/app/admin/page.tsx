'use client';

import { useEffect, useState } from 'react';

type Stats = { registrations?: number; active?: number; total_orders?: number; approved_sp?: number };

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>({});
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    Promise.all([
      fetch('/dashboard/stats', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/admin/orders/pending', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([s, p]) => {
      setStats(s);
      setPending(Array.isArray(p) ? p : []);
    });
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h1>Admin Control Panel</h1>
      <p>Total Users: {stats.registrations || 0}</p>
      <p>Active Users: {stats.active || 0}</p>
      <p>Pending Orders: {pending.length}</p>
      <p>Total Company SP (approved): {stats.approved_sp || 0}</p>
      <h2>Order Verification</h2>
      <ul>
        {pending.map((x) => <li key={x.id}>{x.member_code} - {x.sp_requested}</li>)}
      </ul>
    </main>
  );
}
