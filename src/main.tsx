import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted fonts (latin subsets, font-display: swap) - only the weights in
// use, served same-origin instead of render-blocking Google Fonts CSS.
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/500.css';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/geist-mono/400.css';
// Preload the headline/body latin faces. These imports resolve to the same
// hashed URLs the Fontsource CSS uses, so the fetch starts at JS boot instead
// of waiting for first text render - no double download.
import sans500 from '@fontsource/instrument-sans/files/instrument-sans-latin-500-normal.woff2';
import sans400 from '@fontsource/instrument-sans/files/instrument-sans-latin-400-normal.woff2';
import App from './App.tsx';
import './index.css';

for (const href of [sans500, sans400]) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  link.href = href;
  document.head.appendChild(link);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);