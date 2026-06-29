// pages/owner/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OwnerDashboard() {
  const router = useRouter();
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

  async function login() {
    const res = await fetch('/api/auth', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({pin}) });
    const d = await res.json();
    if (d.success) { sessionStorage.setItem('nb_session', JSON.stringify(d)); setSession(d); }
    else { setError(d.error); setPin(''); }
  }

  if (!session) return (
    <div className="min-h-screen bg-[#0D0D0B] flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-gradient-to-br from-[#C9973A] to-[#E8B84B] rounded-2xl flex items-center justify-center text-2xl font-bold text-[#2D2520] mb-6">NB</div>
      <h1 className="text-white text-xl font-bold mb-2">Owner Access</h1>
      <p className="text-[#888] text-sm mb-8">Enter owner PIN</p>
      <div className="flex gap-3 mb-6">{[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-[#C9973A] border-[#C9973A]' : 'border-[#333]'}`} />)}</div>
      <div className="grid grid-cols-3 gap-3 max-w-[240px]">
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => n !== '' ? <button key={i} onClick={() => {
          if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
          if (pin.length < 4) { const np = pin + n; setPin(np); if (np.length === 4) setTimeout(login, 50); }
        }} className="w-16 h-16 rounded-xl bg-[#1E1A17] text-white text-xl font-bold flex items-center justify-center active:bg-[#333]">{n}</button> : <div key={i} />)}
      </div>
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0D0D0B] p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Owner Dashboard</h1>
          <button onClick={() => { sessionStorage.removeItem('nb_session'); setSession(null); }} className="text-[#888] text-sm underline">Sign out</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#1E1A17] rounded-xl p-4 border border-[#C9973A33]"><p className="text-[#888] text-xs">Services</p><p className="text-2xl font-bold mt-1 text-[#C9973A]">{data?.services?.length || 0}</p></div>
          <div className="bg-[#1E1A17] rounded-xl p-4"><p className="text-[#888] text-xs">Staff</p><p className="text-2xl font-bold mt-1">{data?.staff?.length || 0}</p></div>
        </div>
        <h2 className="text-lg font-semibold mb-4">Staff</h2>
        <div className="space-y-2">
          {data?.staff?.map(s => (
            <a key={s.id} href={`/staff/${s.name.toLowerCase().replace(/\s+/g,'-')}`} className="flex items-center gap-4 bg-[#1E1A17] rounded-xl p-4 hover:border hover:border-[#C9973A33] transition">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9973A] to-[#E8B84B] flex items-center justify-center text-sm font-bold text-[#2D2520]">{s.name.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div className="flex-1"><p className="font-medium">{s.name}</p><p className="text-[#888] text-xs">{s.role || 'Stylist'}</p></div>
              {s.avg_rating > 0 && <p className="text-[#C9973A] text-sm">★ {Number(s.avg_rating).toFixed(1)}</p>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
