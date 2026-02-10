'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrCode, setEmailOrCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrCode, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message || 'Login failed');
    localStorage.setItem('token', data.token);
    router.push(data.role === 'ADMIN' ? '/admin' : '/member/dashboard');
  };

  return (
    <main style={{ padding: 16, maxWidth: 460 }}>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <input value={emailOrCode} onChange={(e) => setEmailOrCode(e.target.value)} placeholder="Email or Member ID" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
      <Link href="/forgot-password">Forgot password?</Link>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}
