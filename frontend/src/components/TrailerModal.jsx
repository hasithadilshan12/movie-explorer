import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';

export default function TrailerModal({ open, onClose, videoKey, title }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKey);
    document.body.classList.add('no-scroll');

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.classList.remove('no-scroll');
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="trailer-modal" role="dialog" aria-modal="true" aria-label={`${title} trailer`}>
        <div className="trailer-head">
          <span>
            <Play size={16} fill="currentColor" /> Now playing
          </span>
          <strong>{title}</strong>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close trailer">
            <X size={20} />
          </button>
        </div>

        {videoKey ? (
          <div className="trailer-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="trailer-missing">
            <Play size={38} />
            <h3>No trailer available</h3>
            <p>We couldn&apos;t find a trailer for this movie.</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
