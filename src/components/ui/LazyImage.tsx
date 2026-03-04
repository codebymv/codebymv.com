import { useState, useEffect, useRef, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type LazyImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  onLoad?: () => void;
  onError?: () => void;
} & Omit<HTMLMotionProps<'img'>, 'ref' | 'src' | 'alt' | 'loading'>;

const LazyImage = forwardRef<HTMLImageElement, LazyImageProps>(({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  onLoad,
  onError,
  ...props 
}, ref) => {
  // Use a single ref for both forwarded ref and internal ref
  const combinedRef = useRef<HTMLImageElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // Sync refs
  useEffect(() => {
    const node = combinedRef.current;
    if (node) {
      // Update the forwarded ref
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else {
          (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
        }
      }
      
      // Update our internal ref
      imgRef.current = node;
    }
    
    return () => {
      if (ref && typeof ref !== 'function') {
        (ref as React.MutableRefObject<HTMLImageElement | null>).current = null;
      }
    };
  }, [ref]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState('');
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer to detect when the image is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0.01
      }
    );

    const currentRef = combinedRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  // Handle image load
  useEffect(() => {
    if (!isInView) return;
    
    const img = new Image();
    
    const handleLoad = () => {
      setIsLoaded(true);
      setImageSrc(src);
      if (onLoad) onLoad();
    };
    
    const handleError = () => {
      console.error(`Failed to load image: ${src}`);
      if (onError) onError();
    };
    
    img.src = src;
    img.onload = handleLoad;
    img.onerror = handleError;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, isInView, onLoad, onError]);

  // Show a subtle gradient placeholder while loading
  if (!isLoaded) {
    return (
      <div 
        className={`${className} bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900`}
        style={{ aspectRatio: '16/9' }}
        ref={combinedRef}
      />
    );
  }

  return (
    <motion.img
      ref={combinedRef}
      src={imageSrc}
      alt={alt}
      className={className}
      loading={loading}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      {...props}
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
