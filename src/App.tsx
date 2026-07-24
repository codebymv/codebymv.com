import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AudioPlayerProvider } from './contexts/AudioPlayerContext';
import { useHashTargetFocus } from './hooks/useHashTargetFocus';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
// Hero is the LCP - load it eagerly to avoid a chunk round-trip before first
// paint. Below-fold sections stay lazy.
import Hero from './components/Hero';

const Work = lazy(() => import('./components/Work'));
const Capabilities = lazy(() => import('./components/Capabilities'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const AudioPlayer = lazy(() => import('./components/AudioPlayer/AudioPlayer'));

const Fallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  useHashTargetFocus();

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        paddingBottom: 'calc(var(--player-bar-height) + env(safe-area-inset-bottom, 0px))',
      }}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero />

        {/* One boundary for below-fold sections — avoids stacked spinner flashes
            as each lazy chunk settles. */}
        <Suspense fallback={<Fallback />}>
          <Work />
          <Capabilities />
          <About />
          <Contact />
        </Suspense>
      </main>
      <Footer />

      <Suspense fallback={null}>
        <AudioPlayer />
      </Suspense>
    </div>
  );
}

function AppWrapper() {
  return (
    <ThemeProvider>
      <AudioPlayerProvider>
        <App />
      </AudioPlayerProvider>
    </ThemeProvider>
  );
}

export default AppWrapper;
