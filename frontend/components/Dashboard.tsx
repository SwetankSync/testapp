'use client';

import { useEffect, useMemo, useState } from 'react';

type WalletRow = { wallet_type: string; balance: string | number };
type TeamResponse = { nodes?: Array<{ id: string; full_name: string; member_code: string; depth: number; status: string }> };

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
  const [teamNodes, setTeamNodes] = useState<TeamResponse['nodes']>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    Promise.all([
      fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/wallet/balance', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/tree/my-downline', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([p, w, t]) => {
        setProfile(p);
        setWallets(Array.isArray(w) ? w : []);
        setTeamNodes(Array.isArray(t?.nodes) ? t.nodes : []);
      })
      .catch(() => setError('Unable to load dashboard data'));
  }, []);

  const weeklyPct = useMemo(() => Math.min(100, ((profile?.personal_sp_30d || 0) / 50) * 100), [profile]);
  const levelPct = useMemo(() => Math.min(100, ((profile?.total_team_sp_counter || 0) / 450) * 100), [profile]);
  const holdPending = (profile?.personal_sp_30d || 0) < 50;
  const walletTotal = wallets.reduce((sum, x) => sum + Number(x.balance || 0), 0);

  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '1rem', maxWidth: 1000, margin: '0 auto' }}>
      <h1>Member Dashboard</h1>
      {error && <p style={{ color: '#ca2b2b' }}>{error}</p>}
      <p>Member: <strong>{profile?.member_code || 'N/A'}</strong></p>
      <p>Status: <strong style={{ color: profile?.status === 'GREEN' ? '#128a38' : '#ca2b2b' }}>{profile?.status || 'RED'}</strong></p>
      {holdPending && (
        <div style={{ background: '#fff3cd', border: '1px solid #ffe69c', padding: 10, borderRadius: 8 }}>
          Hold Alert: Complete 50 SP monthly target to avoid/clear hold.
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: 12 }}>
        <Card title="Total SP" value={String(profile?.total_team_sp_counter ?? 0)} />
        <Card title="Weekly SP" value={String(profile?.personal_sp_30d ?? 0)} />
        <Card title="Wallet Balance" value={walletTotal.toFixed(2)} />
      </section>

      <section style={{ marginTop: '1rem' }}>
        <Progress label="30-Day Personal Business" percent={weeklyPct} helper={`${profile?.personal_sp_30d || 0} / 50 SP`} />
        <Progress label="Bonus Milestone" percent={levelPct} helper={`${profile?.total_team_sp_counter || 0} / 450 SP`} color="#4232d3" />
      </section>

      <section style={{ marginTop: '1rem' }}>
        <h3>Genealogy Tree (List View)</h3>
        <div style={{ maxHeight: 220, overflow: 'auto', border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
          {teamNodes?.map((node) => (
            <div key={node.id} style={{ paddingLeft: `${(node.depth || 0) * 16}px` }}>
              {node.full_name} ({node.member_code}) - {node.status}
            </div>
          ))}
        </div>
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
