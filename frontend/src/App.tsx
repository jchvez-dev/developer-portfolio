import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Juan Chavez</h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600 dark:text-gray-400">
        Senior Full Stack Web Developer specializing in React, NestJS, and polyglot
        microservices architecture.
      </p>
    </section>
  );
}

function AboutPage() {
  return <h2 className="text-2xl font-bold">About</h2>;
}

function ProjectsPage() {
  return <h2 className="text-2xl font-bold">Projects</h2>;
}

function StudioPage() {
  return <h2 className="text-2xl font-bold">Canvas Studio</h2>;
}

function ContactPage() {
  return <h2 className="text-2xl font-bold">Contact</h2>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="studio" element={<StudioPage />} />
        <Route path="contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}
