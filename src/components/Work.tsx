import React from 'react';
import SectionHeader from './SectionHeader';
import ProjectMedia from './ProjectMedia';
import { ArrowUpRight } from './icons';
import { useInView } from '../hooks/useInView';

interface Project {
  title: string;
  description: string;
  /** Base name in /assets/images — resolves to {media}.mp4 + {media}-poster.jpg */
  media: string;
  tags: string[];
  link: string;
  year: string;
  kind: 'Client' | 'Personal';
}

const projects: Project[] = [
  {
    title: 'SampleSeeker.com',
    description: 'A sophisticated sample-seeking workspace for music producers to discover obscure audio samples via YouTube with deep genre, era, and obscurity filters.',
    media: 'sampleseeker',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'PostgreSQL'],
    link: 'https://sampleseeker.com',
    year: '2026',
    kind: 'Personal',
  },
  {
    title: 'FlashCore.dev',
    description: 'A high-fidelity web gaming hub and instant-play arcade platform designed to revitalize browser-based games with integrated leaderboards, player achievements, and optimized WASM game packaging.',
    media: 'flashcore',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vite'],
    link: 'https://flashcore.dev',
    year: '2026',
    kind: 'Personal',
  },
  {
    title: 'Itemize.cloud',
    description: 'AI-assisted organization platform for managing projects, noting tasks, and streamlining workflows.',
    media: 'itemize',
    tags: ['React', 'TypeScript', 'Gemini API'],
    link: 'https://itemize.cloud',
    year: '2025',
    kind: 'Client',
  },
  {
    title: 'MixFade.com & MixFade Desktop',
    description: 'Analytical tool with a comparative audio playback engine and sleek A/B metering.',
    media: 'mixfade',
    tags: ['Electron', 'AWS S3', 'NSIS'],
    link: 'https://mixfade.com',
    year: '2025',
    kind: 'Client',
  },
  {
    title: 'OpaqueSound.com',
    description: 'Web-based storefront for digital audio asset sales with secure payment processing.',
    media: 'opaquesound',
    tags: ['Shopify', 'Liquid', 'Stripe'],
    link: 'https://opaquesound.com',
    year: '2023',
    kind: 'Client',
  },
  {
    title: 'WiPlayer',
    description: 'Audio player with music-responsive visual elements.',
    media: 'wiplayer',
    tags: ['React', 'Web Audio API', 'Three.js'],
    link: 'https://wpfs.netlify.app',
    year: '2024',
    kind: 'Personal',
  },
  {
    title: 'Encoder',
    description: 'Upload a video, select options, and download it as a GIF.',
    media: 'encoder',
    tags: ['JavaScript', 'Video Processing', 'Canvas'],
    link: 'https://encodermv.netlify.app',
    year: '2024',
    kind: 'Personal',
  },
  {
    title: 'Forecaster',
    description: 'Web-based weather application using the OpenWeatherMap API.',
    media: 'forecaster',
    tags: ['JavaScript', 'API Handling', 'Weather Data'],
    link: 'https://forecastermv.netlify.app',
    year: '2024',
    kind: 'Personal',
  },
];

const WorkEntry: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
  const { ref, inView } = useInView<HTMLAnchorElement>();

  return (
    <a
      ref={ref}
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block reveal ${inView ? 'in-view' : ''}`}
      style={{ transitionDelay: `${(index % 2) * 100}ms` }}
    >
      {/* Index number */}
      <span aria-hidden="true" className="index-outline block mb-3">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Media */}
      <div className="aspect-[16/10] overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <ProjectMedia
          src={`/assets/images/${project.media}.mp4`}
          poster={`/assets/images/${project.media}-poster.jpg`}
          label={`${project.title} preview`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </div>

      {/* Meta */}
      <div className="flex items-baseline justify-between gap-4 mt-5">
        <h3 className="flex items-center gap-2 text-xl md:text-2xl font-medium tracking-[-0.01em] transition-colors duration-200 group-hover:text-[color:var(--accent)]">
          {project.title}
          <ArrowUpRight
            size={18}
            className="opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300"
          />
        </h3>
        <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
          {project.year}
        </span>
      </div>

      <p className="font-mono text-[0.6875rem] tracking-[0.15em] uppercase mt-2" style={{ color: 'var(--text-muted)' }}>
        {[project.kind, ...project.tags].join(' · ')}
      </p>

      <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {project.description}
      </p>
    </a>
  );
};

const Work: React.FC = () => {
  return (
    <section id="work" className="py-24 md:py-32">
      <div className="section-container">
        <SectionHeader eyebrow="Projects" title="Selected Work" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 md:gap-y-20">
          {projects.map((project, i) => (
            <WorkEntry key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
