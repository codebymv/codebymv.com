import React, { useEffect, useRef } from 'react';

interface ProjectMediaProps {
  src: string;
  poster: string;
  label: string;
  className?: string;
}

/**
 * Looping project preview. MP4 instead of GIF (~10x smaller, hardware
 * decoded), poster for instant paint, and playback only while on screen.
 * Honors prefers-reduced-motion by staying on the poster frame.
 */
const ProjectMedia: React.FC<ProjectMediaProps> = ({ src, poster, label, className }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: '100px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-label={label}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
};

export default ProjectMedia;
