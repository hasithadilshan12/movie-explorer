import { Link } from 'react-router-dom';
import { Compass, Film, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="page notfound-page">
      <div className="notfound-inner">
        <span className="notfound-code">404</span>
        <div className="notfound-icon">
          <Film size={34} />
        </div>
        <h1>This scene was cut</h1>
        <p>
          The page you are looking for doesn&apos;t exist, moved, or never made it past the edit
          room.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="btn btn-primary btn-lg">
            <Home size={17} /> Back home
          </Link>
          <Link to="/search" className="btn btn-outline btn-lg">
            <Compass size={17} /> Discover movies
          </Link>
        </div>
      </div>
    </div>
  );
}
