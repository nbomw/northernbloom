import '../styles/globals.css';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const theme = localStorage.getItem('nb-theme');
    // Brand defaults to dark when no preference is stored yet.
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
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? '☀' : '☾'}
      </button>
      <Component {...pageProps} />
    </>
  );
}
