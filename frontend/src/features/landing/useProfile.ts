import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

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

export interface Experience {
  role: string;
  company: string;
  period: string;
  projects: Project[];
}

export interface Project {
  name: string;
  duration: string;
  highlights: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { profile, loading, error };
}
