import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import LazyImage from './LazyImage';
import { Project } from './ProjectCarousel';

interface ProjectHeroProps {
  project: Project | null;
  title: string;
  className?: string;
}

export const ProjectHero: React.FC<ProjectHeroProps> = ({ project, title, className = '' }) => {
  if (!project) return null;

  return (
    <motion.div 
      className={`relative rounded-2xl overflow-hidden border border-border/50 dark:border-border/30 bg-card/50 dark:bg-card/20 backdrop-blur-sm shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-8">
        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted/10 lg:aspect-[16/10]">
          <LazyImage
            src={project.image}
            alt={`${project.title} screenshot`}
            className="w-full h-full object-cover"
          />
          {project.gif && (
            <LazyImage
              src={project.gif}
              alt={`${project.title} animation`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                project.gif ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>

        <div className="flex flex-col justify-between h-full">
          <div>
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
              {title}
            </span>
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground text-theme-accent">
              {project.title}
            </h3>
            <p className="text-base lg:text-lg text-muted-foreground mb-6">
              {project.description}
            </p>
            
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              aria-label={`View ${project.title} project`}
            >
              View Project
              <ExternalLink className="h-4 w-4" />
            </a>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                aria-label="View source code on GitHub"
              >
                <Github className="h-5 w-5" />
                <span>Source</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
