import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  const [catalog, setCatalog] = useState({ services: [], staff: [] });
  const [step, setStep] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [form, setForm] = useState({ name: '', phone: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch('/api/book-catalog')
      .then(r => r.json())
      .then(d => { setCatalog(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categories = catalog.services?.length
    ? [...new Set(catalog.services.map(s => s.category))].filter(Boolean)
    : [];

  const servicesInCategory = selectedCategory
    ? (catalog.services || []).filter(s => s.category === selectedCategory)
    : [];

  const timeSlots = () => {
    const slots = [];
    for (let h = 9; h <= 19; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
      if (h < 19) slots.push(`${String(h).padStart(2,'0')}:30`);
    }
    return slots;
  };

  const todayStr = () => new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    if (!form.name.trim()) { setError('Please enter your name'); return; }
    if (!form.phone.trim()) { setError('Please enter your phone'); return; }
    setLoading(true);
    setError('');
    try {
      const datetime = selectedDate + 'T' + selectedTime + ':00.000Z';
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          customerPhone: form.phone,
          serviceId: selectedService?.service_id,
          staffId: selectedStaff?.id || null,
          datetime,
          duration_mins: selectedService?.duration_mins || 30,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');
      setReference(data.reference);
      setStep('done');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('home');
    setSelectedCategory(null);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    setForm({ name: '', phone: '' });
    setNotes('');
    setError('');
    setReference('');
  };

  const formatPrice = (p) => `₹${parseFloat(p || 0).toLocaleString('en-IN')}`;

  return (
    <>
      <Head>
        <title>Northern Bloom — Premium Salon, Kathua</title>
        <meta name="description" content="Book appointments at Northern Bloom, Kathua's premium salon. Hair, skin, nails and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* NAV */}
      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-brand">Northern Bloom</a>
          <div className="nav-links">
            <a href="/owner" className="nav-link">Owner</a>
            <button className="btn-gold" style={{ padding: '10px 24px', fontSize: 10 }} onClick={() => setStep('category')}>
              Book Now
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      {step === 'home' && (
        <section style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'var(--ink)',
          paddingTop: 80,
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(201,168,76,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: 0, left: '50%', width: 1, height: '100%',
            background: 'linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.18) 40%, rgba(201,168,76,0.18) 60%, transparent 100%)',
            transform: 'translateX(-50%)', pointerEvents: 'none',
          }} />

          {/* Corner ornaments */}
          {[{top:80,left:40},{top:80,right:40},{bottom:80,left:40},{bottom:80,right:40}].map((pos,i) => (
            <div key={i} style={{
              position:'absolute', ...pos, width:40, height:40,
              borderTop: i<2 ? '1px solid rgba(201,168,76,0.25)' : 'none',
              borderBottom: i>=2 ? '1px solid rgba(201,168,76,0.25)' : 'none',
              borderLeft: i%2===0 ? '1px solid rgba(201,168,76,0.25)' : 'none',
              borderRight: i%2===1 ? '1px solid rgba(201,168,76,0.25)' : 'none',
              pointerEvents:'none',
            }} />
          ))}

          <div style={{ textAlign: 'center', padding: '100px 24px 80px', position: 'relative', maxWidth: 780, margin: '0 auto' }}>
            <div className="reveal-fade delay-1" style={{ marginBottom: 44 }}>
              <Image src="/logo.png" alt="Northern Bloom" width={90} height={90}
                style={{ objectFit: 'contain', filter: 'drop-shadow(0 0 32px rgba(201,168,76,0.35))' }} />
            </div>
            <div className="reveal-up delay-1 eyebrow" style={{ marginBottom: 28, opacity: 0.7 }}>
              Est. Kathua · Jammu &amp; Kashmir
            </div>
            <h1 className="reveal-up delay-2 serif" style={{
              fontSize: 'clamp(52px, 10vw, 96px)', fontWeight: 300, lineHeight: 1.02,
              letterSpacing: '-0.01em', color: 'var(--parchment)', marginBottom: 8,
            }}>
              Northern
            </h1>
            <h1 className="reveal-up delay-3 serif gold-shimmer" style={{
              fontSize: 'clamp(52px, 10vw, 96px)', fontWeight: 700, lineHeight: 1.02,
              letterSpacing: '-0.01em', marginBottom: 36, fontStyle: 'italic',
            }}>
              Bloom
            </h1>
            <p className="reveal-up delay-3" style={{
              fontSize: 'clamp(15px, 1.8vw, 17px)', color: 'var(--parchment-dim)',
              lineHeight: 1.75, maxWidth: 420, margin: '0 auto 52px', fontWeight: 300,
            }}>
              Premium salon artistry in Kathua — hair, skin, nails &amp; bridal, crafted for every occasion.
            </p>
            <div className="reveal-up delay-4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-gold" onClick={() => setStep('category')}>Book an Appointment</button>
              <a href="https://wa.me/919419283217" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost">WhatsApp Us</button>
              </a>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span className="eyebrow" style={{ opacity: 0.3, fontSize: 9 }}>Scroll</span>
            <div style={{ width: 1, height: 48, background: 'linear-gradient(180deg, var(--gold), transparent)', opacity: 0.4 }} />
          </div>
        </section>
      )}

      {/* SERVICES PREVIEW on home */}
      {step === 'home' && catalog.services?.length > 0 && (
        <>
          <div className="divider" />
          <section style={{ padding: '100px 32px', background: 'var(--ink-2)' }}>
            <div style={{ maxWidth: 1280, margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start', marginBottom: 72 }}>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 20 }}>Services</div>
                  <h2 className="serif" style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 300, lineHeight: 1.1, color: 'var(--parchment)' }}>
                    What we<br /><em style={{ fontWeight: 600, color: 'var(--gold-warm)' }}>do best</em>
                  </h2>
                </div>
                <p style={{ fontSize: 15, color: 'var(--parchment-dim)', lineHeight: 1.8, fontWeight: 300, paddingTop: 16 }}>
                  From a quick threading to a full bridal transformation — every service is delivered with care, precision, and the right products for lasting results.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 2 }}>
                {categories.slice(0, 8).map((cat, i) => {
                  const count = (catalog.services || []).filter(s => s.category === cat).length;
                  return (
                    <div key={cat} onClick={() => { setSelectedCategory(cat); setStep('service'); }} style={{
                      padding: '36px 24px', background: 'var(--ink-3)',
                      borderTop: '1px solid var(--border-soft)',
                      borderLeft: i === 0 ? '1px solid var(--border-soft)' : 'none',
                      borderRight: '1px solid var(--border-soft)',
                      borderBottom: '1px solid var(--border-soft)',
                      cursor: 'pointer', transition: 'background 0.2s, border-color 0.2s',
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 16 }}>✦</div>
                      <div className="serif" style={{ fontSize: 18, fontWeight: 500, color: 'var(--parchment)', marginBottom: 6, lineHeight: 1.2 }}>{cat}</div>
                      <div className="eyebrow" style={{ fontSize: 9, opacity: 0.5 }}>{count} service{count !== 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
              </div>
              {categories.length > 8 && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button className="btn-ghost" onClick={() => setStep('category')}>
                    + {categories.length - 8} more categories →
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* BOOKING FLOW */}
      {step !== 'home' && step !== 'done' && (
        <div className="booking-wrap">
          <div className="booking-card">
            <div className="progress">
              {['category','service','staff','time','details','confirm'].map((s, i) => {
                const steps = ['category','service','staff','time','details','confirm'];
                const cur = steps.indexOf(step);
                return <div key={s} className={`prog-dot ${i <= cur ? 'prog-active' : ''}`} />;
              })}
            </div>

            {step === 'category' && (
              <div className="step">
                <div className="step-title">Choose a Category</div>
                {!catalog.services?.length && <div className="loading">Loading services…</div>}
                <div className="list-grid">
                  {categories.map(cat => (
                    <div key={cat} className="list-item" onClick={() => { setSelectedCategory(cat); setStep('service'); }}>
                      <span>{cat}</span>
                      <span className="list-count">{(catalog.services||[]).filter(s=>s.category===cat).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'service' && (
              <div className="step">
                <button className="back-btn" onClick={() => setStep('category')}>← Back</button>
                <div className="step-title">{selectedCategory}</div>
                <div className="service-list">
                  {servicesInCategory.map(svc => (
                    <div key={svc.service_id} className="svc-item" onClick={() => { setSelectedService(svc); setStep('staff'); }}>
                      <div>
                        <div className="svc-name">{svc.name}</div>
                        <div className="svc-dur">{svc.duration_mins} min</div>
                      </div>
                      <div className="svc-price">{formatPrice(svc.price)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'staff' && (
              <div className="step">
                <button className="back-btn" onClick={() => setStep('service')}>← Back</button>
                <div className="step-title">Choose Staff</div>
                <div className="step-sub">for {selectedService?.name}</div>
                <div className="staff-grid">
                  <div className="staff-card staff-any" onClick={() => { setSelectedStaff(null); setStep('time'); }}>
                    <div className="staff-avatar">✦</div>
                    <div className="staff-name">Any Available</div>
                    <div className="staff-role">Best match</div>
                  </div>
                  {(catalog.staff || []).map(st => (
                    <div key={st.id} className="staff-card" onClick={() => { setSelectedStaff(st); setStep('time'); }}>
                      <div className="staff-avatar">{st.name?.charAt(0) || '?'}</div>
                      <div className="staff-name">{st.name}</div>
                      <div className="staff-role">{st.avg_rating > 0 ? `★ ${parseFloat(st.avg_rating).toFixed(1)}` : 'Staff'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 'time' && (
              <div className="step">
                <button className="back-btn" onClick={() => setStep('staff')}>← Back</button>
                <div className="step-title">Pick a Date &amp; Time</div>
                <div>
                  <div className="field-label">Date</div>
                  <input
                    type="date"
                    className="field-input"
                    min={todayStr()}
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                  />
                </div>
                {selectedDate && (
                  <div className="time-grid">
                    {timeSlots().map(t => (
                      <div
                        key={t}
                        className={`time-slot ${selectedTime === t ? 'time-active' : ''}`}
                        onClick={() => setSelectedTime(t)}
                      >{t}</div>
                    ))}
                  </div>
                )}
                {selectedDate && selectedTime && (
                  <button className="btn-gold" style={{ marginTop: 8, width: '100%' }} onClick={() => setStep('details')}>Continue →</button>
                )}
              </div>
            )}

            {step === 'details' && (
              <div className="step">
                <button className="back-btn" onClick={() => setStep('time')}>← Back</button>
                <div className="step-title">Your Details</div>
                <div>
                  <div className="field-label">Name *</div>
                  <input className="field-input" placeholder="Your full name"
                    value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
                </div>
                <div>
                  <div className="field-label">Phone *</div>
                  <input className="field-input" placeholder="+91 XXXXX XXXXX"
                    value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                </div>
                <div>
                  <div className="field-label">Notes (optional)</div>
                  <textarea className="field-input" style={{ resize: 'vertical', minHeight: 80 }}
                    placeholder="Any preferences or special requests"
                    value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                {error && <div className="err">{error}</div>}
                <button className="btn-gold" style={{ width: '100%' }}
                  onClick={() => { if (form.name && form.phone) { setError(''); setStep('confirm'); } else setError('Please fill name and phone'); }}>
                  Review Booking →
                </button>
              </div>
            )}

            {step === 'confirm' && (
              <div className="step">
                <button className="back-btn" onClick={() => setStep('details')}>← Back</button>
                <div className="step-title">Confirm Booking</div>
                <div className="summary-card">
                  <div className="sum-row"><span className="sum-l">Service</span><span className="sum-v">{selectedService?.name}</span></div>
                  <div className="sum-row"><span className="sum-l">Category</span><span className="sum-v">{selectedCategory}</span></div>
                  <div className="sum-row"><span className="sum-l">Price</span><span className="sum-v gold">{formatPrice(selectedService?.price)}</span></div>
                  <div className="sum-row"><span className="sum-l">Duration</span><span className="sum-v">{selectedService?.duration_mins} min</span></div>
                  <div className="sum-row"><span className="sum-l">Staff</span><span className="sum-v">{selectedStaff?.name || 'Any Available'}</span></div>
                  <div className="sum-row"><span className="sum-l">Date</span><span className="sum-v">{selectedDate}</span></div>
                  <div className="sum-row"><span className="sum-l">Time</span><span className="sum-v">{selectedTime}</span></div>
                  <div className="sum-row"><span className="sum-l">Name</span><span className="sum-v">{form.name}</span></div>
                  <div className="sum-row"><span className="sum-l">Phone</span><span className="sum-v">{form.phone}</span></div>
                </div>
                {error && <div className="err">{error}</div>}
                <button className="btn-gold" style={{ width: '100%' }} onClick={handleBook} disabled={loading}>
                  {loading ? 'Booking…' : 'Confirm Appointment ✓'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DONE */}
      {step === 'done' && (
        <div className="booking-wrap">
          <div className="booking-card done-card">
            <div className="done-icon">✓</div>
            <div className="done-title">Booking Confirmed!</div>
            <div className="done-ref">{reference}</div>
            <div className="done-sub">We&apos;ll see you at Northern Bloom. Save your reference number.</div>
            <div className="done-details">
              <div className="sum-row"><span className="sum-l">Service</span><span className="sum-v">{selectedService?.name}</span></div>
              <div className="sum-row"><span className="sum-l">Date</span><span className="sum-v">{selectedDate} at {selectedTime}</span></div>
              <div className="sum-row"><span className="sum-l">Staff</span><span className="sum-v">{selectedStaff?.name || 'Any Available'}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-ghost" onClick={reset}>Book Another →</button>
              <a href={`https://wa.me/919419283217?text=${encodeURIComponent(`Hi! I just booked at Northern Bloom. Ref: ${reference}`)}`}
                target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button className="btn-gold">WhatsApp Salon</button>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* CTA SECTION */}
      {step === 'home' && (
        <>
          <div className="divider" />
          <section style={{ padding: '120px 32px', background: 'var(--ink)', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', maxWidth: 560, margin: '0 auto' }}>
              <Image src="/logo.png" alt="NB" width={56} height={56}
                style={{ objectFit: 'contain', opacity: 0.5, marginBottom: 40, filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.2))' }} />
              <h2 className="serif" style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 300, color: 'var(--parchment)', lineHeight: 1.1, marginBottom: 24 }}>
                Ready to feel<br /><em className="gold-shimmer" style={{ fontWeight: 700 }}>beautiful?</em>
              </h2>
              <p style={{ fontSize: 15, color: 'var(--parchment-dim)', lineHeight: 1.75, marginBottom: 52, fontWeight: 300 }}>
                Walk in or book ahead — we&apos;re in Kathua, J&K, and we&apos;re ready for you.
              </p>
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-gold" onClick={() => setStep('category')}>Book Now</button>
                <a href="https://wa.me/919419283217" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <button className="btn-ghost">WhatsApp Us</button>
                </a>
              </div>
              <div style={{ marginTop: 48, fontSize: 13, color: 'var(--parchment-dim)', opacity: 0.5 }}>+91 94192 83217</div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-brand">Northern Bloom</div>
              <div className="footer-sub">Premium Salon · Kathua, Jammu &amp; Kashmir</div>
              <div className="footer-links">
                <a href="/privacy" className="footer-link">Privacy Policy</a>
                <span className="footer-sep">·</span>
                <a href="/terms" className="footer-link">Terms</a>
                <span className="footer-sep">·</span>
                <a href="/owner" className="footer-link">Owner Login</a>
              </div>
            </div>
          </footer>

          {/* Mobile sticky book */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            padding: '16px 20px',
            background: 'linear-gradient(0deg, rgba(12,11,9,0.98) 0%, transparent 100%)',
            display: 'flex', justifyContent: 'center',
          }}>
            <button className="btn-gold" style={{
              width: '100%', maxWidth: 340, padding: '16px', fontSize: 12, letterSpacing: '0.16em',
              boxShadow: '0 0 32px rgba(201,168,76,0.25)',
            }} onClick={() => setStep('category')}>
              Book an Appointment
            </button>
          </div>
        </>
      )}
    </>
  );
}
