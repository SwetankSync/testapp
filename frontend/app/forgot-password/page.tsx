'use client';

import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone }),
    });
    const data = await res.json();
    setMessage(data.message || 'Request processed');
  };

  return (
    <main style={{ padding: 16, maxWidth: 460 }}>
      <h1>Forgot Password</h1>
      <form onSubmit={submit}>
        <input value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} placeholder="Email or Mobile" required />
        <button type="submit">Send Reset Link</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
