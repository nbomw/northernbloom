// pages/privacy.js
import Link from 'next/link';
export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0D0D0B] p-6 text-white">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#C9973A] text-sm underline mb-4 inline-block">← Home</Link>
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        <div className="space-y-6 text-[#AAA] text-sm leading-relaxed">
          <section><h2 className="text-white font-semibold mb-2">Information We Collect</h2><p>When you book an appointment, we collect your name and phone number. This information is used solely for appointment management.</p></section>
          <section><h2 className="text-white font-semibold mb-2">Data Usage</h2><p>Your data is never sold or shared with third parties. It is stored securely in our database.</p></section>
          <section><h2 className="text-white font-semibold mb-2">Your Rights</h2><p>You may request deletion of your data at any time by contacting hello@northernbloom.in</p></section>
        </div>
      </div>
    </div>
  );
}
