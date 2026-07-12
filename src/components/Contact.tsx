import React, { useState } from 'react';
import SectionHeader from './SectionHeader';
import { useInView } from '../hooks/useInView';

interface FormState {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.message.trim()) e.message = 'Message is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);

    const formEl = e.target as HTMLFormElement;
    const data = new FormData(formEl);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Submit failed');
        setLoading(false);
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      })
      .catch(() => {
        setLoading(false);
        setSubmitError('Something went wrong. Please try again or email me directly.');
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <section id="contact" className="py-24 md:py-32 cv-auto">
      <div className="section-container">
        <SectionHeader
          eyebrow="Contact"
          title={
            <>
              Let's <em className="font-serif italic font-normal">talk</em>
            </>
          }
          endContent={
            <a
              href="mailto:codebymv@gmail.com"
              className="link-draw font-medium tracking-[-0.02em] leading-none text-[clamp(1.25rem,3.5vw,3rem)] break-all md:text-right md:shrink-0 md:pb-1"
              style={{ color: 'var(--accent)' }}
            >
              codebymv@gmail.com
            </a>
          }
        />

        <div ref={ref} className={`reveal ${inView ? 'in-view' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Info */}
            <div className="lg:col-span-5">
              <p className="text-base leading-relaxed max-w-sm mb-10" style={{ color: 'var(--text-secondary)' }}>
                Have a project in mind or want to chat? Send a note, I'd love to hear
                from you.
              </p>

              <div className="space-y-3 font-mono text-[0.6875rem] tracking-[0.15em] uppercase">
                <p style={{ color: 'var(--text-muted)' }}>Tucson, AZ</p>
                <div className="flex gap-6">
                  <a
                    href="https://github.com/codebymv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw transition-colors duration-200 hover:text-[color:var(--accent)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    GitHub
                  </a>
                  <a
                    href="https://x.com/codebymv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-draw transition-colors duration-200 hover:text-[color:var(--accent)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    X
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="flex flex-col justify-center h-full py-16">
                  <p className="text-2xl font-medium tracking-[-0.01em] mb-2">Message sent.</p>
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    I'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form
                  name="portfolio-contact"
                  action="/"
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <input type="hidden" name="form-name" value="portfolio-contact" />
                  <div className="hidden">
                    <label>
                      Don't fill this out: <input name="bot-field" />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="name" className="eyebrow block mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="input-underline"
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="font-mono text-xs mt-2" style={{ color: 'var(--accent)' }}>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="eyebrow block mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-underline"
                        placeholder="your@email.com"
                      />
                      {errors.email && (
                        <p className="font-mono text-xs mt-2" style={{ color: 'var(--accent)' }}>
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="eyebrow block mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      className="input-underline resize-none"
                      placeholder="Tell me about your project..."
                    />
                    {errors.message && (
                      <p className="font-mono text-xs mt-2" style={{ color: 'var(--accent)' }}>
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {submitError && (
                    <p className="font-mono text-xs" style={{ color: 'var(--accent)' }} role="alert">
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="font-body font-medium text-sm tracking-wide px-10 py-4 transition-opacity duration-200 hover:opacity-80 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-primary)',
                    }}
                  >
                    {loading ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
