import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Value is always out of 10. Each star represents two points.
 */
export default function RatingStars({
  value = 0,
  onChange,
  readOnly = false,
  size = 18,
  label = 'Rating',
}) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;
  const filledStars = Math.round(displayValue / 2);

  return (
    <div
      className={`rating-stars ${readOnly ? 'is-readonly' : ''}`}
      onMouseLeave={() => setHovered(0)}
      role={readOnly ? 'img' : 'group'}
      aria-label={readOnly ? `${label}: ${value} out of 10` : `${label}, choose 1 to 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-button ${star <= filledStars ? 'filled' : ''}`}
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHovered(star * 2)}
          onFocus={() => !readOnly && setHovered(star * 2)}
          onClick={() => !readOnly && onChange?.(star * 2)}
          aria-label={`${star} star${star > 1 ? 's' : ''} (${star * 2}/10)`}
          tabIndex={readOnly ? -1 : 0}
        >
          <Star size={size} strokeWidth={1.8} fill={star <= filledStars ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
