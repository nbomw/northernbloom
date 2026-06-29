// pages/staff/[name].js
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function StaffProfile() {
  const router = useRouter();
  const { name } = router.query;
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!name) return;
    fetch('/api/book-catalog').then(r => r.json()).then(d => {
      const found = d.staff.find(s => s.name.toLowerCase() === name.replace(/-/g, ' '));
      if (found) setProfile(found);
    }).catch(() => {});
    try { const s = JSON.parse(sessionStorage.getItem('nb_session')); setSession(s); } catch {}
  }, [name]);

  async function loginWithPin() {
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({pin}) });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('nb_session', JSON.stringify(data));
      setSession(data);
    } else { setError(data.error || 'Invalid PIN'); setPin(''); }
  }

  if (!profile) return <div className="min-h-screen bg-[#0D0D0B] flex items-center justify-center text-white"><div className="animate-spin w-8 h-8 border-2 border-[#C9973A] border-t-transparent rounded-full" /></div>;

  if (session?.role === 'staff') return <StaffDashboard session={session} profile={profile} />;

  return (
    <div className="min-h-screen bg-[#0D0D0B] p-6 text-white">
      <div className="max-w-md mx-auto text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#C9973A] to-[#E8B84B] rounded-full flex items-center justify-center text-2xl font-bold text-[#2D2520] mb-4">
          {profile.name.split(' ').map(w=>w[0]).join('').slice(0,2)}
        </div>
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <p className="text-[#C9973A] text-sm uppercase tracking-wider mt-1">{profile.role || 'Stylist'}</p>
        {profile.avg_rating > 0 && <p className="text-[#C9973A] mt-2">★ {Number(profile.avg_rating).toFixed(1)}</p>}
        {profile.specialities?.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-center mt-4">
            {profile.specialities.map(s => <span key={s} className="px-3 py-1 bg-[#1E1A17] border border-[#C9973A33] rounded-full text-xs text-[#C9973A]">{s}</span>)}
          </div>
        )}
        <div className="mt-8 border-t border-[#2a2a2a] pt-8">
          <p className="text-[#888] text-sm mb-4">Enter PIN to access dashboard</p>
          <div className="flex gap-2 justify-center mb-4">
            {[0,1,2,3].map(i => <div key={i} className={`w-3 h-3 rounded-full border ${pin.length > i ? 'bg-[#C9973A] border-[#C9973A]' : 'border-[#333]'}`} />)}
          </div>
          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => n !== '' ? <button key={i} onClick={() => {
              if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
              if (pin.length < 4) { const np = pin + n; setPin(np); if (np.length === 4) { loginWithPin(); } }
            }} className="w-14 h-14 rounded-xl bg-[#1E1A17] text-white text-lg font-bold flex items-center justify-center active:bg-[#333]">{n}</button> : <div key={i} />)}
          </div>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function StaffDashboard({ session, profile: p }) {
  return (
    <div className="min-h-screen bg-[#0D0D0B] p-6 text-white">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Welcome, {session.name}</h1>
        <p className="text-[#C9973A] text-sm uppercase tracking-wider mb-6">{p?.role || 'Stylist'} • {p?.experience_years ? `${p.experience_years} yrs exp` : 'New team member'}</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1E1A17] rounded-xl p-4">
              <p className="text-[#888] text-xs">Rating</p>
              <p className="text-2xl font-bold mt-1">{p?.avg_rating ? `★ ${Number(p.avg_rating).toFixed(1)}` : '—'}</p>
            </div>
            <div className="bg-[#1E1A17] rounded-xl p-4 border border-[#C9973A33]">
              <p className="text-[#888] text-xs">Reviews</p>
              <p className="text-2xl font-bold mt-1 text-[#C9973A]">{p?.review_count || 0}</p>
            </div>
          </div>
          {p?.specialities?.length > 0 && (
            <div className="bg-[#1E1A17] rounded-xl p-4">
              <p className="text-[#888] text-xs mb-2">Specialities</p>
              <div className="flex gap-2 flex-wrap">
                {p.specialities.map(s => <span key={s} className="px-3 py-1 bg-[#2D2520] border border-[#C9973A33] rounded-full text-xs text-[#C9973A]">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
