// pages/terms.js
import Link from 'next/link';
export default function Terms() {
  return (
    <div className="screen">
      <div className="container-md">
        <Link href="/" className="legal-link">← Home</Link>
        <h1 className="legal-h1">Terms of Service</h1>
        <div className="legal-section"><h2>Cancellations</h2><p>Cancellations accepted up to 24 hours before appointment. Late cancellations may incur charges.</p></div>
        <div className="legal-section"><h2>Pricing</h2><p>Prices in INR, GST applicable where required. Services marked "onwards" are starting prices.</p></div>
        <div className="legal-section"><h2>Right to Refuse</h2><p>Northern Bloom reserves the right to refuse service at our discretion.</p></div>
      </div>
    </div>
  );
}
