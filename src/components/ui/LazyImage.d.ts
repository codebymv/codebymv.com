import { HTMLMotionProps } from 'framer-motion';

declare const LazyImage: React.ForwardRefExoticComponent<
  Omit<HTMLMotionProps<'img'>, 'ref'> & {
    src: string;
    alt: string;
    className?: string;
    loading?: 'eager' | 'lazy';
    onLoad?: () => void;
    onError?: () => void;
  } & React.RefAttributes<HTMLImageElement>>;

export default LazyImage;
