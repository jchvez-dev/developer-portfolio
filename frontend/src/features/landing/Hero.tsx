import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/ui/Button';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import { Skeleton } from '../../components/ui/Skeleton';
import { HiRocketLaunch, HiChatBubbleLeftRight } from 'react-icons/hi2';
import type { Profile } from './useProfile';

interface HeroProps {
  profile: Profile | null;
  loading: boolean;
}

export const Hero = ({ profile, loading }: HeroProps) => {
  const navigate = useNavigate();
  const { setChatOpen } = useApp();

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center py-20 text-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-4 w-96" />
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <Heading as="h1">{profile?.name ?? 'Juan Chavez'}</Heading>
      <Text muted className="mt-2 text-xl">
        {profile?.title ?? ''}
      </Text>

      <div className="mt-10 flex gap-4">
        <Button onClick={() => navigate('/studio')} icon={<HiRocketLaunch className="h-5 w-5" />} iconPosition="right">
          Try Canvas Studio
        </Button>
        <Button variant="secondary" onClick={() => setChatOpen(true)} icon={<HiChatBubbleLeftRight className="h-5 w-5" />} iconPosition="right">
          Ask AI Assistant
        </Button>
      </div>
    </section>
  );
};
