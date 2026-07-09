import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProfile } from "./useProfile";
import { Hero } from "./Hero";
import { AboutSection } from "./AboutSection";
import { ProjectsSection } from "./ProjectsSection";
import { ContactForm } from "./ContactForm";

export const Landing = () => {
  const { profile, loading } = useProfile();
  const { hash } = useLocation();

  useEffect(() => {
    if (loading) return;

    if (hash) {
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [hash, loading]);

  return (
    <>
      <Hero profile={profile} loading={loading} />
      <AboutSection profile={profile} loading={loading} />
      <ProjectsSection profile={profile} loading={loading} />
      <ContactForm />
    </>
  );
};
