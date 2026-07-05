export interface ProjectHighlight {
  name: string;
  duration: string;
  highlights: string[];
}

export interface Experience {
  role: string;
  company: string;
  period: string;
  projects: ProjectHighlight[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Profile {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  summaryHighlights: string[];
  experience: Experience[];
  skills: string[];
  education: Education[];
}
