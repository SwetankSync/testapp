import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{ fontFamily: 'Inter, sans-serif', padding: '1.5rem', maxWidth: 980, margin: '0 auto' }}>
      <h1>Infinite Unilevel Sales Point Plan</h1>
      <p>Build your team, track SP progress, and manage incentives with transparent wallets and milestone bonuses.</p>
      <section style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/pages/about">About Us</Link>
        <Link href="/pages/contact">Contact</Link>
      </section>
    </main>
  );
}
