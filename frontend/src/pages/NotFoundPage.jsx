import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[rgb(var(--bg))]">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="text-8xl font-extrabold text-brand-600 dark:text-brand-400 mb-4">404</p>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-[rgb(var(--text-muted))] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Home size={16} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
