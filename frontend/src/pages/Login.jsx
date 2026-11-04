import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Mail, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Spinner } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = typeof location.state?.from === 'string' && !location.state.from.startsWith('/login')
    ? location.state.from
    : '/';

  useEffect(() => {
    document.title = 'Sign in — MovieExplorer';
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email or username and your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ identifier: identifier.trim(), password });
      toast.success(`Welcome back, ${user.username}!`);
    } catch (err) {
      setError(err.message || 'Could not sign you in.');
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(credential);
      toast.success(`Welcome, ${user.username}!`);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <span className="auth-badge">
          <LogIn size={13} /> Welcome back
        </span>
        <h1>Sign in to MovieExplorer</h1>
        <p>Your watchlist, favorites and reviews are waiting for you.</p>
      </div>

      <GoogleAuthButton
        onCredential={handleGoogle}
        onError={(message) => setError(message)}
        disabled={loading}
      />

      <div className="auth-divider">
        <span>or continue with email</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}

        <label className="field">
          <span>Email or username</span>
          <div className="input-wrap">
            <Mail size={17} />
            <input
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Password</span>
          <div className="input-wrap">
            <ShieldCheck size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? <Spinner size={17} /> : <LogIn size={17} />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-switch">
        New to MovieExplorer? <Link to="/register">Create a free account</Link>
      </p>

      <p className="auth-note">
        <ShieldCheck size={13} /> Sessions are protected with encrypted passwords and secure
        tokens.
      </p>
    </AuthLayout>
  );
}
