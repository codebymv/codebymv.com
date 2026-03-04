import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ExternalLink, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LazyImage from './LazyImage';
// Simple cn utility since we don't have access to @/lib/utils
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Define Project interface
export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  gif?: string;
  tags: string[];
  link: string;
  github?: string;
  year?: string;
}

interface ProjectCarouselProps {
  projects: Project[];
  title?: string;
  description?: string;
  selectedProjectId?: number | null;
  onProjectSelect?: (project: Project) => void;
}

export const ProjectCarousel = ({ 
  projects, 
  title, 
  description, 
  selectedProjectId = null,
  onProjectSelect
}: ProjectCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: false,
    watchDrag: true
  });

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      onProjectSelect?.(projects[index]);
    }
  }, [emblaApi, projects, onProjectSelect]);

  const handlePrevClick = useCallback(() => {
    console.log('Prev clicked');
    if (!emblaApi) return;
    
    const currentIndex = projects.findIndex(p => p.id === selectedProjectId);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
    
    console.log('Moving to prev index:', prevIndex);
    emblaApi.scrollTo(prevIndex);
    onProjectSelect?.(projects[prevIndex]);
  }, [emblaApi, projects, selectedProjectId, onProjectSelect]);

  const handleNextClick = useCallback(() => {
    console.log('Next clicked');
    if (!emblaApi) return;
    
    const currentIndex = projects.findIndex(p => p.id === selectedProjectId);
    const nextIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
    
    console.log('Moving to next index:', nextIndex);
    emblaApi.scrollTo(nextIndex);
    onProjectSelect?.(projects[nextIndex]);
  }, [emblaApi, projects, selectedProjectId, onProjectSelect]);

  // Use Intersection Observer to only load images when in view
  useEffect(() => {
    if (!emblaApi) return;
    
    // Only initialize animations when in view
    const onScroll = () => {
      // Add any scroll-based optimizations here
    };
    
    emblaApi.on('scroll', onScroll);
    
    return () => {
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi]);
  
  // Optimize scroll performance
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!emblaApi) return;
    
    // Check if we can scroll in the direction of the wheel event
    const canScrollPrev = emblaApi.canScrollPrev();
    const canScrollNext = emblaApi.canScrollNext();
    
    // Prevent page scroll when at boundaries
    if ((e.deltaY < 0 && !canScrollPrev) || 
        (e.deltaY > 0 && !canScrollNext)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [emblaApi]);

  return (
    <div className="mb-16">
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
          id={`${title ? title.toLowerCase().replace(/\s+/g, '-') : 'project'}-carousel`}
        >
          <div className="relative">
            <div 
              className="overflow-hidden px-4 -mx-4" 
              ref={emblaRef}
              onWheel={handleWheel}
              role="region"
              aria-label={`${title} carousel`}
            >
              <div className="flex">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className={`flex-[0_0_100%] sm:flex-[0_0_calc(50%-0.5rem)] lg:flex-[0_0_calc(33.333%-1rem)] px-4 py-2 transition-transform duration-200 ${
                      selectedProjectId === project.id ? 'scale-[1.03]' : 'hover:scale-[1.01]'
                    }`}
                    aria-label={`Project: ${project.title}`}
                    onClick={() => onProjectSelect?.(project)}
                  >
                    <ProjectCard 
                      project={project} 
                      isSelected={selectedProjectId === project.id}
                      onClick={() => onProjectSelect?.(project)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
            
          {projects.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                type="button"
                onClick={handlePrevClick}
                onMouseDown={(e) => e.preventDefault()}
                className="z-10 p-2 rounded-full dark:bg-white/10 dark:hover:bg-white/20 bg-black/5 hover:bg-black/10 transition-colors cursor-pointer select-none hover:scale-105 active:scale-95"
                aria-label="Previous project"
              >
                <ChevronLeft className="h-6 w-6 dark:text-primary text-foreground" />
              </button>
              
              <div className="flex items-center gap-2 mx-2">
                {projects.map((project, index) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      console.log('Dot clicked:', index);
                      scrollTo(index);
                      onProjectSelect?.(project);
                    }}
                    className={cn(
                      'h-2.5 rounded-full transition-all duration-300',
                      project.id === selectedProjectId 
                        ? 'w-6 bg-theme-accent'
                        : 'w-2.5 bg-black/30 dark:bg-white/30 hover:bg-black/50 dark:hover:bg-white/50'
                    )}
                    aria-label={`Go to slide ${index + 1} - ${project.title}`}
                    aria-current={project.id === selectedProjectId ? 'step' : undefined}
                  />
                ))}
              </div>
              
              <button
                type="button"
                onClick={handleNextClick}
                onMouseDown={(e) => e.preventDefault()}
                className="z-10 p-2 rounded-full dark:bg-white/10 dark:hover:bg-white/20 bg-black/5 hover:bg-black/10 transition-colors cursor-pointer select-none hover:scale-105 active:scale-95"
                aria-label="Next project"
              >
                <ChevronRight className="h-6 w-6 dark:text-primary text-foreground" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const ProjectCard = ({ 
  project, 
  isSelected = false,
  onClick 
}: { 
  project: Project;
  isSelected?: boolean;
  onClick?: () => void;
}) => {
  const [isGifLoaded, setIsGifLoaded] = useState(false);
  const [shouldLoadGif, setShouldLoadGif] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Load GIF when card is selected or hovered
  useEffect(() => {
    if ((isSelected || isHovered) && project.gif) {
      setShouldLoadGif(true);
    }
  }, [isSelected, isHovered, project.gif]);

  // Handle GIF visibility based on hover state
  useEffect(() => {
    if (isHovered && project.gif) {
      setShouldLoadGif(true);
    }
  }, [isHovered, project.gif]);

  return (
    <div
      className="project-card group cursor-pointer"
      onClick={onClick}
      role="button"
      aria-selected={isSelected}
      tabIndex={0}
    >
      <div 
        role="article"
        aria-label={`Project: ${project.title}`}
        className={cn(
          'relative rounded-xl transition-all duration-300 h-full flex flex-col',
          'border-2 border-border/50 dark:border-gray-700/50',
          'hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-primary/10',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          isSelected 
            ? 'border-primary dark:border-primary/90 shadow-lg shadow-primary/10 dark:shadow-primary/20 scale-[1.02] z-10' 
            : 'hover:border-primary/50 hover:-translate-y-1',
          'cursor-pointer bg-card/50 dark:bg-card/20 hover:bg-card/70 dark:hover:bg-card/30',
          'backdrop-blur-sm',
          'overflow-hidden' // Ensure rounded corners work with child elements
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
      >
        {/* Project Image */}
        <div className="relative aspect-video overflow-hidden">
          {project.gif && shouldLoadGif ? (
            <>
              <img
                src={project.gif}
                alt={`${project.title} demo`}
                className={cn(
                  'w-full h-full object-cover transition-opacity duration-300',
                  isGifLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setIsGifLoaded(true)}
              />
              <LazyImage
                src={project.image}
                alt={project.title}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
                  isGifLoaded ? 'opacity-0' : 'opacity-100'
                )}
              />
            </>
          ) : (
            <LazyImage
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Project Content */}
        <div className={cn(
          'p-6 flex-1 flex flex-col transition-colors duration-300',
          isSelected ? 'dark:bg-gray-800/50 bg-gray-50/80' : ''
        )}>
          {/* Title and Year */}
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold dark:text-white text-foreground">
              {project.title}
            </h3>
            {project.year && (
              <span className="text-sm dark:text-gray-400 text-muted-foreground">{project.year}</span>
            )}
          </div>
          
          {/* Description - only shown on mobile */}
          <p className="md:hidden dark:text-gray-300 text-muted-foreground text-sm mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="mt-auto flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium dark:bg-gray-700 dark:text-gray-200 bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Project Link */}
          <div className="mt-auto pt-4 border-t dark:border-gray-700 border-border">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-medium dark:text-white text-primary hover:text-primary/80 transition-colors group"
            >
              View Project
              <ExternalLink className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </a>
            
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 inline-flex items-center text-sm font-medium dark:text-gray-400 text-muted-foreground hover:text-foreground transition-colors group"
                aria-label="View on GitHub"
              >
                <Github className="h-4 w-4 mr-1" />
                <span className="sr-only">GitHub</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
