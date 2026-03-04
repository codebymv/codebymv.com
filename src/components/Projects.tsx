import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProjectCarousel, ProjectHero, type Project, ChevronDown } from './ui';

const clientSites: Project[] = [
  {
      id: 1,
      title: "ITEMIZE.CLOUD",
      description: "Powerful AI-assisted organization platform for managing projects, noting tasks, etc.",
      image: "/assets/images/itemize.gif",
      gif: "/assets/images/itemize.gif",
      tags: ["React","Typescript", "Gemini API"],
      link: "https://itemize.cloud",
      year: "2025"
    },
    {
    id: 2,
    title: "MIXFADE DESKTOP",
    description: "Analytical tool with powerful comparitive audio playback engine. Sleek A/B metering.",
    image: "/assets/images/mixfade.gif",
    gif: "/assets/images/mixfade.gif",
    tags: ["Electron","AWS S3", "NSIS"],
    link: "https://mixfade.com",
    year: "2025"
  },
    {
    id: 3,
    title: "OPAQUE SOUND",
    description: "Web-based store front for digital audio asset sales with secure payment processing.",
    image: "/assets/images/opaquesound.gif",
    gif: "/assets/images/opaquesound.gif",
    tags: ["Shopify","Liquid", "Stripe"],
    link: "https://opaquesound.com",
    year: "2023"
  }
];

const personalProjects: Project[] = [
  {
    id: 1,
    title: "WIPLAYER",
    description: "Work-in-progress audio player with music-responsive visual elements.",
    image: "/assets/images/wiplayer.gif",
    tags: ["React", "Web Audio API", "Three.js"],
    link: "https://wpfs.netlify.app",
    year: "2024",
  },
  {
    id: 2,
    title: "ENCODER",
    description: "Users can upload a video, select options and download as a GIF.",
    image: "/assets/images/encoder.gif",
    tags: ["JavaScript", "Video Processing", "Canvas"],
    link: "https://encodermv.netlify.app",
    year: "2024",
  },
  {
    id: 3,
    title: "FORECASTER",
    description: "Web-based weather application using the OpenWeatherMap API.",
    image: "/assets/images/forecaster.gif",
    tags: ["JavaScript", "API Handling", "Weather Data"],
    link: "https://forecastermv.netlify.app",
    year: "2024",
  }
];

const Projects: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<Project | null>(clientSites[0]);
  const [selectedPersonal, setSelectedPersonal] = useState<Project | null>(personalProjects[0]);
  const [clientExpanded, setClientExpanded] = useState(true);
  const [personalExpanded, setPersonalExpanded] = useState(true);

  return (
    <section id="work" className="py-20 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="space-y-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">My<span className="text-theme-accent"> Work</span></h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A selection of projects I've worked on
          </p>
        </div>

        {/* Client Projects Section */}
        <section className="space-y-8">
          <button 
            type="button"
            onClick={() => {
              console.log('Client button clicked');
              setClientExpanded(!clientExpanded);
            }}
            className="w-full flex items-center justify-between bg-transparent text-left p-4 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 className="text-2xl font-bold">Client Apps</h3>
              <p className="text-muted-foreground">Projects built for clients</p>
            </div>
            <ChevronDown 
              className={`h-6 w-6 text-foreground transform transition-transform duration-200 ${
                clientExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {clientExpanded && (
            <div className="space-y-12">
              <div className="hidden lg:block max-w-6xl mx-auto px-4">
                <ProjectHero 
                  project={selectedClient} 
                  title="Client Project"
                  className="min-h-[400px]"
                />
              </div>
              
              <div className="max-w-7xl mx-auto">
                <ProjectCarousel
                  projects={clientSites}
                  selectedProjectId={selectedClient?.id}
                  onProjectSelect={setSelectedClient}
                />
              </div>
            </div>
          )}
        </section>

        {/* Personal Projects Section */}
        <section className="space-y-8">
          <button 
            type="button"
            onClick={() => {
              console.log('Personal button clicked');
              setPersonalExpanded(!personalExpanded);
            }}
            className="w-full flex items-center justify-between bg-transparent text-left p-4 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div>
              <h3 className="text-2xl font-bold">Personal Projects</h3>
              <p className="text-muted-foreground">Side endeavors and experiments</p>
            </div>
            <ChevronDown 
              className={`h-6 w-6 text-foreground transform transition-transform duration-200 ${
                personalExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>

          {personalExpanded && (
            <div className="space-y-12">
              <div className="hidden lg:block max-w-6xl mx-auto px-4">
                <ProjectHero 
                  project={selectedPersonal} 
                  title="Personal Project"
                  className="min-h-[400px]"
                />
              </div>
              
              <div className="max-w-7xl mx-auto">
                <ProjectCarousel
                  projects={personalProjects}
                  selectedProjectId={selectedPersonal?.id}
                  onProjectSelect={setSelectedPersonal}
                />
              </div>
            </div>
          )}
        </section>
      </motion.div>
    </section>
  );
};

export default Projects;