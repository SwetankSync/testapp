'use client';

import { useEffect, useMemo, useState } from 'react';

type WalletRow = { wallet_type: string; balance: string | number };

type Profile = {
  member_code: string;
  full_name: string;
  status: 'RED' | 'GREEN';
  personal_sp_30d: number;
  total_team_sp_counter: number;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    Promise.all([
      fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/wallet/balances', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([p, w]) => {
        setProfile(p);
        setWallets(w);
      })
      .catch(() => setError('Unable to load dashboard data'));
  }, []);

  const weeklyPct = useMemo(() => Math.min(100, ((profile?.personal_sp_30d || 0) / 50) * 100), [profile]);
  const levelPct = useMemo(() => Math.min(100, ((profile?.total_team_sp_counter || 0) / 450) * 100), [profile]);

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '1rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Member Dashboard</h1>
      {error && <p style={{ color: '#ca2b2b' }}>{error}</p>}
      <p>
        Member: <strong>{profile?.member_code || 'N/A'}</strong>
      </p>
      <p>
        Status:{' '}
        <strong style={{ color: profile?.status === 'GREEN' ? '#128a38' : '#ca2b2b' }}>{profile?.status || 'RED'}</strong>
      </p>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card title="Total Team SP" value={String(profile?.total_team_sp_counter ?? 0)} />
        <Card title="Personal SP (30d)" value={String(profile?.personal_sp_30d ?? 0)} />
        <Card title="Wallet Entries" value={String(wallets.length)} />
      </section>

      <section style={{ marginTop: '1rem' }}>
        <Progress label="30-Day Personal Business" percent={weeklyPct} helper={`${profile?.personal_sp_30d || 0} / 50 SP`} />
        <Progress label="Bonus Milestone" percent={levelPct} helper={`${profile?.total_team_sp_counter || 0} / 450 SP`} color="#4232d3" />
      </section>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return <article style={{ border: '1px solid #e1e2e5', borderRadius: 12, padding: '1rem' }}><p>{title}</p><h2>{value}</h2></article>;
}

function Progress({ label, percent, helper, color = '#2f9e44' }: { label: string; percent: number; helper: string; color?: string }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <p>{label}</p>
      <div style={{ width: '100%', borderRadius: 999, background: '#eceff3', overflow: 'hidden', height: 14 }}>
        <div style={{ width: `${percent}%`, background: color, height: '100%' }} />
      </div>
      <small>{helper}</small>
    </div>
  );
}
