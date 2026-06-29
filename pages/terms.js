// pages/terms.js
import Link from 'next/link';
export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0D0D0B] p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#C9973A] text-sm underline mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        <div className="space-y-6 text-[#AAA] text-sm leading-relaxed">
          <section><h2 className="text-white font-semibold mb-2">Cancellations</h2><p>Cancellations accepted up to 24 hours before appointment. Late cancellations may incur charges.</p></section>
          <section><h2 className="text-white font-semibold mb-2">Pricing</h2><p>Prices in INR, GST applicable where required. Services marked "onwards" are starting prices.</p></section>
          <section><h2 className="text-white font-semibold mb-2">Right to Refuse</h2><p>Northern Bloom reserves the right to refuse service at our discretion.</p></section>
        </div>
      </div>
    </div>
  );
}
