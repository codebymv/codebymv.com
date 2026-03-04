import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

type Theme = 'dark' | 'light';

type PerformanceLevel = 'low' | 'medium' | 'high';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  performanceLevel: PerformanceLevel;
  enableAnimations: boolean;
  enableBlur: boolean;
  enable3D: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Performance detection utility - Less aggressive detection
const detectPerformanceLevel = (): PerformanceLevel => {
  // Only disable for explicit reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'medium'; // Changed from 'low' to 'medium'
  }
  
  // Check device memory - be more lenient
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory;
    if (memory < 2) return 'low'; // Changed from 4 to 2
    if (memory < 4) return 'medium'; // Changed from 8 to 4
  }
  
  // Check hardware acceleration - be more lenient
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'medium'; // Changed from 'low' to 'medium'
    
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      // Only flag very old Intel graphics as low
      if (renderer.includes('Intel HD Graphics') && (renderer.includes('2000') || renderer.includes('3000'))) {
        return 'low';
      }
      // Most modern Intel integrated graphics can handle it
      if (renderer.includes('Intel') || renderer.includes('integrated')) {
        return 'medium';
      }
    }
  } catch (e) {
    return 'medium'; // Changed from 'low' to 'medium'
  }
  
  // Check if mobile device
  if (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return 'medium';
  }
  
  return 'high';
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [performanceLevel, setPerformanceLevel] = useState<PerformanceLevel>('medium');
  
  // Performance-based feature flags
  const performanceSettings = useMemo(() => {
    switch (performanceLevel) {
      case 'low':
        return {
          enableAnimations: false,
          enableBlur: false,
          enable3D: false
        };
      case 'medium':
        return {
          enableAnimations: true,
          enableBlur: false,
          enable3D: true
        };
      case 'high':
        return {
          enableAnimations: true,
          enableBlur: true,
          enable3D: true
        };
      default:
        return {
          enableAnimations: true,
          enableBlur: false,
          enable3D: true
        };
    }
  }, [performanceLevel]);

  useEffect(() => {
    // Detect performance level on mount
    const detected = detectPerformanceLevel();
    setPerformanceLevel(detected);
    
    // Apply theme classes
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    
    // Apply performance classes
    if (!performanceSettings.enableAnimations) {
      document.documentElement.classList.add('performance-reduce-motion');
    }
    
    if (!performanceSettings.enableBlur) {
      document.documentElement.classList.add('performance-reduce-blur');
    }
    
    // Set CSS custom properties for performance
    document.documentElement.style.setProperty('--enable-blur', performanceSettings.enableBlur ? '1' : '0');
    document.documentElement.style.setProperty('--animation-speed', performanceSettings.enableAnimations ? '1s' : '0.1s');
    
  }, [theme, performanceSettings]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        toggleTheme, 
        performanceLevel,
        ...performanceSettings
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}