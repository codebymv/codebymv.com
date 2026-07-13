import React, { useState } from 'react';
import SectionHeader from './SectionHeader';
import { useInView } from '../hooks/useInView';

const About: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section id="about" className="py-24 md:py-32 cv-auto">
      <div className="section-container">
        <SectionHeader eyebrow="About" title="A little background" />

        <div
          ref={ref}
          className={`reveal grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start ${inView ? 'in-view' : ''}`}
        >
          {/* Headshot */}
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] overflow-hidden" style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <img
                src="/assets/images/headshot_draft.webp"
                alt="Matt Valentine"
                width={800}
                height={1000}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="lg:col-span-7 max-w-xl">
            <p className="text-xl md:text-2xl leading-snug tracking-[-0.01em] mb-8">
              Full-stack engineer in Tucson, shipping products on the web and tools for people who make music.
            </p>

            <div className="space-y-5 text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              <p>
                I work across the stack with businesses to sharpen their web presence, automate workflows
                with AI, and choose systems that fit the problem, not the other way around. Day to day that
                means React and TypeScript on the front, solid APIs and data layers behind them, and enough
                product sense to keep the build useful.
              </p>
              <p>
                The other half of my practice is audio. I produce music and design the tools I wish existed,
                from{' '}
                <a
                  href="https://opaquesound.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw"
                  style={{ color: 'var(--accent)' }}
                >
                  OpaqueSound.com
                </a>
                , a storefront for digital production assets, to{' '}
                <a
                  href="https://mixfade.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-draw"
                  style={{ color: 'var(--accent)' }}
                >
                  MixFade
                </a>
                , a comparative A/B analysis app I designed and built from scratch. VST coming soon.
              </p>
            </div>

            <hr className="rule my-8" />

            <p className="font-mono text-[0.6875rem] tracking-[0.15em] uppercase" style={{ color: 'var(--text-muted)' }}>
              Problem solving · Clean code · Continuous learning · Engineering
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
