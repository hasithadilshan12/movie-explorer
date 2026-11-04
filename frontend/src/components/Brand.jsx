import { Link } from 'react-router-dom';
import { Clapperboard } from 'lucide-react';

export default function Brand({ className = '', to = '/' }) {
  return (
    <Link to={to} className={`brand ${className}`} aria-label="Movie Explorer home">
      <span className="brand-mark">
        <Clapperboard size={21} strokeWidth={2.2} />
      </span>
      <span className="brand-text">
        Movie<span>Explorer</span>
      </span>
    </Link>
  );
}
