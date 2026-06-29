import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [catalog, setCatalog] = useState({ services: [], staff: [] });
  const [step, setStep] = useState('home'); // home | category | service | staff | time | details | confirm | done
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
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/book-catalog')
      .then(r => r.json())
      .then(d => { setCatalog(d); setCatalogLoaded(true); })
      .catch(() => setCatalogLoaded(true));
  }, []);

  const categories = catalogLoaded
    ? [...new Set((catalog.services || []).map(s => s.category))].filter(Boolean)
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

  return (
    <>
      <Head>
        <title>Northern Bloom — Premium Salon, Kathua</title>
        <meta name="description" content="Book appointments at Northern Bloom, Kathua's premium salon. Hair, skin, nails and more." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Mono&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">

        {/* NAV */}
        <nav className="nav">
          <div className="nav-inner">
            <div className="nav-brand">Northern Bloom</div>
            <div className="nav-links">
              <a href="/owner" className="nav-link">Owner</a>
              <button className="btn-book-nav" onClick={() => setStep('category')}>Book Now</button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        {step === 'home' && (
          <section className="hero">
            <div className="hero-inner">
              <div className="hero-eyebrow">Premium Salon · Kathua, J&K</div>
              <h1 className="hero-title">Where Beauty<br />Meets Craft</h1>
              <p className="hero-sub">108 services. 20 expert professionals. Walk in or book ahead — your chair is waiting.</p>
              <div className="hero-cta">
                <button className="btn-primary" onClick={() => setStep('category')}>Book an Appointment</button>
                <a href="/owner" className="btn-ghost">Owner Portal →</a>
              </div>
              <div className="hero-stats">
                <div className="stat"><span className="stat-n">108</span><span className="stat-l">Services</span></div>
                <div className="stat-div" />
                <div className="stat"><span className="stat-n">20</span><span className="stat-l">Experts</span></div>
                <div className="stat-div" />
                <div className="stat"><span className="stat-n">5★</span><span className="stat-l">Rated</span></div>
              </div>
            </div>
            <div className="hero-bg-glow" />
          </section>
        )}

        {/* SERVICES PREVIEW on home */}
        {step === 'home' && catalogLoaded && categories.length > 0 && (
          <section className="services-preview">
            <div className="section-inner">
              <div className="section-label">What We Offer</div>
              <h2 className="section-title">Our Services</h2>
              <div className="cat-grid">
                {categories.slice(0, 8).map(cat => {
                  const count = (catalog.services || []).filter(s => s.category === cat).length;
                  return (
                    <div key={cat} className="cat-card" onClick={() => { setSelectedCategory(cat); setStep('service'); }}>
                      <div className="cat-name">{cat}</div>
                      <div className="cat-count">{count} services</div>
                      <div className="cat-arrow">→</div>
                    </div>
                  );
                })}
              </div>
              {categories.length > 8 && (
                <div className="more-cats" onClick={() => setStep('category')}>+ {categories.length - 8} more categories →</div>
              )}
            </div>
          </section>
        )}

        {/* BOOKING FLOW */}
        {step !== 'home' && step !== 'done' && (
          <div className="booking-wrap">
            <div className="booking-card">

              {/* Progress */}
              <div className="progress">
                {['category','service','staff','time','details','confirm'].map((s, i) => {
                  const steps = ['category','service','staff','time','details','confirm'];
                  const cur = steps.indexOf(step);
                  return (
                    <div key={s} className={`prog-dot ${i <= cur ? 'prog-active' : ''}`} />
                  );
                })}
              </div>

              {/* STEP: category */}
              {step === 'category' && (
                <div className="step">
                  <div className="step-title">Choose a Category</div>
                  {!catalogLoaded && <div className="loading">Loading services…</div>}
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

              {/* STEP: service */}
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
                        <div className="svc-price">₹{parseFloat(svc.price).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: staff */}
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
                        <div className="staff-avatar">{st.name.charAt(0)}</div>
                        <div className="staff-name">{st.name}</div>
                        <div className="staff-role">{st.avg_rating > 0 ? `★ ${parseFloat(st.avg_rating).toFixed(1)}` : 'Staff'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP: time */}
              {step === 'time' && (
                <div className="step">
                  <button className="back-btn" onClick={() => setStep('staff')}>← Back</button>
                  <div className="step-title">Pick a Date & Time</div>
                  <div className="field-group">
                    <label className="field-label">Date</label>
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
                    <button className="btn-primary mt" onClick={() => setStep('details')}>Continue →</button>
                  )}
                </div>
              )}

              {/* STEP: details */}
              {step === 'details' && (
                <div className="step">
                  <button className="back-btn" onClick={() => setStep('time')}>← Back</button>
                  <div className="step-title">Your Details</div>
                  <div className="field-group">
                    <label className="field-label">Name *</label>
                    <input
                      className="field-input"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={e => setForm(f => ({...f, name: e.target.value}))}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Phone *</label>
                    <input
                      className="field-input"
                      placeholder="+91 XXXXX XXXXX"
                      value={form.phone}
                      onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Notes (optional)</label>
                    <textarea
                      className="field-input field-ta"
                      placeholder="Any preferences or special requests"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    />
                  </div>
                  {error && <div className="err">{error}</div>}
                  <button className="btn-primary mt" onClick={() => { if (form.name && form.phone) { setError(''); setStep('confirm'); } else setError('Please fill name and phone'); }}>Review Booking →</button>
                </div>
              )}

              {/* STEP: confirm */}
              {step === 'confirm' && (
                <div className="step">
                  <button className="back-btn" onClick={() => setStep('details')}>← Back</button>
                  <div className="step-title">Confirm Booking</div>
                  <div className="summary-card">
                    <div className="sum-row"><span className="sum-l">Service</span><span className="sum-v">{selectedService?.name}</span></div>
                    <div className="sum-row"><span className="sum-l">Category</span><span className="sum-v">{selectedCategory}</span></div>
                    <div className="sum-row"><span className="sum-l">Price</span><span className="sum-v gold">₹{parseFloat(selectedService?.price||0).toLocaleString('en-IN')}</span></div>
                    <div className="sum-row"><span className="sum-l">Duration</span><span className="sum-v">{selectedService?.duration_mins} min</span></div>
                    <div className="sum-row"><span className="sum-l">Staff</span><span className="sum-v">{selectedStaff?.name || 'Any Available'}</span></div>
                    <div className="sum-row"><span className="sum-l">Date</span><span className="sum-v">{selectedDate}</span></div>
                    <div className="sum-row"><span className="sum-l">Time</span><span className="sum-v">{selectedTime}</span></div>
                    <div className="sum-row"><span className="sum-l">Name</span><span className="sum-v">{form.name}</span></div>
                    <div className="sum-row"><span className="sum-l">Phone</span><span className="sum-v">{form.phone}</span></div>
                  </div>
                  {error && <div className="err">{error}</div>}
                  <button className="btn-primary mt" onClick={handleBook} disabled={loading}>
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
              <div className="done-sub">We'll see you at Northern Bloom. Save your reference number.</div>
              <div className="done-details">
                <div className="sum-row"><span className="sum-l">Service</span><span className="sum-v">{selectedService?.name}</span></div>
                <div className="sum-row"><span className="sum-l">Date</span><span className="sum-v">{selectedDate} at {selectedTime}</span></div>
                <div className="sum-row"><span className="sum-l">Staff</span><span className="sum-v">{selectedStaff?.name || 'Any Available'}</span></div>
              </div>
              <button className="btn-ghost mt" onClick={reset}>Book Another →</button>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">Northern Bloom</div>
            <div className="footer-sub">Premium Salon · Kathua, Jammu & Kashmir</div>
            <div className="footer-links">
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <span className="footer-sep">·</span>
              <a href="/terms" className="footer-link">Terms</a>
              <span className="footer-sep">·</span>
              <a href="/owner" className="footer-link">Owner Login</a>
            </div>
          </div>
        </footer>

      </div>

      <style jsx>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .page {
          min-height: 100vh;
          background: var(--bg, #0a0a0a);
          color: var(--text, #f0f0f0);
          font-family: 'Space Grotesk', sans-serif;
        }

        /* NAV */
        .nav {
          position: sticky; top: 0; z-index: 100;
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border, #1a1a1a);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 16px 24px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .nav-brand {
          font-size: 18px; font-weight: 800;
          color: var(--gold, #C9973A);
          letter-spacing: 0.3px;
        }
        .nav-links { display: flex; gap: 16px; align-items: center; }
        .nav-link {
          color: var(--text-muted, #888); font-size: 14px;
          text-decoration: none;
        }
        .nav-link:hover { color: var(--text, #fff); }
        .btn-book-nav {
          background: var(--gold, #C9973A); color: #000;
          border: none; border-radius: 8px;
          padding: 8px 18px; font-size: 13px; font-weight: 700;
          cursor: pointer;
        }
        .btn-book-nav:hover { opacity: 0.9; }

        /* HERO */
        .hero {
          position: relative; overflow: hidden;
          padding: 100px 24px 80px;
          text-align: center;
        }
        .hero-bg-glow {
          position: absolute; top: -100px; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(201,151,58,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-inner { position: relative; max-width: 700px; margin: 0 auto; }
        .hero-eyebrow {
          font-size: 12px; font-weight: 600;
          color: var(--gold, #C9973A);
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: clamp(42px, 8vw, 72px);
          font-weight: 800; line-height: 1.05;
          color: var(--text, #f0f0f0);
          margin-bottom: 20px;
        }
        .hero-sub {
          font-size: 17px; color: var(--text-muted, #888);
          line-height: 1.6; max-width: 500px; margin: 0 auto 36px;
        }
        .hero-cta {
          display: flex; gap: 14px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 48px;
        }
        .btn-primary {
          background: var(--gold, #C9973A); color: #000;
          border: none; border-radius: 10px;
          padding: 14px 28px; font-size: 15px; font-weight: 700;
          cursor: pointer; transition: opacity 0.2s;
        }
        .btn-primary:hover { opacity: 0.9; }
        .btn-primary:disabled { opacity: 0.5; cursor: default; }
        .btn-primary.mt { margin-top: 16px; width: 100%; }
        .btn-ghost {
          background: transparent;
          color: var(--text-muted, #888);
          border: 1px solid var(--border, #333);
          border-radius: 10px;
          padding: 14px 28px; font-size: 15px; font-weight: 600;
          cursor: pointer; text-decoration: none; display: inline-block;
        }
        .btn-ghost:hover { border-color: var(--gold, #C9973A); color: var(--gold, #C9973A); }
        .btn-ghost.mt { margin-top: 16px; display: block; text-align: center; }
        .hero-stats {
          display: flex; gap: 24px; justify-content: center; align-items: center;
        }
        .stat { display: flex; flex-direction: column; align-items: center; }
        .stat-n { font-size: 28px; font-weight: 800; color: var(--gold, #C9973A); }
        .stat-l { font-size: 12px; color: var(--text-muted, #666); margin-top: 2px; }
        .stat-div { width: 1px; height: 40px; background: var(--border, #333); }

        /* SERVICES PREVIEW */
        .services-preview {
          padding: 60px 24px;
          border-top: 1px solid var(--border, #1a1a1a);
        }
        .section-inner { max-width: 900px; margin: 0 auto; }
        .section-label {
          font-size: 11px; font-weight: 700;
          color: var(--gold, #C9973A);
          letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 8px;
        }
        .section-title {
          font-size: 32px; font-weight: 800;
          color: var(--text, #f0f0f0);
          margin-bottom: 32px;
        }
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }
        .cat-card {
          background: var(--card, #111);
          border: 1px solid var(--border, #222);
          border-radius: 12px;
          padding: 20px 18px;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.15s;
          position: relative;
        }
        .cat-card:hover { border-color: var(--gold, #C9973A); transform: translateY(-2px); }
        .cat-name { font-size: 15px; font-weight: 700; color: var(--text, #f0f0f0); margin-bottom: 4px; }
        .cat-count { font-size: 12px; color: var(--text-muted, #666); }
        .cat-arrow {
          position: absolute; right: 16px; top: 50%;
          transform: translateY(-50%);
          color: var(--gold, #C9973A); font-size: 16px;
          opacity: 0; transition: opacity 0.2s;
        }
        .cat-card:hover .cat-arrow { opacity: 1; }
        .more-cats {
          margin-top: 20px; text-align: center;
          color: var(--gold, #C9973A); font-size: 14px; font-weight: 600;
          cursor: pointer;
        }
        .more-cats:hover { text-decoration: underline; }

        /* BOOKING FLOW */
        .booking-wrap {
          min-height: 70vh;
          display: flex; justify-content: center; align-items: flex-start;
          padding: 40px 16px 80px;
        }
        .booking-card {
          background: var(--card, #111);
          border: 1px solid var(--border, #222);
          border-radius: 16px;
          padding: 32px;
          width: 100%; max-width: 560px;
        }
        .progress {
          display: flex; gap: 8px; justify-content: center;
          margin-bottom: 28px;
        }
        .prog-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--border, #333);
          transition: background 0.2s;
        }
        .prog-active { background: var(--gold, #C9973A); }
        .step { display: flex; flex-direction: column; gap: 16px; }
        .step-title { font-size: 20px; font-weight: 800; color: var(--text, #f0f0f0); }
        .step-sub { font-size: 13px; color: var(--text-muted, #888); margin-top: -10px; }
        .back-btn {
          background: none; border: none;
          color: var(--text-muted, #888); font-size: 13px;
          cursor: pointer; text-align: left; padding: 0;
        }
        .back-btn:hover { color: var(--gold, #C9973A); }
        .loading { color: var(--text-muted, #888); font-size: 14px; padding: 20px 0; text-align: center; }

        /* Category/service list */
        .list-grid { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; }
        .list-item {
          background: var(--bg, #0a0a0a);
          border: 1px solid var(--border, #222);
          border-radius: 8px;
          padding: 14px 16px;
          display: flex; justify-content: space-between; align-items: center;
          cursor: pointer; font-size: 14px; font-weight: 600;
          color: var(--text, #f0f0f0);
        }
        .list-item:hover { border-color: var(--gold, #C9973A); }
        .list-count {
          background: var(--border, #222);
          color: var(--text-muted, #888);
          border-radius: 20px;
          padding: 2px 10px; font-size: 12px;
        }
        .service-list { display: flex; flex-direction: column; gap: 8px; max-height: 420px; overflow-y: auto; }
        .svc-item {
          background: var(--bg, #0a0a0a);
          border: 1px solid var(--border, #222);
          border-radius: 8px; padding: 14px 16px;
          display: flex; justify-content: space-between; align-items: center;
          cursor: pointer;
        }
        .svc-item:hover { border-color: var(--gold, #C9973A); }
        .svc-name { font-size: 14px; font-weight: 600; color: var(--text, #f0f0f0); }
        .svc-dur { font-size: 12px; color: var(--text-muted, #888); margin-top: 2px; }
        .svc-price { font-size: 15px; font-weight: 700; color: var(--gold, #C9973A); }

        /* Staff grid */
        .staff-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 10px; max-height: 380px; overflow-y: auto;
        }
        .staff-card {
          background: var(--bg, #0a0a0a);
          border: 1px solid var(--border, #222);
          border-radius: 10px; padding: 16px 12px;
          text-align: center; cursor: pointer;
        }
        .staff-card:hover { border-color: var(--gold, #C9973A); }
        .staff-any { border-style: dashed; }
        .staff-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--border, #222);
          color: var(--gold, #C9973A);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700;
          margin: 0 auto 8px;
        }
        .staff-name { font-size: 13px; font-weight: 700; color: var(--text, #f0f0f0); }
        .staff-role { font-size: 11px; color: var(--text-muted, #888); margin-top: 2px; }

        /* Time */
        .time-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .time-slot {
          background: var(--bg, #0a0a0a);
          border: 1px solid var(--border, #222);
          border-radius: 8px; padding: 10px;
          text-align: center; font-size: 13px; font-weight: 600;
          color: var(--text, #f0f0f0); cursor: pointer;
        }
        .time-slot:hover { border-color: var(--gold, #C9973A); }
        .time-active { background: var(--gold, #C9973A); color: #000; border-color: var(--gold, #C9973A); }

        /* Fields */
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 11px; font-weight: 700; color: var(--text-muted, #888); text-transform: uppercase; letter-spacing: 0.8px; }
        .field-input {
          background: var(--bg, #0a0a0a);
          border: 1px solid var(--border, #333);
          border-radius: 8px; color: var(--text, #fff);
          padding: 12px 14px; font-size: 14px; outline: none;
          font-family: 'Space Grotesk', sans-serif;
          width: 100%;
        }
        .field-input:focus { border-color: var(--gold, #C9973A); }
        .field-ta { resize: vertical; min-height: 80px; }
        .err { color: #f87171; font-size: 13px; }

        /* Summary */
        .summary-card {
          background: var(--bg, #0a0a0a);
          border: 1px solid var(--border, #222);
          border-radius: 10px; padding: 16px;
          display: flex; flex-direction: column; gap: 10px;
        }
        .sum-row { display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .sum-l { color: var(--text-muted, #888); }
        .sum-v { color: var(--text, #fff); font-weight: 600; text-align: right; max-width: 60%; }
        .sum-v.gold { color: var(--gold, #C9973A); }

        /* Done */
        .done-card { text-align: center; }
        .done-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: rgba(201,151,58,0.15);
          border: 2px solid var(--gold, #C9973A);
          color: var(--gold, #C9973A);
          font-size: 28px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .done-title { font-size: 24px; font-weight: 800; color: var(--text, #fff); margin-bottom: 8px; }
        .done-ref {
          font-size: 20px; font-weight: 700;
          color: var(--gold, #C9973A);
          font-family: 'DM Mono', monospace;
          margin-bottom: 8px;
        }
        .done-sub { font-size: 13px; color: var(--text-muted, #888); margin-bottom: 20px; }
        .done-details { text-align: left; margin-bottom: 8px; display: flex; flex-direction: column; gap: 8px; }

        /* Footer */
        .footer {
          border-top: 1px solid var(--border, #1a1a1a);
          padding: 32px 24px;
          text-align: center;
        }
        .footer-inner { max-width: 600px; margin: 0 auto; }
        .footer-brand { font-size: 16px; font-weight: 800; color: var(--gold, #C9973A); margin-bottom: 6px; }
        .footer-sub { font-size: 12px; color: var(--text-muted, #666); margin-bottom: 14px; }
        .footer-links { display: flex; gap: 12px; justify-content: center; align-items: center; }
        .footer-link { color: var(--text-muted, #666); font-size: 13px; text-decoration: none; }
        .footer-link:hover { color: var(--gold, #C9973A); }
        .footer-sep { color: var(--border, #333); }

        @media (max-width: 600px) {
          .hero { padding: 70px 16px 60px; }
          .hero-title { font-size: 38px; }
          .hero-cta { flex-direction: column; align-items: center; }
          .time-grid { grid-template-columns: repeat(3, 1fr); }
          .booking-card { padding: 20px 16px; }
          .staff-grid { grid-template-columns: repeat(3, 1fr); }
          .cat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </>
  );
}
