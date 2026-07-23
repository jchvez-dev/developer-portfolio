import {
  SiTypescript, SiJavascript, SiReact, SiNextdotjs, SiVuedotjs, SiAngular,
  SiNodedotjs, SiExpress, SiNestjs, SiPython, SiGo, SiRust, SiPhp,
  SiLaravel, SiDocker, SiKubernetes, SiPostgresql, SiMongodb, SiRedis,
  SiTailwindcss, SiHtml5, SiCss, SiGit, SiGithub, SiLinux, SiNginx,
  SiGraphql, SiFigma, SiVite, SiWebpack, SiEslint, SiPrettier, SiJest,
  SiTerraform, SiJenkins, SiNpm, SiYarn, SiPnpm, SiCloudflare, SiVercel,
  SiNetlify, SiDigitalocean, SiDjango, SiFlask, SiSymfony, SiStorybook,
  SiCypress, SiCircleci, SiAnsible, SiBabel, SiBun, SiRuby,
  SiMarkdown,
} from 'react-icons/si';
import { FaAws } from 'react-icons/fa';
import { DiScrum } from 'react-icons/di';
import { VscGitPullRequest, VscSparkle, VscJson, VscCode } from 'react-icons/vsc';
import type { IconType } from 'react-icons/lib';

const iconMap: Record<string, IconType> = {
  typescript: SiTypescript,
  javascript: SiJavascript,
  js: SiJavascript,
  ts: SiTypescript,
  react: SiReact,
  'react.js': SiReact,
  'react native': SiReact,
  nextjs: SiNextdotjs,
  'next.js': SiNextdotjs,
  vue: SiVuedotjs,
  angular: SiAngular,
  node: SiNodedotjs,
  'node.js': SiNodedotjs,
  nodejs: SiNodedotjs,
  express: SiExpress,
  'express.js': SiExpress,
  nestjs: SiNestjs,
  python: SiPython,
  go: SiGo,
  golang: SiGo,
  rust: SiRust,
  php: SiPhp,
  laravel: SiLaravel,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  k8s: SiKubernetes,
  postgresql: SiPostgresql,
  postgres: SiPostgresql,
  mongodb: SiMongodb,
  mongo: SiMongodb,
  redis: SiRedis,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  html: SiHtml5,
  html5: SiHtml5,
  css: SiCss,
  css3: SiCss,
  git: SiGit,
  github: SiGithub,
  linux: SiLinux,
  nginx: SiNginx,
  graphql: SiGraphql,
  figma: SiFigma,
  vite: SiVite,
  webpack: SiWebpack,
  eslint: SiEslint,
  prettier: SiPrettier,
  jest: SiJest,
  terraform: SiTerraform,
  jenkins: SiJenkins,
  npm: SiNpm,
  yarn: SiYarn,
  pnpm: SiPnpm,
  cloudflare: SiCloudflare,
  vercel: SiVercel,
  netlify: SiNetlify,
  digitalocean: SiDigitalocean,
  django: SiDjango,
  flask: SiFlask,
  symfony: SiSymfony,
  storybook: SiStorybook,
  cypress: SiCypress,
  circleci: SiCircleci,
  ansible: SiAnsible,
  babel: SiBabel,
  bun: SiBun,
  ruby: SiRuby,
  json: VscJson,
  payload: VscJson,
  rest: VscJson,
  apis: VscJson,
  agile: DiScrum,
  scrum: DiScrum,
  'code review': VscGitPullRequest,
  'code reviews': VscGitPullRequest,
  cr: VscGitPullRequest,
  pr: VscGitPullRequest,
  ai: VscSparkle,
  ia: VscSparkle,
  'ai-assisted': VscSparkle,
  sdd: SiMarkdown,
  spec: SiMarkdown,
  'spec-driven': SiMarkdown,
  aws: FaAws,
  'amazon web services': FaAws,
};

const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[-/]/g, ' ')
    .replace(/[^a-z0-9. ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const lookup = (key: string): IconType | undefined => {
  const exact = iconMap[key];
  if (exact) return exact;

  for (const word of key.split(' ')) {
    const match = iconMap[word];
    if (match) return match;
  }

  return undefined;
};

interface TechIconProps {
  name: string;
  className?: string;
}

export const TechIcon = ({ name, className = 'h-4 w-4' }: TechIconProps) => {
  const Icon = lookup(normalize(name));

  if (Icon) {
    return <Icon className={className} />;
  }

  return <VscCode className={className} />;
};
