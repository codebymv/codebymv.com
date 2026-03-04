import { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { Constellation } from './components/Constellation';
import Navbar from './components/Navbar';
// import CustomCursor from './components/CustomCursor'; // Disabled for performance testing
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const Hero = lazy(() => import('./components/Hero'));
const Projects = lazy(() => import('./components/Projects'));
const Skills = lazy(() => import('./components/Skills'));
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));

function App() {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`min-h-screen bg-background text-foreground antialiased ${theme}`}>
      <AnimatePresence>
        {loading ? (
          <LoadingSpinner fullScreen />
        ) : (
          <div className="relative">
            {/* <CustomCursor /> */}
            <div className="fixed inset-0 z-0 pointer-events-none">
              <Canvas
                camera={{ 
                  position: [0, 0, 25],
                  fov: 50,
                  near: 0.1,
                  far: 1000
                }}
                gl={{ 
                  antialias: true,
                  alpha: true,
                  stencil: false,
                  depth: true,
                  powerPreference: "high-performance"
                }}
                dpr={Math.min(window.devicePixelRatio, 2)}
                style={{ background: 'transparent' }}
                frameloop="always"
              >
                <Constellation />
              </Canvas>
            </div>
            <ScrollProgress />
            <Navbar />
            <main>
              <Suspense fallback={<LoadingSpinner />}>
                <Hero />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <Projects />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <Skills />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <About />
              </Suspense>
              <Suspense fallback={<LoadingSpinner />}>
                <Contact />
              </Suspense>
            </main>
            <Footer />
          </div>
        )}
      </AnimatePresence>
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