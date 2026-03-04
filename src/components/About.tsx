import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { Code2, FileCode2, Headphones, TerminalSquare } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

// Register the GSAP TextPlugin
gsap.registerPlugin(TextPlugin);

const TerminalEffect: React.FC<{ text: string }> = ({ text }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inView = useInView(terminalRef, { once: true, amount: 0.5 });
  const [lines, setLines] = useState<React.ReactNode[]>([]);
  const { theme } = useTheme();
  const [animationStarted, setAnimationStarted] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  
  // Clear all timeouts to prevent memory leaks
  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
  };
  
  // Re-render when theme changes
  useEffect(() => {
    if (animationStarted) {
      clearAllTimeouts();
      setLines([]);
      startAnimation();
    }
  }, [theme]);
  
  const startAnimation = () => {
    console.log('Starting terminal animation');
    const linesArray = text.split('\n');
    
    // Clear any existing content
    setLines([]);
    setAnimationStarted(true);
    
    // Process each line with a staggered delay
    linesArray.forEach((line, i) => {
      const lineDelay = i * 0.8; // seconds between lines
      
      const timeoutId = window.setTimeout(() => {
        setLines(prev => {
          const newLines = [...prev];
          
          // Create the line element with proper styling
          if (line.startsWith('$') || line.startsWith('>')) {
            newLines.push(
              <div key={`line-${i}-${theme}-${Date.now()}`} className="line">
                <span style={{ color: theme === 'light' ? '#A23449' : '#1EEFEF' }}>{'> '}</span>
                <TypedText 
                  text={line.startsWith('$') ? line.substring(2) : line.substring(2)} 
                  showCursor={i === linesArray.length - 1} 
                  style={{ color: '#F4F7F7' }} /* Force white text */
                />
              </div>
            );
          } else {
            newLines.push(
              <div key={`line-${i}-${theme}-${Date.now()}`} className="line">
                <TypedText 
                  text={line} 
                  showCursor={i === linesArray.length - 1} 
                  style={{ color: '#F4F7F7' }} /* Force white text */
                />
              </div>
            );
          }
          
          return newLines;
        });
      }, lineDelay * 1000);
      
      timeoutsRef.current.push(timeoutId);
    });
  };
  
  // Start animation when component is in view
  useEffect(() => {
    if (!inView || !terminalRef.current) return;
    startAnimation();
    
    // Cleanup function to clear timeouts if component unmounts
    return () => {
      clearAllTimeouts();
    };
  }, [inView]);
  
  return (
    <div 
      ref={terminalRef} 
      className="font-mono p-4 bg-[#0A1128] border border-nebula-purple/50 rounded-lg overflow-hidden"
      style={{ color: '#F4F7F7' }} /* Force white text regardless of theme */
    >
      {lines}
    </div>
  );
};

// Helper component for typing animation
const TypedText: React.FC<{ text: string; showCursor?: boolean; style?: React.CSSProperties }> = ({ text, showCursor = false, style }) => {
  const textRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    if (!textRef.current) return;
    
    const element = textRef.current;
    
    gsap.to(element, {
      duration: 0.05 * text.length,
      text: {
        value: text,
        delimiter: ''
      },
      ease: 'none',
      onComplete: () => {
        console.log('Typing animation complete for:', text);
      }
    });
  }, [text]);
  
  return (
    <>
      <span ref={textRef} style={style}></span>
      {showCursor && <span className="blink ml-1" style={style}>█</span>}
    </>
  );
};

const About: React.FC = () => {
  const { theme } = useTheme();
  const terminalText = 
`> whoami
mattvalentine

> cat bio.txt
Full-Stack Developer based in Phoenix, AZ with a passion for creating
immersive web experiences that captivate and inspire.

> ls interests/
*music_production  *web_development  *problem_solving  *creativity

> echo $EXPERIENCE
I've had the pleasure of working with businesses to enhance
their web presence, find solutions for their stack, and more.
When not coding, I create music production assets for sale on OpaqueSound.com.`;

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">
            About <span className="text-theme-accent">Me</span>
          </h2>
          <p className="max-w-xl mx-auto text-space-white/80">
            Get to know the developer behind the code.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6">
              <TerminalEffect text={terminalText} />
            </div>
            
            <motion.div 
              className="grid grid-cols-2 gap-4"
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.2 }
                }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { icon: <Code2 className="text-theme-accent" />, text: "Problem Solver" },
                { icon: <FileCode2 className="text-theme-accent" />, text: "Clean Code Advocate" },
                { icon: <TerminalSquare className="text-theme-accent" />, text: "Continuous Learner" },
                { icon: <Headphones className="text-theme-accent" />, text: "Audio Engineer" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 }
                  }}
                  className={`p-4 rounded-lg flex flex-col items-center justify-center text-center ${theme === 'light' ? 'bg-white/80 backdrop-blur-sm' : 'bg-white/5 backdrop-blur-sm'}`}
                >
                  <div className="mb-2 text-2xl">{item.icon}</div>
                  <div className={`font-medium ${theme === 'light' ? 'text-deep-space' : ''}`}>{item.text}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            <div className="aspect-square relative rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-nebula-purple/80 via-transparent to-deep-space/40 mix-blend-multiply z-10" />
              <img 
                src="/assets/images/headshot_draft.png" 
                alt="Matt Valentine" 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20 bg-gradient-to-t from-black/70 to-transparent">
                <h3 className="text-2xl font-bold text-white">Matt Valentine</h3>
                <p className="text-white">Full-Stack Developer</p>
              </div>
            </div>
            
            <div className={`absolute -right-8 -bottom-8 w-64 h-64 rounded-lg border ${
              theme === 'light' 
                ? 'border-nebula-pink/30' 
                : 'border-theme-accent/30'
            } -z-10`} />
            <div className={`absolute -left-8 -top-8 w-64 h-64 rounded-lg border ${
              theme === 'light'
                ? 'border-nebula-pink/30'
                : 'border-bright-teal/30'
            } -z-10`} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;