import React from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';

interface Skill {
  id: number;
  name: string;
  icon: string;
  category: 'frontend' | 'backend' | 'other';
}

const skills: Skill[] = [
  { id: 1, name: 'HTML', icon: '🌐', category: 'frontend' },
  { id: 2, name: 'CSS', icon: '🎨', category: 'frontend' },
  { id: 3, name: 'JavaScript', icon: '⚡', category: 'frontend' },
  { id: 4, name: 'TypeScript', icon: '🔷', category: 'frontend' },
  { id: 5, name: 'React', icon: '🔵', category: 'frontend' },
  { id: 6, name: 'Next.js', icon: '▲', category: 'frontend' },
  { id: 7, name: 'Node.js', icon: '🟢', category: 'backend' },
  { id: 8, name: 'NestJS', icon: '🛡️', category: 'backend' },
  { id: 9, name: 'MongoDB', icon: '🍃', category: 'backend' },
  { id: 10, name: 'PostgreSQL', icon: '🐘', category: 'backend' },
  { id: 11, name: 'MSSQL', icon: '📊', category: 'backend' },
  { id: 12, name: 'OOP', icon: '🧩', category: 'other' },
  { id: 13, name: 'SCRUM', icon: '📋', category: 'other' },
  { id: 14, name: 'Git', icon: '📦', category: 'other' },
  { id: 15, name: 'Docker', icon: '🐳', category: 'other' },
  { id: 16, name: 'Electron', icon: '⚛️', category: 'other' }
];

interface ShapeProps {
  position: [number, number, number];
  color: string;
  speed: number;
}

const RotatingShape: React.FC<ShapeProps & { shape: 'box' | 'sphere' | 'torus' }> = ({ 
  position, color, speed, shape 
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);
  
  React.useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.random() * Math.PI;
    meshRef.current.rotation.y = Math.random() * Math.PI;
  }, []);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() * speed;
    meshRef.current.rotation.x = Math.sin(t / 4) * 2;
    meshRef.current.rotation.y = t;
  });
  
  const material = <meshStandardMaterial color={color} roughness={0.5} metalness={0.8} />
  
  return (
    <mesh ref={meshRef} position={position}>
      {shape === 'box' && <boxGeometry args={[1, 1, 1]} />}
      {shape === 'sphere' && <sphereGeometry args={[0.7, 32, 32]} />}
      {shape === 'torus' && <torusGeometry args={[0.7, 0.3, 16, 32]} />}
      {material}
    </mesh>
  );
};

const BackgroundShapes: React.FC<{ currentTheme: string }> = ({ currentTheme }) => {
  // Theme-dependent colors
  const primaryColor = currentTheme === 'light' ? "#EFA8B0" : "#1EEFEF"; // Main accent color
  const secondaryColor = currentTheme === 'light' ? "#7B506F" : "#7B506F"; // Consistent purple in both themes
  
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <RotatingShape position={[-3, 2, -5]} color={primaryColor} speed={0.3} shape="box" />
      <RotatingShape position={[3, -2, -6]} color={secondaryColor} speed={0.5} shape="sphere" />
      <RotatingShape position={[-2, -3, -4]} color={primaryColor} speed={0.4} shape="torus" />
      <RotatingShape position={[5, 0, -7]} color={secondaryColor} speed={0.2} shape="box" />
    </>
  );
};

const Skills: React.FC = () => {
  const { theme } = useTheme();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const skillVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <section id="skills" className="py-24 relative overflow-hidden">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center relative z-10"
        >
          <h2 className="text-4xl font-bold mb-4 text-primary">
            Technical <span className="text-theme-accent">Skills</span>
          </h2>
          <p className="max-w-xl mx-auto text-secondary">
             Various technologies and methodologies, 
            with a focus on creating exceptional web experiences.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
          {['frontend', 'backend', 'other'].map((category) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: category === 'frontend' ? -30 : category === 'backend' ? 0 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6"
            >
              <h3 className="text-2xl font-bold mb-6 capitalize text-theme-accent">
                {category}
              </h3>
              
              <motion.ul 
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                {skills
                  .filter(skill => skill.category === category)
                  .map(skill => (
                    <motion.li 
                      key={skill.id} 
                      variants={skillVariants} 
                      className="flex items-center gap-3 text-primary"
                    >
                      <span className="text-xl">{skill.icon}</span>
                      <span className="font-medium">{skill.name}</span>
                    </motion.li>
                  ))
                }
              </motion.ul>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 opacity-40">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <BackgroundShapes currentTheme={theme} />
        </Canvas>
      </div>
    </section>
  );
};

export default Skills;