import { Loader2 } from 'lucide-react';

export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`spinner ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="page-loader">
      <div className="page-loader-mark">
        <Spinner size={34} />
      </div>
      <p>{label}</p>
    </div>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="movie-card skeleton-card" aria-hidden="true">
      <div className="skeleton poster-skeleton" />
      <div className="skeleton skeleton-line" style={{ width: '82%' }} />
      <div className="skeleton skeleton-line skeleton-line-sm" style={{ width: '45%' }} />
    </div>
  );
}

export function RowSkeleton({ count = 6 }) {
  return (
    <div className="row-skeleton">
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 12 }) {
  return (
    <div className="movie-grid">
      {Array.from({ length: count }, (_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="details-skeleton container">
      <div className="skeleton details-poster-skeleton" />
      <div className="details-skeleton-body">
        <div className="skeleton skeleton-line" style={{ width: '24%', height: 14 }} />
        <div className="skeleton skeleton-line" style={{ width: '68%', height: 52, marginTop: 20 }} />
        <div className="skeleton skeleton-line" style={{ width: '42%', height: 18 }} />
        <div className="skeleton skeleton-line" style={{ width: '100%', height: 14, marginTop: 34 }} />
        <div className="skeleton skeleton-line" style={{ width: '92%', height: 14 }} />
        <div className="skeleton skeleton-line" style={{ width: '64%', height: 14 }} />
        <div className="details-skeleton-actions">
          <div className="skeleton skeleton-button" />
          <div className="skeleton skeleton-button" />
        </div>
      </div>
    </div>
  );
}
