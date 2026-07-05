import type { Profile } from '../features/landing/useProfile';

export const mockProfile: Profile = {
  name: 'Juan Chavez',
  title: 'Senior Software Engineer',
  location: 'Remote',
  email: 'juan@example.com',
  phone: '+123456789',
  linkedin: 'https://linkedin.com/in/juanchavez',
  github: 'https://github.com/juanchavez',
  summaryHighlights: [
    'Full-stack engineer with 8+ years of experience',
    'Specialist in React, Node.js, and cloud-native architectures',
  ],
  experience: [
    {
      role: 'Senior Engineer',
      company: 'Tech Corp',
      period: '2022 - Present',
      projects: [
        {
          name: 'Platform Migration',
          duration: '6 months',
          highlights: ['Migrated monolith to microservices'],
        },
      ],
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS'],
  education: [
    { degree: 'B.S. Computer Science', institution: 'University', year: '2016' },
  ],
};
