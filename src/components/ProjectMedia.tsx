import React, { useEffect, useRef, useState } from 'react';

interface ProjectMediaProps {
  src: string;
  poster: string;
  label: string;
  className?: string;
}

/** True when the user asked to save data or is on a constrained connection -
 *  serve posters only, never start video playback. */
function isDataConstrained(): boolean {
  type NetInfo = { saveData?: boolean; effectiveType?: string };
  const conn = (navigator as { connection?: NetInfo }).connection;
  if (!conn) return false;
  return Boolean(conn.saveData) || /(^|-)2g$|^3g$/.test(conn.effectiveType ?? '');
}

/**
 * Looping project preview. MP4 instead of GIF (~10x smaller, hardware
 * decoded), playback only while on screen, and the poster itself is only
 * fetched once the card nears the viewport (poster attributes aren't
 * natively lazy). The MP4 source is attached only when near so below-fold
 * cards don't even discover the media URL. Honors prefers-reduced-motion
 * and Save-Data by staying on the poster frame.
 */
const ProjectMedia: React.FC<ProjectMediaProps> = ({ src, poster, label, className }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [posterOnly, setPosterOnly] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const constrained = isDataConstrained();
    const stayOnPoster = reduceMotion || constrained;
    setPosterOnly(stayOnPoster);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          if (!stayOnPoster) video.play().catch(() => {});
        } else if (!stayOnPoster) {
          video.pause();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={near ? poster : undefined}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      aria-label={label}
    >
      {near && !posterOnly ? <source src={src} type="video/mp4" /> : null}
    </video>
  );
};

export default ProjectMedia;
