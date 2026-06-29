// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('nb_session', JSON.stringify(data));
      router.push(data.role === 'owner' ? '/owner' : '/staff');
    } else {
      setError(data.error || 'Invalid PIN');
      setPin('');
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0B] flex flex-col items-center justify-center p-6">
      <div className="w-20 h-20 bg-gradient-to-br from-[#C9973A] to-[#E8B84B] rounded-2xl flex items-center justify-center text-2xl font-bold text-[#2D2520] shadow-lg mb-6">NB</div>
      <h1 className="text-white text-xl font-bold mb-2">Northern Bloom</h1>
      <p className="text-[#888] text-sm mb-8">Enter your PIN</p>
      <div className="flex gap-3 mb-6">
        {[0,1,2,3].map(i => <div key={i} className={`w-4 h-4 rounded-full border-2 ${pin.length > i ? 'bg-[#C9973A] border-[#C9973A]' : 'border-[#333]'}`} />)}
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[240px]">
        {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((n,i) => (
          n !== '' ? <button key={i} onClick={() => {
            if (n === '⌫') { setPin(p => p.slice(0,-1)); return; }
            if (pin.length < 4) { const np = pin + n; setPin(np); if (np.length === 4) setTimeout(submit, 100); }
          }} className="w-16 h-16 rounded-xl bg-[#1E1A17] text-white text-xl font-bold flex items-center justify-center active:bg-[#333]">{n}</button> : <div key={i} />
        ))}
      </div>
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      <a href="/" className="text-[#888] text-xs mt-8 underline">Back to booking</a>
    </div>
  );
}
