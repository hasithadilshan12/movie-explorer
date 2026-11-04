import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { LibraryProvider } from './context/LibraryContext.jsx';
import { GOOGLE_CLIENT_ID } from './utils/constants';
import './index.css';

const app = (
  <ErrorBoundary>
    <ToastProvider>
      <AuthProvider>
        <LibraryProvider>
          <App />
        </LibraryProvider>
      </AuthProvider>
    </ToastProvider>
  </ErrorBoundary>
);

const tree = GOOGLE_CLIENT_ID ? (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider>
) : (
  app
);

createRoot(document.getElementById('root')).render(<StrictMode>{tree}</StrictMode>);
