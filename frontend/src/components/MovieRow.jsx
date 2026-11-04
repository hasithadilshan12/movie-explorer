import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { RowSkeleton } from './Loader';

export default function MovieRow({
  title,
  subtitle,
  movies = [],
  loading = false,
  viewAll,
  eyebrow,
  onRemove,
  removeLabel,
}) {
  const scrollerRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    setEdges({
      left: node.scrollLeft > 12,
      right: node.scrollLeft + node.clientWidth < node.scrollWidth - 12,
    });
  }, []);

  useEffect(() => {
    updateEdges();
    const node = scrollerRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver(updateEdges);
    observer.observe(node);
    node.addEventListener('scroll', updateEdges, { passive: true });

    return () => {
      observer.disconnect();
      node.removeEventListener('scroll', updateEdges);
    };
  }, [movies, updateEdges]);

  const scrollBy = (direction) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.82, behavior: 'smooth' });
  };

  if (!loading && movies.length === 0) return null;

  return (
    <section className="shelf">
      <div className="shelf-header container">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="shelf-title">{title}</h2>
          {subtitle && <p className="shelf-subtitle">{subtitle}</p>}
        </div>
        {viewAll && (
          <Link to={viewAll} className="shelf-link">
            View all <ArrowRight size={15} />
          </Link>
        )}
      </div>

      <div className="row-wrap container">
        {loading ? (
          <RowSkeleton count={7} />
        ) : (
          <>
            <button
              type="button"
              className={`row-arrow row-arrow-left ${edges.left ? 'is-visible' : ''}`}
              onClick={() => scrollBy(-1)}
              aria-label="Scroll left"
              title="Scroll left"
              tabIndex={edges.left ? 0 : -1}
            >
              <ChevronLeft size={22} />
            </button>

            <div className="row-scroll" ref={scrollerRef}>
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onRemove={onRemove}
                  removeLabel={removeLabel}
                />
              ))}
            </div>

            <button
              type="button"
              className={`row-arrow row-arrow-right ${edges.right ? 'is-visible' : ''}`}
              onClick={() => scrollBy(1)}
              aria-label="Scroll right"
              title="Scroll right"
              tabIndex={edges.right ? 0 : -1}
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
