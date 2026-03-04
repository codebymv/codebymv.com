import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
// import { useSpring } from '@react-spring/three'; // Disabled for performance
import { useTheme } from '../contexts/ThemeContext';
import { getDevicePerformance } from '../utils/performance';

const SpacePlanet: React.FC = () => {
  const { theme } = useTheme();
  const devicePerformance = useMemo(() => getDevicePerformance(), []);

  if (devicePerformance === 'low') {
    return null;
  }
  
  // Simplified geometry for better performance
  const sphereArgs: [number, number, number] = [1.5, 16, 16]; // Reduced from 24, 24
  
  // Disabled spring animation for better performance
  // const { scale } = useSpring({
  //   from: { scale: 0.8 },
  //   to: { scale: 1 },
  //   config: { mass: 1, tension: 280, friction: 60 },
  //   loop: { reverse: true },
  // });
  
  return (
    <Canvas
      style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', width: '300px', height: '300px' }}
      camera={{ position: [0, 0, 4], fov: 40 }} // Reduced from 5, 45
      gl={{ 
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
        stencil: false,
        depth: true,
        logarithmicDepthBuffer: false
      }}
      frameloop="demand" // Only render when needed
    >
      <ambientLight intensity={0.4} /> {/* Increased for better color accuracy */}
      <directionalLight position={[8, 8, 4]} intensity={0.4} color="#ffffff" /> {/* Reduced intensity, added white light */}
      
      <Sphere 
        args={sphereArgs}
        // scale-x={scale} scale-y={scale} scale-z={scale} // Disabled spring animation
      >
        <MeshDistortMaterial
          color={theme === 'light' ? '#A23449' : '#00D4D4'}
          attach="material"
          distort={0.15}
          speed={0.8}
          roughness={0.4}
          metalness={0.3}
        />
      </Sphere>
    </Canvas>
  );
};

export default SpacePlanet;
