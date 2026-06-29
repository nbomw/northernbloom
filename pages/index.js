import { useState, useEffect } from 'react';
import Head from 'next/head';

const STEPS = ['Service', 'Staff', 'Time', 'Details', 'Confirm'];
const CI = { 'Ladies Hair':'💇‍♀️','Gents':'👨','Cleanup':'✨','Facial':'🌸','D-Tan':'☀️','Waxing':'🪒','Threading':'🧵','Nails':'💅','Massage':'💆','Mani+Pedi':'🦶','Bridal':'💍' };
function ci(category) { return CI[category] || '✦'; }

export default function Home() {
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({ service: null, staff: null, date: '', time: '', name: '', phone: '' });
  const [search, setSearch] = useState('');
  const [openCat, setOpenCat] = useState('');
  const [showStaffList, setShowStaffList] = useState(false);
  const [consent, setConsent] = useState(false);
  const [msg, setMsg] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch('/api/book-catalog').then(r => r.json()).then(d => {
      setServices(d.services || []);
      setStaff(d.staff || []);
    }).catch(() => {});
    const d = new Date();
    setBooking(b => ({ ...b, date: d.toISOString().split('T')[0] }));
  }, []);

  // Submit the booking exactly once, when the user reaches the Confirm step.
  useEffect(() => {
    if (step !== 4 || done || msg) return;
    let cancelled = false;

    async function submit() {
      try {
        const datetime = booking.date && booking.time
          ? new Date(`${booking.date}T${booking.time}:00`).toISOString()
          : null;

        const res = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: booking.name,
            customerPhone: booking.phone,
            // service_id is the FK column the catalog API returns for services;
            // id is the FK column (aliased from staff_id) it returns for staff.
            serviceId: booking.service?.service_id,
            staffId: booking.staff?.id ?? null,
            datetime,
            duration_mins: booking.service?.duration_mins || 30,
          })
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success) setDone(true);
        else setMsg(data.error || 'Booking failed');
      } catch (e) {
        if (!cancelled) setMsg('Network error');
      }
    }

    submit();
    return () => { cancelled = true; };
  }, [step]);

  const categories = [...new Set(services.map(s => s.category))].sort();
  const today = new Date().toISOString().split('T')[0];

  const filteredCat = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const matchedStaff = staff.map(s => ({
    ...s,
    score: (s.specialities || []).filter(sp =>
      (booking.service?.category||'').toLowerCase().split(/[\s&]+/).some(w =>
        sp.toLowerCase().split(/[\s&]+/).some(w2 => w === w2 || w.includes(w2) || w2.includes(w))
      )
    ).length
  }));

  function renderStep() {
    switch(step) {
      case 0: return renderSvc();
      case 1: return renderStaffStep();
      case 2: return renderTime();
      case 3: return renderDetails();
      case 4: return renderConfirmStatus();
    }
  }

  function pickSvc(s) { setBooking(b => ({ ...b, service: s })); setStep(1); }

  function renderSvc() {
    return (
      <div>
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input" placeholder="Search services…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {search ? (
          <div className="svc-grid">
            {filteredCat.map(s => (
              <div key={s.id} className="svc-card" onClick={() => pickSvc(s)}>
                <span className="svc-card-icon">{ci(s.category)}</span>
                <div className="svc-card-info"><div className="svc-card-name">{s.name}</div><div className="svc-card-meta">₹{Number(s.price).toLocaleString('en-IN')}</div></div>
              </div>
            ))}
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat}>
              <div className="cat-btn" onClick={() => setOpenCat(openCat === cat ? '' : cat)}>
                <span className="cat-btn-icon">{ci(cat)}</span>
                <span><div className="cat-btn-name">{cat}</div><div className="cat-btn-count">{services.filter(s => s.category === cat).length} services</div></span>
                <span className="cat-btn-arrow">{openCat === cat ? '▲' : '▼'}</span>
              </div>
              {openCat === cat && (
                <div className="cat-menu open">
                  {services.filter(s => s.category === cat).map(s => (
                    <div key={s.id} className="svc-card" onClick={() => pickSvc(s)}>
                      <span className="svc-card-icon-sm">{ci(s.category)}</span>
                      <div><div className="svc-card-name">{s.name}</div><div className="svc-card-meta">₹{Number(s.price).toLocaleString('en-IN')}</div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  function renderStaffStep() {
    return (
      <div>
        <div className="staff-card selected" id="any-staff" onClick={() => { setBooking(b => ({ ...b, staff: null })); setStep(2); }}>
          <div className="avatar">✦</div>
          <div><div style={{fontWeight:600}}>Surprise Me</div><div style={{fontSize:'0.78rem',color:'#888'}}>Best available stylist</div></div>
        </div>
        <button className="btn btn-ghost btn-full" style={{marginBottom:8,fontSize:'0.82rem'}} onClick={() => setShowStaffList(!showStaffList)}>
          {showStaffList ? '▲ Hide list' : '▼ Pick a specific stylist'}
        </button>
        {showStaffList && matchedStaff.map(s => (
          <div key={s.id} className="staff-card" onClick={() => { setBooking(b => ({ ...b, staff: s })); setStep(2); }}>
            <div className="avatar">{s.name[0]}</div>
            <div>
              <div><strong>{s.name}</strong> {s.avg_rating > 0 && <span style={{color:'#C9973A',fontSize:'0.8rem'}}>★ {Number(s.avg_rating).toFixed(1)}</span>}</div>
              <div style={{fontSize:'0.75rem',color:'#888'}}>{s.role || 'Stylist'}{s.score > 0 && ' ✓ Best match'}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderTime() {
    const slots = [];
    for (let h = 9; h <= 20; h++)
      for (let m = 0; m < 60; m += 30)
        if (!(h === 20 && m > 0)) slots.push(h.toString().padStart(2,'0')+':'+m.toString().padStart(2,'0'));

    return (
      <div>
        <input type="date" value={booking.date} min={today} max={new Date(Date.now()+30*86400000).toISOString().split('T')[0]}
          className="input" onChange={e => setBooking(b => ({ ...b, date: e.target.value }))} />
        <div className="slot-grid">
          {slots.map(t => <div key={t} className={'slot' + (booking.time === t ? ' selected' : '')}
            onClick={() => { setBooking(b => ({ ...b, time: t })); setStep(3); }}>{t}</div>)}
        </div>
      </div>
    );
  }

  function renderDetails() {
    return (
      <div>
        <h3>Your Details</h3>
        <input className="input" placeholder="Full Name *" value={booking.name} onChange={e => setBooking(b => ({ ...b, name: e.target.value }))} />
        <div style={{display:'flex',gap:8}}>
          <span style={{padding:'12px 0',fontWeight:600}}>+91</span>
          <input className="input" style={{flex:1}} placeholder="98765 43210" value={booking.phone.replace('+91','')} onChange={e => setBooking(b => ({ ...b, phone: '+91' + e.target.value }))} />
        </div>
        <label style={{display:'flex',alignItems:'flex-start',gap:8,fontSize:'0.78rem',color:'#888',margin:'12px 0'}}>
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
          I consent to using my phone number for appointment communication.
        </label>
        <button className="btn btn-primary btn-full" disabled={!consent || !booking.name}
          onClick={() => { if (booking.name) setStep(4); }}>Continue</button>
      </div>
    );
  }

  function renderConfirmStatus() {
    if (msg) {
      return (
        <div className="empty">
          <p className="empty-text">{msg}</p>
          <button className="btn btn-outline" style={{marginTop:16}} onClick={() => { setMsg(''); setStep(3); }}>Back to Details</button>
        </div>
      );
    }
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p className="empty-text">Confirming your appointment…</p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page">
        <div className="success-screen">
          <h2>Appointment Confirmed!</h2>
          <p>See you on {booking.date} at {booking.time}.</p>
          <div className="review-card">
            <div><span>Name</span><span>{booking.name}</span></div>
            {booking.service && <div><span>Service</span><span>{booking.service.name}</span></div>}
          </div>
          <button className="btn btn-outline" onClick={() => { setDone(false); setStep(0); setBooking({service:null,staff:null,date:today,time:'',name:'',phone:''}); }}>Book Another</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head><title>Northern Bloom — Premium Salon Kathua</title></Head>
      <div className="site-header">
        <div className="logo"><div className="logo-mark">NB</div><div className="logo-text">Northern Bloom</div></div>
      </div>
      <div id="step-indicator">
        {/* Horizontal progress bar behind the dots */}
        <div id="progress-bar-container">
          <div id="progress-bar-fill" style={{ width: `${STEPS.length > 1 ? (step / (STEPS.length - 1)) * 100 : 0}%` }} />
        </div>
        {STEPS.map((s, i) => (
          <div key={s} className="step-item" style={{ animationDelay: `${i * 0.12}s` }}>
            <div className={'step-dot' + (i < step ? ' done' : i === step ? ' active' : '')}>{i < step ? '✓' : i + 1}</div>
            <div className="step-label">{s}</div>
          </div>
        ))}
      </div>
      <div className="page" style={{padding:20}}>
        {renderStep()}
        {msg && <div className="toast show">{msg}</div>}
        {step > 0 && <button className="btn btn-ghost btn-full" style={{marginTop:16}} onClick={() => setStep(step - 1)}>← Back</button>}
      </div>
    </>
  );
}
