import { Link } from 'react-router-dom';
import { FiShield, FiArrowLeft } from 'react-icons/fi';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-base bg-cyber-grid flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <FiShield size={24} className="text-accent" />
        </div>
        <p className="text-6xl font-bold text-text font-mono-num mb-2">404</p>
        <h1 className="text-text font-semibold text-lg mb-2">This trail goes cold</h1>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">
          The page you&apos;re looking for isn&apos;t publicly indexed here. Let&apos;s get you back on track.
        </p>
        <Link to="/">
          <Button icon={FiArrowLeft}>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
