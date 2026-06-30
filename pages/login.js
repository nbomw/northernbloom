import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function submit(fullPin) {
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: fullPin })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('nb_session', JSON.stringify(data));
      if (data.role === 'owner') {
        router.push('/owner');
      } else {
        const slug = (data.name || '').toLowerCase().trim().replace(/\s+/g, '-');
        router.push(slug ? `/staff/${slug}` : '/');
      }
    } else {
      setError(data.error || 'Invalid PIN');
      setPin('');
    }
  }

  return (
    <div className="pin-screen">
      <div style={{ marginBottom: 20, opacity: 0.7 }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="1" opacity="0.3" />
          <text x="24" y="30" textAnchor="middle" fill="currentColor" fontSize="16" fontWeight="600" fontFamily="Cormorant Garamond, serif">NB</text>
        </svg>
      </div>
      <div className="serif" style={{ fontSize: 22, fontWeight: 500, color: 'var(--parchment)', marginBottom: 6 }}>Northern Bloom</div>
      <div className="eyebrow" style={{ marginBottom: 36, fontSize: 9, opacity: 0.6 }}>Staff Login</div>

      <div className="pin-dots">
        {[0,1,2,3].map(i => <div key={i} className={'pin-dot' + (pin.length > i ? ' filled' : '')} />)}
      </div>

      <div className="pin-pad">
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => (
          n !== '' ? (
            <button key={i} onClick={() => {
              if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
              if (pin.length < 4) {
                const np = pin + n;
                setPin(np);
                if (np.length === 4) setTimeout(() => submit(np), 100);
              }
            }} className="pin-key">{n}</button>
          ) : <div key={i} />
        ))}
      </div>

      {error && <p className="err" style={{ marginTop: 20, textAlign: 'center' }}>{error}</p>}

      <Link href="/" className="back-link" style={{ marginTop: 40, display: 'inline-block', color: 'var(--parchment-dim)', fontSize: 11, letterSpacing: '0.04em', textDecoration: 'none' }}>
        ← Back to booking
      </Link>
    </div>
  );
}
