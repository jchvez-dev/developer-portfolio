import { Section } from '../../components/ui/Section';
import { Badge } from '../../components/ui/Badge';
import { TechIcon } from '../../components/tech';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Profile } from './useProfile';

interface ProjectsSectionProps {
  profile: Profile | null;
  loading: boolean;
}

export const ProjectsSection = ({ profile, loading }: ProjectsSectionProps) => {
  if (loading) {
    return (
      <section className="py-16">
        <Skeleton className="h-8 w-40" />
        <div className="mt-4 grid grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <Section id="projects" title="Technologies" description="Technologies and tools I work with daily to deliver production-grade software.">
      <div className="mt-8 flex flex-wrap gap-2">
        {profile?.skills.map((skill) => (
          <Badge key={skill} className="inline-flex cursor-pointer items-center gap-1.5 border border-transparent transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-accent/50">
            <TechIcon name={skill} />
            {skill}
          </Badge>
        ))}
      </div>
    </Section>
  );
};
