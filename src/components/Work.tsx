import React, { useState } from 'react';
import SectionHeader from './SectionHeader';
import ProjectMedia from './ProjectMedia';
import { ArrowUpRight } from './icons';
import { useInView } from '../hooks/useInView';

interface Project {
  title: string;
  description: string;
  /** Short impact line - shown on featured entries only */
  outcome?: string;
  /** Base name in /assets/images - resolves to {media}.mp4 + {media}-poster.webp */
  media: string;
  tags: string[];
  link: string;
  year: string;
}

const FEATURED_TITLES = new Set([
  'SampleSeeker.com',
  'FlashCore.dev',
  'GleamAI.dev',
  'Itemize.cloud',
  'TucsonLovesMusic.com',
]);

const byNewestThenTitle = (a: Project, b: Project) =>
  b.year.localeCompare(a.year) || a.title.localeCompare(b.title);

const projects: Project[] = [
  {
    title: 'SampleSeeker.com',
    description:
      'A sophisticated sample shuffling workspace that functions like a slot machine for music producers to discover obscure audio samples via YouTube with deep genre, era, and obscurity filters.',
    outcome: 'A discovery workspace that turns obscure YouTube audio into usable producer samples.',
    media: 'sampleseeker',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'PostgreSQL'],
    link: 'https://sampleseeker.com',
    year: '2026',
  },
  {
    title: 'GleamAI.dev',
    description:
      'An AI voice agent platform for businesses. Configure conversational agents that handle calls and SMS over Twilio, with live analytics, campaign management, and usage-based billing.',
    outcome: 'Voice agents for calls and SMS with live analytics and usage-based billing.',
    media: 'gleamai',
    tags: ['Next.js (React)', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    link: 'https://gleamai.dev',
    year: '2026',
  },
  {
    title: 'FlashCore.dev',
    description:
      'A high fidelity web gaming hub and instant-play arcade platform designed to revitalize browser-based games with integrated leaderboards, player achievements, and optimized WASM game packaging.',
    outcome: 'Instant-play browser arcade with leaderboards, achievements, and WASM packaging.',
    media: 'flashcore',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vite'],
    link: 'https://flashcore.dev',
    year: '2026',
  },
  {
    title: 'Itemize.cloud',
    description:
      'AI-assisted organization platform for managing projects, noting tasks, and streamlining workflows.',
    outcome: 'AI-assisted project and task organization for faster day-to-day workflows.',
    media: 'itemize',
    tags: ['React', 'TypeScript', 'Gemini API'],
    link: 'https://itemize.cloud',
    year: '2026',
  },
  {
    title: 'TucsonLovesMusic.com',
    description:
      "A full-stack platform connecting Tucson's local music community through live event listings, venue profiles, and talent discovery.",
    outcome: "Connects Tucson's music community through events, venues, and talent discovery.",
    media: 'tucsonlovesmusic',
    tags: ['Next.js (React)', 'TypeScript', 'NestJS', 'PostgreSQL', 'Auth0'],
    link: 'https://tucsonlovesmusic.com',
    year: '2025',
  },
  {
    title: 'MixFade.com & MixFade Desktop',
    description: 'Analytical tool with a comparative audio playback engine and sleek A/B metering.',
    media: 'mixfade',
    tags: ['Electron', 'AWS S3', 'NSIS'],
    link: 'https://mixfade.com',
    year: '2025',
  },
  {
    title: 'OpaqueSound.com',
    description: 'Web-based storefront for digital audio asset sales with secure payment processing.',
    media: 'opaquesound',
    tags: ['Shopify', 'Liquid', 'Stripe'],
    link: 'https://opaquesound.com',
    year: '2023',
  },
  // {
  //   title: 'WiPlayer',
  //   description: 'Audio player with music-responsive visual elements.',
  //   media: 'wiplayer',
  //   tags: ['React', 'Web Audio API', 'Three.js'],
  //   link: 'https://wpfs.netlify.app',
  //   year: '2024',
  // },
  // {
  //   title: 'Encoder',
  //   description: 'Upload a video, select options, and download it as a GIF.',
  //   media: 'encoder',
  //   tags: ['JavaScript', 'Video Processing', 'Canvas'],
  //   link: 'https://encodermv.netlify.app',
  //   year: '2024',
  // },
  // {
  //   title: 'Forecaster',
  //   description: 'Web-based weather application using the OpenWeatherMap API.',
  //   media: 'forecaster',
  //   tags: ['JavaScript', 'API Handling', 'Weather Data'],
  //   link: 'https://forecastermv.netlify.app',
  //   year: '2024',
  // },
];

const featuredProjects = projects.filter((p) => FEATURED_TITLES.has(p.title)).sort(byNewestThenTitle);
const earlierProjects = projects.filter((p) => !FEATURED_TITLES.has(p.title)).sort(byNewestThenTitle);

const WorkEntry: React.FC<{
  project: Project;
  index: number;
  featuredLayout?: boolean;
  showOutcome?: boolean;
}> = ({ project, index, featuredLayout = false, showOutcome = false }) => {
  const { ref, inView } = useInView<HTMLAnchorElement>();

  return (
    <a
      ref={ref}
      href={project.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block reveal ${inView ? 'in-view' : ''} ${featuredLayout ? 'md:col-span-2' : ''}`}
      style={{ transitionDelay: `${(index % 2) * 100}ms` }}
    >
      <span aria-hidden="true" className="index-outline block mb-3">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className={featuredLayout ? 'md:flex md:items-center md:gap-8' : ''}>
        <div className={featuredLayout ? 'md:w-[calc(50%-1rem)] md:shrink-0' : ''}>
          <div className="aspect-[16/10] overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
            <ProjectMedia
              src={`/assets/images/${project.media}.mp4`}
              poster={`/assets/images/${project.media}-poster.webp`}
              label={`${project.title} preview`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </div>
        </div>

        <div className={featuredLayout ? 'md:flex-1' : ''}>
          <div className={`flex items-baseline justify-between gap-4 mt-5 ${featuredLayout ? 'md:mt-0' : ''}`}>
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

          <p
            className="font-mono text-[0.6875rem] tracking-[0.15em] uppercase mt-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {project.tags.join(' · ')}
          </p>

          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {project.description}
          </p>

          {showOutcome && project.outcome ? (
            <p className="mt-3 text-sm font-medium tracking-[-0.01em]" style={{ color: 'var(--text-primary)' }}>
              {project.outcome}
            </p>
          ) : null}
        </div>
      </div>
    </a>
  );
};

const Work: React.FC = () => {
  const [earlierOpen, setEarlierOpen] = useState(false);

  return (
    <section id="work" className="py-10 md:py-24">
      <div className="section-container">
        <SectionHeader eyebrow="Projects" title="Selected Work" titleClassName="mt-3 md:mt-0" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 md:gap-y-20">
          {featuredProjects.map((project, i) => (
            <WorkEntry
              key={project.title}
              project={project}
              index={i}
              showOutcome
              // Odd featured count: first entry spans a full top row
              featuredLayout={featuredProjects.length % 2 === 1 && i === 0}
            />
          ))}
        </div>

        {earlierProjects.length > 0 && (
          <div className="mt-16 md:mt-20">
            <button
              type="button"
              onClick={() => setEarlierOpen((o) => !o)}
              className="flex items-baseline gap-3 font-mono text-[0.6875rem] tracking-[0.2em] uppercase transition-colors duration-200 hover:text-[color:var(--accent)]"
              style={{ color: 'var(--text-secondary)' }}
              aria-expanded={earlierOpen}
              aria-controls="earlier-work"
            >
              <span aria-hidden="true">{earlierOpen ? '−' : '+'}</span>
              Earlier work
              <span style={{ color: 'var(--text-muted)' }}>({earlierProjects.length})</span>
            </button>

            {earlierOpen && (
              <div
                id="earlier-work"
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16 mt-10"
              >
                {earlierProjects.map((project, i) => (
                  <WorkEntry
                    key={project.title}
                    project={project}
                    index={featuredProjects.length + i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;
