import { useEffect, useRef, useState } from 'react';
import ProjectMedia from './ProjectMedia';
import { useInView } from '../hooks/useInView';

const isCaseStudyUrl = () => new URLSearchParams(window.location.search).get('case-study') === 'tlm';

export default function FeaturedCaseStudy() {
  const { ref, inView } = useInView<HTMLElement>();
  const [open, setOpen] = useState(isCaseStudyUrl);
  const [copied, setCopied] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const sync = () => setOpen(isCaseStudyUrl());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const modal = dialog.current;
    const returnFocus = trigger.current;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    setCopied(false);
    return () => {
      modal.close();
      document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => returnFocus?.focus({ preventScroll: true }));
    };
  }, [open]);

  const show = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('case-study', 'tlm');
    window.history.pushState(null, '', url);
    pushed.current = true;
    setOpen(true);
  };

  const close = () => {
    if (pushed.current) {
      window.history.back();
    } else {
      const url = new URL(window.location.href);
      url.searchParams.delete('case-study');
      window.history.replaceState(null, '', url);
    }
    setOpen(false);
  };

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('case-study', 'tlm');
    url.hash = 'work';
    try {
      await navigator.clipboard.writeText(url.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <article ref={ref} className={`md:col-span-2 reveal ${inView ? 'in-view' : ''}`}>
        <div className="flex items-center gap-5 mb-3">
          <span aria-hidden="true" className="index-outline">01</span>
          <span className="case-eyebrow" style={{ color: 'var(--accent)' }}>Featured case study</span>
        </div>
        <div className="md:grid md:grid-cols-2 gap-8 items-center">
          <a href="https://tucsonlovesmusic.com" target="_blank" rel="noopener noreferrer" className="block group" aria-label="Visit Tucson Loves Music (opens in new tab)">
            <div className="aspect-[16/10] overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
              <ProjectMedia src="/assets/images/tucsonlovesmusic.mp4" poster="/assets/images/tucsonlovesmusic-poster.webp" label="Tucson Loves Music preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            </div>
          </a>
          <div className="mt-6 md:mt-0">
            <p className="case-eyebrow">Founding engineer · 2024–present</p>
            <h3 className="text-3xl md:text-4xl tracking-[-0.03em] font-medium mt-3">Tucson Loves Music</h3>
            <p className="text-lg leading-relaxed mt-4" style={{ color: 'var(--text-secondary)' }}>From a greenfield build to a live platform for Tucson’s music community.</p>
            <p className="text-sm leading-relaxed mt-3" style={{ color: 'var(--text-secondary)' }}>Event discovery, owner tools, content operations, and memberships. End-to-end engineering ownership as the product and team grew.</p>
            <p className="case-eyebrow mt-5">Next.js · TypeScript · NestJS · PostgreSQL</p>
            <div className="flex flex-wrap items-center gap-5 mt-7">
              <button ref={trigger} type="button" className="case-primary" onClick={show} aria-haspopup="dialog">Read case study <span aria-hidden="true">↗</span></button>
              <a className="case-link" href="https://tucsonlovesmusic.com" target="_blank" rel="noopener noreferrer">Visit live site <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </div>
      </article>

      <dialog ref={dialog} className="case-dialog" aria-labelledby="tlm-case-title" onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
        <div className="case-dialog-inner">
          <div className="case-toolbar">
            <span className="case-eyebrow">Selected work / 01</span>
            <button type="button" className="case-close" onClick={close} autoFocus aria-label="Close case study">Close <span aria-hidden="true">×</span></button>
          </div>
          <div className="case-content">
            <p className="case-eyebrow" style={{ color: 'var(--accent)' }}>Tucson Loves Music</p>
            <h2 id="tlm-case-title" className="case-title">From the first build<br />to a working business.</h2>
            <p className="case-intro">Two years of building, shipping, and evolving a platform for a local music community.</p>
            <dl className="case-facts">
              <div><dt>Role</dt><dd>Founding full-stack engineer</dd></div>
              <div><dt>Timeline</dt><dd>2024–present</dd></div>
              <div><dt>Scope</dt><dd>Product, APIs & operations</dd></div>
            </dl>
            <figure className="my-9">
              <img src="/assets/images/tucsonlovesmusic-poster.webp" alt="Tucson Loves Music live event discovery interface" className="w-full" loading="lazy" />
              <figcaption className="case-eyebrow mt-3">A public discovery experience backed by day-to-day content operations.</figcaption>
            </figure>
            <section className="case-section">
              <h3>The starting point</h3>
              <p>I joined a paid greenfield project that grew into Tucson Loves Music. Over roughly two years, I developed the application into a production platform and grew into a founding engineering role as the team expanded.</p>
              <p>The public product helps people find events, musicians, and venues. Behind it, the business needs reliable ways to maintain profiles, review incoming event data, and support memberships. My work has covered both sides.</p>
            </section>
            <section className="case-section">
              <h3>What I built</h3>
              <div className="case-builds">
                <div><h4>01 / Event discovery</h4><p>React/Next.js interfaces for events, musicians, and venues, with search, date and genre filters, and connected profiles.</p></div>
                <div><h4>02 / Owner & staff tools</h4><p>Profile claims, owner-facing management, administrative curation, and permissions appropriate to each role.</p></div>
                <div><h4>03 / Content operations</h4><p>Integration with an external scraping/ML service, review queues, duplicate handling, and diagnostics for inconsistent records.</p></div>
                <div><h4>04 / Memberships & reach</h4><p>Stripe subscription integration and an embeddable events widget for partner websites.</p></div>
              </div>
            </section>
            <section className="case-section">
              <h3>Decisions behind the product</h3>
              <h4>Review before publication</h4><p>Imported event data needs interpretation and correction. I built review and deduplication workflows so staff can inspect incoming content and resolve issues before publication.</p>
              <h4>Own the whole workflow</h4><p>Ownership, permissions, and billing cross interface and backend boundaries. I worked across React, the NestJS API, and the PostgreSQL data model to deliver complete features.</p>
              <h4>Make maintenance part of delivery</h4><p>My responsibilities included deployments, monitoring, diagnostics, and production fixes. As engineers joined, the process expanded to PR review and coordinated rollouts. I continue contributing within that shared process.</p>
            </section>
            <section className="case-section">
              <h3>The result</h3><p>TLM moved from a greenfield application to a live platform with public discovery, business-facing workflows, content operations, and ongoing development by a growing team.</p>
              <p>This is the work I want to bring to another business: define a useful scope, build the interfaces and integrations, and follow the feature through production feedback.</p>
            </section>
            <section className="case-section">
              <h3>Built with</h3><p>TypeScript · React/Next.js · NestJS · PostgreSQL/TypeORM · Redis · Auth0 · Stripe · AWS S3 · Sentry · CI/CD</p>
            </section>
            <div className="case-end">
              <a href="https://tucsonlovesmusic.com" target="_blank" rel="noopener noreferrer" className="case-primary">Explore live product ↗</a>
              <button type="button" className="case-link" onClick={copyLink}>{copied ? 'Link copied' : 'Copy case-study link'}</button>
              <span className="sr-only" role="status">{copied ? 'Case-study link copied to clipboard.' : ''}</span>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
