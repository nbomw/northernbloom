// pages/owner/index.js
import { useState, useEffect } from 'react';

export default function OwnerDashboard() {
  const [session, setSession] = useState(null);
  const [data, setData] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    try { const s = JSON.parse(sessionStorage.getItem('nb_session')); if (s?.role === 'owner') setSession(s); } catch {}
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch('/api/book-catalog').then(r => r.json()).then(d => setData(d)).catch(() => {});
  }, [session]);

  async function login(fullPin) {
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pin: fullPin }) });
    const d = await res.json();
    if (d.success && d.role === 'owner') {
      sessionStorage.setItem('nb_session', JSON.stringify(d));
      setSession(d);
    } else {
      setError(d.success ? 'Owner access only' : (d.error || 'Invalid PIN'));
      setPin('');
    }
  }

  if (!session) return (
    <div className="screen screen-center">
      <div className="brand-mark">NB</div>
      <h1 className="brand-title">Owner Access</h1>
      <p className="brand-sub">Enter owner PIN</p>
      <div className="pin-dots">{[0,1,2,3].map(i => <div key={i} className={'pin-dot' + (pin.length > i ? ' filled' : '')} />)}</div>
      <div className="pin-pad">
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => n !== '' ? <button key={i} onClick={() => {
          if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
          if (pin.length < 4) {
            const np = pin + n;
            setPin(np);
            if (np.length === 4) setTimeout(() => login(np), 50);
          }
        }} className="pin-key">{n}</button> : <div key={i} />)}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );

  return (
    <div className="screen">
      <div className="container-md">
        <div className="dash-header">
          <h1 className="dash-title">Owner Dashboard</h1>
          <button onClick={() => { sessionStorage.removeItem('nb_session'); setSession(null); }} className="dash-signout">Sign out</button>
        </div>
        <div className="dash-stats">
          <div className="stat-card accent">
            <p className="stat-label">Services</p>
            <p className="stat-value accent">{data?.services?.length || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Staff</p>
            <p className="stat-value">{data?.staff?.length || 0}</p>
          </div>
        </div>
        <h2 className="section-title" style={{marginBottom:16}}>Staff</h2>
        <div>
          {data?.staff?.map(s => (
            <a key={s.id} href={`/staff/${s.name.toLowerCase().trim().replace(/\s+/g,'-')}`} className="staff-list-link">
              <div className="avatar-circle avatar-md">{s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div>
                <p className="staff-list-name">{s.name}</p>
                <p className="staff-list-role">{s.role || 'Stylist'}</p>
              </div>
              {s.avg_rating > 0 && <p className="staff-list-rating">★ {Number(s.avg_rating).toFixed(1)}</p>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
