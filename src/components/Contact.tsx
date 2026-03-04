import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MapPin, Loader2 } from 'lucide-react';

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
  const [formState, setFormState] = useState<FormState>({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formState.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formState.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    // Get the form element
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Use the Fetch API to submit the form data to Netlify
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData as any).toString()
    })
      .then(() => {
        setLoading(false);
        setSubmitted(true);
        setFormState({ name: '', email: '', message: '' });
        
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      })
      .catch((error) => {
        console.error('Form submission error:', error);
        setLoading(false);
        alert('There was an error submitting the form. Please try again.');
      });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-nebula-purple/5" />
      
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl font-bold mb-4 text-primary">
            Let's <span className="text-theme-accent">Connect!</span>
          </h2>
          <p className="max-w-xl mx-auto text-secondary">
            Have a project in mind or want to chat? Feel free to reach out!
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-primary">
                Contact Information
              </h3>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-theme-accent/10 p-3 rounded-full">
                    <Mail className="text-theme-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">Email</h4>
                    <a href="mailto:codebymv@gmail.com" className="text-secondary hover:text-nebula-pink transition-colors">
                      codebymv@gmail.com
                    </a>
                  </div>
                </li>
                
                <li className="flex items-start gap-4">
                  <div className="bg-theme-accent/10 p-3 rounded-full">
                    <MapPin className="text-theme-accent" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">Location</h4>
                    <p className="text-secondary">
                      Phoenix, AZ
                    </p>
                  </div>
                </li>
              </ul>
              
              <div className="mt-8 pt-8 border-t border-white/10">
                <h4 className="font-bold mb-4 text-primary">Connect on Social Media</h4>
                <div className="flex gap-4">
                  <a 
                    href="https://github.com/codebymv" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-theme-accent/10 p-3 rounded-full hover:bg-theme-accent/20 transition-colors no-cursor"
                  >
                    <svg className="w-5 h-5 text-theme-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a 
                    href="https://twitter.com/codebymv" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-theme-accent/10 p-3 rounded-full hover:bg-theme-accent/20 transition-colors no-cursor"
                  >
                    <svg className="w-5 h-5 text-theme-accent" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-card-bg backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-primary">
                Send Me a Message
              </h3>
              
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-nebula-pink/20 text-primary p-6 rounded-lg text-center"
                >
                  <div className="inline-block mb-4 p-3 bg-nebula-pink/30 rounded-full">
                    <Send size={24} className="text-nebula-pink" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">Message Sent!</h4>
                  <p className="text-secondary">Thank you for your message. I'll get back to you soon.</p>
                </motion.div>
              ) : (
                <form 
                  name="portfolio-contact"
                  action="/"
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                >
                  {/* Hidden fields for Netlify Forms */}
                  <input type="hidden" name="form-name" value="portfolio-contact" />
                  <div className="hidden">
                    <label>
                      Don't fill this out if you're human: 
                      <input name="bot-field" />
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-primary">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        className={`w-full bg-deep-space/50 border ${
                          errors.name ? 'border-red-500' : 'border-nebula-purple/30'
                        } rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent`}
                        placeholder="Your name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-red-500 text-sm">{errors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-primary">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        className={`w-full bg-deep-space/50 border ${
                          errors.email ? 'border-red-500' : 'border-nebula-purple/30'
                        } rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2 text-primary">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        rows={5}
                        className={`w-full bg-deep-space/50 border ${
                          errors.message ? 'border-red-500' : 'border-nebula-purple/30'
                        } rounded-lg p-3 text-primary focus:outline-none focus:ring-2 focus:ring-theme-accent`}
                        placeholder="Tell me about your project..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-red-500 text-sm">{errors.message}</p>
                      )}
                    </div>
                    
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-theme-accent text-deep-space font-medium py-3 rounded-lg flex items-center justify-center no-cursor"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} className="mr-2" />
                          Send Message
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;