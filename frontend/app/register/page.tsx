'use client';

import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [sponsorCode, setSponsorCode] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!sponsorCode) return setSponsorName('');
      const res = await fetch(`/api/auth/validate-sponsor/${encodeURIComponent(sponsorCode)}`);
      if (!res.ok) return setSponsorName('Sponsor not found');
      const data = await res.json();
      setSponsorName(data?.sponsor?.full_name || 'Sponsor found');
    };
    const t = setTimeout(run, 350);
    return () => clearTimeout(t);
  }, [sponsorCode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password, sponsorCode }),
    });
    const data = await res.json();
    setMessage(res.ok ? `Registered: ${data.member_code}` : (data.message || 'Registration failed'));
  };

  return (
    <main style={{ padding: 16, maxWidth: 520 }}>
      <h1>Register</h1>
      <form onSubmit={submit}>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input value={sponsorCode} onChange={(e) => setSponsorCode(e.target.value)} placeholder="Sponsor ID" />
        {sponsorCode && <p>Sponsor: {sponsorName || 'Checking...'}</p>}
        <button type="submit">Create Red ID</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
