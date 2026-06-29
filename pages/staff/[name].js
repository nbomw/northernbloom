// pages/staff/[name].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

function slugify(name) {
  return (name || '').toLowerCase().trim().replace(/\s+/g, '-');
}

export default function StaffProfile() {
  const router = useRouter();
  const { name } = router.query;
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) return;
    fetch('/api/book-catalog').then(r => r.json()).then(d => {
      const found = (d.staff || []).find(s => slugify(s.name) === name);
      if (found) setProfile(found); else setNotFound(true);
    }).catch(() => setNotFound(true));
    try { const s = JSON.parse(sessionStorage.getItem('nb_session')); setSession(s); } catch {}
  }, [name]);

  async function loginWithPin(fullPin) {
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pin: fullPin }) });
    const data = await res.json();
    // Only unlock the dashboard if the PIN belongs to *this* profile —
    // otherwise any valid staff PIN could view a colleague's dashboard.
    if (data.success && data.role === 'staff' && slugify(data.name) === name) {
      sessionStorage.setItem('nb_session', JSON.stringify(data));
      setSession(data);
    } else if (data.success) {
      setError('This PIN belongs to a different profile');
      setPin('');
    } else {
      setError(data.error || 'Invalid PIN');
      setPin('');
    }
  }

  if (notFound) return (
    <div className="screen screen-center">
      <p className="brand-sub">Staff member not found.</p>
      <a href="/" className="back-link">Back to booking</a>
    </div>
  );

  if (!profile) return (
    <div className="screen screen-center">
      <div className="spinner" />
    </div>
  );

  if (session?.role === 'staff' && slugify(session.name) === name) {
    return <StaffDashboard session={session} profile={profile} />;
  }

  return (
    <div className="screen">
      <div className="container-sm" style={{textAlign:'center'}}>
        <div className="avatar-circle avatar-xl" style={{margin:'0 auto'}}>
          {profile.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
        </div>
        <h1 className="profile-name">{profile.name}</h1>
        <p className="profile-role">{profile.role || 'Stylist'}</p>
        {profile.avg_rating > 0 && <p className="profile-rating">★ {Number(profile.avg_rating).toFixed(1)}</p>}
        {profile.specialities?.length > 0 && (
          <div className="profile-specialities">
            {profile.specialities.map(s => <span key={s} className="speciality-chip">{s}</span>)}
          </div>
        )}
        <div className="profile-divider">
          <p className="brand-sub" style={{marginBottom:16}}>Enter PIN to access dashboard</p>
          <div className="pin-dots" style={{justifyContent:'center'}}>
            {[0,1,2,3].map(i => <div key={i} className={'pin-dot-sm' + (pin.length > i ? ' filled' : '')} />)}
          </div>
          <div className="pin-pad-sm">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => n !== '' ? <button key={i} onClick={() => {
              if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
              if (pin.length < 4) {
                const np = pin + n;
                setPin(np);
                if (np.length === 4) loginWithPin(np);
              }
            }} className="pin-key-sm">{n}</button> : <div key={i} />)}
          </div>
          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function StaffDashboard({ session, profile: p }) {
  return (
    <div className="screen">
      <div className="container-sm">
        <h1 className="dash-title" style={{marginBottom:8}}>Welcome, {session.name}</h1>
        <p className="profile-role" style={{marginBottom:24}}>{p?.role || 'Stylist'}</p>
        <div className="dash-stats" style={{gridTemplateColumns:'repeat(2, 1fr)'}}>
          <div className="stat-card">
            <p className="stat-label">Rating</p>
            <p className="stat-value">{p?.avg_rating ? `★ ${Number(p.avg_rating).toFixed(1)}` : '—'}</p>
          </div>
          <div className="stat-card accent">
            <p className="stat-label">Reviews</p>
            <p className="stat-value accent">{p?.review_count || 0}</p>
          </div>
        </div>
        {p?.specialities?.length > 0 && (
          <div className="stat-card" style={{marginTop:16}}>
            <p className="stat-label" style={{marginBottom:8}}>Specialities</p>
            <div className="profile-specialities" style={{justifyContent:'flex-start'}}>
              {p.specialities.map(s => <span key={s} className="speciality-chip">{s}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
