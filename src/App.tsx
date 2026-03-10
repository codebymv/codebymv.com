import { Suspense, lazy } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import GrainOverlay from './components/GrainOverlay';
import WaveformDivider from './components/WaveformDivider';

const Hero = lazy(() => import('./components/Hero'));
const Projects = lazy(() => import('./components/Projects'));
const Skills = lazy(() => import('./components/Skills'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

const Fallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <GrainOverlay />
      <Navbar />
      <main>
        <Suspense fallback={<Fallback />}>
          <Hero />
        </Suspense>

        <WaveformDivider />

        <Suspense fallback={<Fallback />}>
          <Projects />
        </Suspense>

        <WaveformDivider />

        <Suspense fallback={<Fallback />}>
          <Skills />
        </Suspense>

        <WaveformDivider />

        <Suspense fallback={<Fallback />}>
          <About />
        </Suspense>

        <WaveformDivider />

        <Suspense fallback={<Fallback />}>
          <Contact />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function AppWrapper() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default AppWrapper;
