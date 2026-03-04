import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ fullScreen = false }) => {
  const { theme } = useTheme();
  
  const containerClasses = fullScreen
    ? "fixed inset-0 bg-background flex items-center justify-center z-50"
    : "min-h-screen flex items-center justify-center";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={containerClasses}
    >
      <div className="relative">
        <motion.img 
          src="/assets/images/mv initials icon_transparent.png"
          alt="Loading"
          className="w-16 h-16 object-contain"
          initial={{ scale: 0.8 }}
          animate={{ 
            scale: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div 
          className={`absolute inset-0 border-4 rounded-full animate-spin border-t-transparent ${
            theme === 'dark' 
              ? 'border-bright-teal' 
              : 'border-nebula-pink'
          }`}
        ></div>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner; 