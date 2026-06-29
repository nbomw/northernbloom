// pages/privacy.js
import Link from 'next/link';
export default function Privacy() {
  return (
    <div className="screen">
      <div className="container-md">
        <Link href="/" className="legal-link">← Home</Link>
        <h1 className="legal-h1">Privacy Policy</h1>
        <div className="legal-section"><h2>Information We Collect</h2><p>When you book an appointment, we collect your name and phone number. This information is used solely for appointment management.</p></div>
        <div className="legal-section"><h2>Data Usage</h2><p>Your data is never sold or shared with third parties. It is stored securely in our database.</p></div>
        <div className="legal-section"><h2>Your Rights</h2><p>You may request deletion of your data at any time by contacting hello@northernbloom.in</p></div>
      </div>
    </div>
  );
}
