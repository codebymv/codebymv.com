import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

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
  const [form, setForm] = useState<FormState>({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

    const formEl = e.target as HTMLFormElement;
    const data = new FormData(formEl);

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
    })
      .then(() => {
        setLoading(false);
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      })
      .catch(() => {
        setLoading(false);
        alert('Error submitting form. Please try again.');
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
    <section id="contact" className="py-24 md:py-32">
      {/* Warm gradient wash */}
      <div
        className="absolute left-0 right-0 h-full pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 80% 50%, var(--accent-muted), transparent)',
        }}
      />

      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left — CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] italic leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
              Let's build<br />
              <span style={{ color: 'var(--accent)' }}>something</span>
            </h2>

            <p className="font-body text-lg mb-10 max-w-md" style={{ color: 'var(--text-secondary)' }}>
              Have a project in mind or want to chat? I'd love to hear from you.
            </p>

            <div className="space-y-4">
              <a
                href="mailto:codebymv@gmail.com"
                className="font-body text-base border-b pb-0.5 transition-colors duration-200 inline-block"
                style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}
              >
                codebymv@gmail.com
              </a>

              <p className="font-body text-sm" style={{ color: 'var(--text-muted)' }}>
                Phoenix, AZ
              </p>

              <div className="flex gap-6 pt-4">
                <a
                  href="https://github.com/codebymv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  GitHub
                </a>
                <a
                  href="https://twitter.com/codebymv"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-sm transition-colors duration-200"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  Twitter
                </a>
              </div>
            </div>
          </motion.div>

          {/* Right — Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <Send size={28} className="mb-4" style={{ color: 'var(--accent)' }} />
                <h3 className="font-display text-2xl italic mb-2" style={{ color: 'var(--text-primary)' }}>
                  Message sent
                </h3>
                <p className="font-body" style={{ color: 'var(--text-secondary)' }}>
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

                <div>
                  <label htmlFor="name" className="font-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--text-muted)' }}>
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
                  {errors.name && <p className="font-body text-xs mt-1 text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="font-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--text-muted)' }}>
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
                  {errors.email && <p className="font-body text-xs mt-1 text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="message" className="font-body text-xs tracking-widest uppercase block mb-2" style={{ color: 'var(--text-muted)' }}>
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
                  {errors.message && <p className="font-body text-xs mt-1 text-red-400">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full font-body font-medium text-sm tracking-wide py-4 transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#111111',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      Send Message <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
