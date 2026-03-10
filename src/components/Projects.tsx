import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  year: string;
}

const clientProjects: Project[] = [
  {
    id: 1,
    title: "Itemize.cloud",
    description: "Powerful AI-assisted organization platform for managing projects, noting tasks, and streamlining workflows.",
    image: "/assets/images/itemize.gif",
    tags: ["React", "TypeScript", "Gemini API"],
    link: "https://itemize.cloud",
    year: "2025",
  },
  {
    id: 2,
    title: "MixFade Desktop",
    description: "Analytical tool with powerful comparative audio playback engine. Sleek A/B metering.",
    image: "/assets/images/mixfade.gif",
    tags: ["Electron", "AWS S3", "NSIS"],
    link: "https://mixfade.com",
    year: "2025",
  },
  {
    id: 3,
    title: "Opaque Sound",
    description: "Web-based storefront for digital audio asset sales with secure payment processing.",
    image: "/assets/images/opaquesound.gif",
    tags: ["Shopify", "Liquid", "Stripe"],
    link: "https://opaquesound.com",
    year: "2023",
  },
];

const personalProjects: Project[] = [
  {
    id: 4,
    title: "WiPlayer",
    description: "Work-in-progress audio player with music-responsive visual elements.",
    image: "/assets/images/wiplayer.gif",
    tags: ["React", "Web Audio API", "Three.js"],
    link: "https://wpfs.netlify.app",
    year: "2024",
  },
  {
    id: 5,
    title: "Encoder",
    description: "Users can upload a video, select options and download as a GIF.",
    image: "/assets/images/encoder.gif",
    tags: ["JavaScript", "Video Processing", "Canvas"],
    link: "https://encodermv.netlify.app",
    year: "2024",
  },
  {
    id: 6,
    title: "Forecaster",
    description: "Web-based weather application using the OpenWeatherMap API.",
    image: "/assets/images/forecaster.gif",
    tags: ["JavaScript", "API Handling", "Weather Data"],
    link: "https://forecastermv.netlify.app",
    year: "2024",
  },
];

const ProjectCard: React.FC<{ project: Project; featured?: boolean; index: number }> = ({
  project,
  featured = false,
  index,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (featured) {
    return (
      <motion.a
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        className="group block relative overflow-hidden col-span-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--bg-subtle)]">
            <img
              src={project.image}
              alt={project.title}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--bg-subtle)] to-[color:var(--bg-elevated)]" />
            )}
          </div>

          {/* Content */}
          <div
            className="flex flex-col justify-center p-8 lg:p-12"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
                {project.year}
              </span>
              <span className="w-8 h-px" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="font-body text-xs tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                Featured
              </span>
            </div>

            <h3 className="font-display text-3xl lg:text-4xl italic mb-4" style={{ color: 'var(--text-primary)' }}>
              {project.title}
            </h3>

            <p className="font-body text-base mb-6 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-body text-xs tracking-wide px-3 py-1"
                  style={{
                    color: 'var(--accent)',
                    backgroundColor: 'var(--accent-muted)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div
              className="inline-flex items-center gap-2 font-body text-sm font-medium transition-colors duration-200 group-hover:text-[color:var(--accent)]"
              style={{ color: 'var(--text-primary)' }}
            >
              View Project <ExternalLink size={14} />
            </div>
          </div>
        </div>
      </motion.a>
    );
  }

  return (
    <motion.a
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden mb-5 bg-[color:var(--bg-subtle)]">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.03] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--bg-subtle)] to-[color:var(--bg-elevated)]" />
        )}
        {/* Amber border on hover */}
        <div className="absolute inset-0 border border-transparent group-hover:border-[color:var(--accent)] transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-body text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              {project.year}
            </span>
          </div>
          <h3
            className="font-display text-xl italic mb-2 group-hover:text-[color:var(--accent)] transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            {project.title}
          </h3>
          <p className="font-body text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-body text-xs tracking-wide px-2 py-0.5"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--accent-muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <ExternalLink size={16} className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
      </div>
    </motion.a>
  );
};

const Projects: React.FC = () => {
  const [filter, setFilter] = useState<'client' | 'personal'>('client');

  const projects = filter === 'client' ? clientProjects : personalProjects;
  const featured = projects[0];
  const rest = projects.slice(1);

  return (
    <section id="projects" className="py-24 md:py-32">
      <div className="section-container">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] italic mb-4" style={{ color: 'var(--text-primary)' }}>
            Selected Work
          </h2>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setFilter('client')}
              className={`font-body text-sm tracking-wide pb-1 border-b transition-all duration-200 ${
                filter === 'client'
                  ? 'border-[color:var(--accent)]'
                  : 'border-transparent'
              }`}
              style={{ color: filter === 'client' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              Client
            </button>
            <button
              onClick={() => setFilter('personal')}
              className={`font-body text-sm tracking-wide pb-1 border-b transition-all duration-200 ${
                filter === 'personal'
                  ? 'border-[color:var(--accent)]'
                  : 'border-transparent'
              }`}
              style={{ color: filter === 'personal' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              Personal
            </button>
          </div>
        </motion.div>

        {/* Featured project */}
        <div className="mb-12">
          <ProjectCard key={featured.id} project={featured} featured index={0} />
        </div>

        {/* Other projects — staggered 2-col grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
          {rest.map((project, i) => (
            <div key={project.id} className={i % 2 === 1 ? 'md:mt-12' : ''}>
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
