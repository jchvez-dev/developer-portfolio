export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Juan Chavez. All rights reserved.</p>
        <div className="flex gap-4">
          <a
            href="https://github.com/juanchavez"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/juanchavez"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-900 dark:hover:text-gray-100"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
