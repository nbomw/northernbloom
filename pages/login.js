// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

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
        // Staff land on their own profile/dashboard page, slugified the
        // same way owner/index.js builds staff profile links.
        const slug = (data.name || '').toLowerCase().trim().replace(/\s+/g, '-');
        router.push(slug ? `/staff/${slug}` : '/');
      }
    } else {
      setError(data.error || 'Invalid PIN');
      setPin('');
    }
  }

  return (
    <div className="screen screen-center">
      <div className="brand-mark">NB</div>
      <h1 className="brand-title">Northern Bloom</h1>
      <p className="brand-sub">Enter your PIN</p>
      <div className="pin-dots">
        {[0,1,2,3].map(i => <div key={i} className={'pin-dot' + (pin.length > i ? ' filled' : '')} />)}
      </div>
      <div className="pin-pad">
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => (
          n !== '' ? <button key={i} onClick={() => {
            if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
            if (pin.length < 4) {
              const np = pin + n;
              setPin(np);
              if (np.length === 4) setTimeout(() => submit(np), 100);
            }
          }} className="pin-key">{n}</button> : <div key={i} />
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
      <a href="/" className="back-link">Back to booking</a>
    </div>
  );
}
