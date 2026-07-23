import { Section } from '../../components/ui/Section';
import { Card } from '../../components/ui/Card';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { Skeleton } from '../../components/ui/Skeleton';
import { HiBriefcase, HiAcademicCap } from 'react-icons/hi2';
import type { Profile } from './useProfile';

interface AboutSectionProps {
  profile: Profile | null;
  loading: boolean;
}

export const AboutSection = ({ profile, loading }: AboutSectionProps) => {
  if (loading) {
    return (
      <section className="py-16">
        <Skeleton className="h-8 w-32" />
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <Section id="about" title="About Me">
      <ul className="mt-6 space-y-2">
        {profile?.summaryHighlights.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent" />
            <Text>{item}</Text>
          </li>
        ))}
      </ul>

      <div className="mt-10 space-y-6">
        {profile?.experience.map((exp) => (
          <Card key={exp.role}>
            <Heading as="h3"><HiBriefcase className="mr-1.5 inline h-5 w-5" />{exp.role}</Heading>
            <Text muted small>
              {exp.company} &middot; {exp.period}
            </Text>
            {exp.projects.map((project) => (
              <div key={project.name} className="mt-4">
                <p className="text-sm font-semibold text-accent">
                  {project.name}
                  <span className="text-gray-500"> ({project.duration})</span>
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm text-gray-600 dark:text-gray-400">
                  {project.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Card>
        ))}
      </div>

      {profile?.education && profile.education.length > 0 && (
        <div className="mt-10">
          <Heading as="h2">Education</Heading>
          <div className="mt-4 space-y-4">
            {profile.education.map((edu, i) => (
              <Card key={i}>
                <Heading as="h3"><HiAcademicCap className="mr-1.5 inline h-5 w-5" />{edu.degree}</Heading>
                <Text muted small>
                  {edu.institution} &middot; {edu.year}
                </Text>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
};
