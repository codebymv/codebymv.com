import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { getDevicePerformance } from '../utils/performance';

interface Star {
  position: THREE.Vector3;
  brightness: number;
  size: number;
  originalZ: number;
}

const getStarCount = (performance: string) => {
  switch (performance) {
    case 'low': return 25;
    case 'medium': return 35;
    default: return 45;
  }
};

const Constellation: React.FC = () => {
  const { theme, enable3D } = useTheme();
  const { viewport } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const [shouldRegenerate, setShouldRegenerate] = useState(true);
  
  // Theme-based colors and opacities
  const themeColors = useMemo(() => ({
    stars: theme === 'dark' ? '#ffffff' : '#333333',
    lines: theme === 'dark' ? '#ffffff' : '#333333',
    starOpacity: theme === 'dark' ? 1 : 1,
    lineOpacity: theme === 'dark' ? 0.04 : 0.12,
  }), [theme]);

  const count = useMemo(() => {
    if (!enable3D) return 0;
    return getStarCount(getDevicePerformance());
  }, [enable3D]);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setShouldRegenerate(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewport.width, viewport.height, count]);

  const [positions, sizes, opacities, linePositions] = useMemo(() => {
    if (count === 0) return [new Float32Array(0), new Float32Array(0), new Float32Array(0), new Float32Array(0)];
    
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    
    // Detect mobile for improved distribution
    const isMobile = viewport.width <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Adjust scaling based on device type
    const scaleX = viewport.width * (isMobile ? 2.2 : 1.8); // More spread on mobile
    const scaleY = viewport.height * (isMobile ? 2.0 : 1.8); // Slightly less vertical spread on mobile
    const stars: Star[] = [];
    
    // Create stars with more natural distribution
    for (let i = 0; i < count; i++) {
      let x, y, z;
      
      const quadrant = Math.floor(Math.random() * 4);
      const radius = (Math.random() * 0.3 + 0.7) * Math.min(scaleX, scaleY) * 0.5;
      let angle;
      
      switch (quadrant) {
        case 0:
          angle = Math.random() * Math.PI * 0.5;
          break;
        case 1:
          angle = Math.random() * Math.PI * 0.5 + Math.PI * 0.5;
          break;
        case 2:
          angle = Math.random() * Math.PI * 0.5 + Math.PI;
          break;
        default:
          angle = Math.random() * Math.PI * 0.5 + Math.PI * 1.5;
      }
      
      x = Math.cos(angle) * radius;
      y = Math.sin(angle) * radius;
      
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      // Stronger center avoidance on mobile to prevent interference with content
      const centerAvoidanceThreshold = isMobile ? 0.8 : 0.7;
      const centerAvoidance = Math.min(1, distanceFromCenter / (viewport.width * (isMobile ? 0.5 : 0.6)));
      
      if (centerAvoidance < centerAvoidanceThreshold) {
        const pushFactor = isMobile ? (2.0 + Math.random() * 0.8) : (1.5 + Math.random() * 0.5);
        x *= pushFactor;
        y *= pushFactor;
      }
      
      z = Math.random() * -30 - 10;
      
      const brightness = Math.pow(Math.random(), 1.5) * 0.8 + 0.2;
      const size = Math.pow(Math.random(), 2) * 1.5 + 0.5;
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      sizes[i] = size;
      opacities[i] = brightness;
      
      stars.push({
        position: new THREE.Vector3(x, y, z),
        brightness,
        size,
        originalZ: z
      });
    }
    
    // Create fewer, more subtle connections
    const lines: number[] = [];
    const maxDistance = Math.min(scaleX, scaleY) * (isMobile ? 0.3 : 0.4); // Shorter connections on mobile
    
    const sortedStars = [...stars].sort((a, b) => b.brightness - a.brightness);
    
    sortedStars.forEach((star, i) => {
      // Higher brightness threshold on mobile to reduce line density
      const brightnessThreshold = isMobile ? 0.5 : 0.4;
      if (star.brightness < brightnessThreshold) return;
      
      const nearbyStars = sortedStars
        .slice(i + 1)
        .filter(other => {
          const distance = star.position.distanceTo(other.position);
          const isInSameQuadrant = Math.sign(star.position.x) === Math.sign(other.position.x) &&
                                  Math.sign(star.position.y) === Math.sign(other.position.y);
          const otherBrightnessThreshold = isMobile ? 0.4 : 0.3;
          return distance < maxDistance && other.brightness > otherBrightnessThreshold && isInSameQuadrant;
        })
        .slice(0, isMobile ? 1 : 2); // Fewer connections per star on mobile
      
      nearbyStars.forEach(other => {
        lines.push(
          star.position.x, star.position.y, star.position.z,
          other.position.x, other.position.y, other.position.z
        );
      });
    });

    setShouldRegenerate(false);
    return [positions, sizes, opacities, new Float32Array(lines)];
  }, [count, viewport.width, viewport.height, shouldRegenerate]);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // More subtle, organic movement
    const rotationX = Math.sin(time / 120) * 0.008;
    const rotationY = Math.cos(time / 180) * 0.006;
    
    pointsRef.current.rotation.x = rotationX;
    pointsRef.current.rotation.y = rotationY;
    linesRef.current.rotation.x = rotationX;
    linesRef.current.rotation.y = rotationY;
  });

  if (!enable3D || count === 0) return null;

  return (
    <>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          size={theme === 'dark' ? 2 : 3}
          sizeAttenuation={false}
          depthWrite={false}
          blending={theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending}
          color={themeColors.stars}
          opacity={themeColors.starOpacity}
          toneMapped={false}
          alphaTest={theme === 'dark' ? 0.001 : 0.01}
        />
      </Points>
      
      {linePositions.length > 0 && (
        <lineSegments ref={linesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={linePositions.length / 3}
              array={linePositions}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            attach="material"
            color={themeColors.lines}
            transparent
            opacity={themeColors.lineOpacity}
            blending={theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      )}
    </>
  );
};

export { Constellation };