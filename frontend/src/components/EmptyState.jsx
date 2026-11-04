import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Film,
  title = 'Nothing here yet',
  message = '',
  actionLabel,
  actionTo,
  onAction,
  children,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={30} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {children}
      {actionLabel && actionTo && (
        <Link className="btn btn-primary" to={actionTo}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
