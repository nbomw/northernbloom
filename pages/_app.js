import '../styles/globals.css';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem('nb-theme');
    const dark = theme !== 'light';
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('nb-theme', next ? 'dark' : 'light');
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? '☀' : '☾'}
      </button>
      <Component {...pageProps} />
    </>
  );
}
