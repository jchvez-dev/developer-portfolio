import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from '../features/chatbot';

export const Layout = () => (
  <div className="flex min-h-screen flex-col bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
    <Header />
    <main className="mx-auto mt-16 w-full max-w-6xl flex-1 px-4 py-8">
      <Outlet />
    </main>
    <Footer />
    <ChatWidget />
  </div>
);
