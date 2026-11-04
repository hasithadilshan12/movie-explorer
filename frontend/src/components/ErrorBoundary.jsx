import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unexpected UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="crash-screen">
          <AlertTriangle size={38} />
          <h1>Something went off script</h1>
          <p>The page ran into an unexpected error. Reloading usually fixes it.</p>
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload the app
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
