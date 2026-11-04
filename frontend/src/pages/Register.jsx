import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AtSign, Eye, EyeOff, ShieldCheck, Sparkles, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { Spinner } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const USERNAME_RE = /^[a-zA-Z0-9_]{3,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordStrength(password) {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^a-zA-Z0-9]/.test(password)) score += 1;
  return score;
}

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const from = typeof location.state?.from === 'string' ? location.state.from : '/';
  const strength = passwordStrength(password);

  useEffect(() => {
    document.title = 'Create account — MovieExplorer';
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, from, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!USERNAME_RE.test(username.trim())) {
      setError('Username must be 3–24 characters using letters, numbers or underscores.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Your password needs to be at least 6 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      toast.success(`Welcome to MovieExplorer, ${user.username}!`);
    } catch (err) {
      setError(err.message || 'Could not create your account.');
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    setError('');
    setLoading(true);
    try {
      const user = await loginWithGoogle(credential);
      toast.success(`Welcome to MovieExplorer, ${user.username}!`);
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-header">
        <span className="auth-badge">
          <Sparkles size={13} /> Join the community
        </span>
        <h1>Create your free account</h1>
        <p>Save movies, build a watchlist, and share your reviews.</p>
      </div>

      <GoogleAuthButton
        onCredential={handleGoogle}
        onError={(message) => setError(message)}
        disabled={loading}
      />

      <div className="auth-divider">
        <span>or sign up with email</span>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && (
          <div className="form-alert" role="alert">
            {error}
          </div>
        )}

        <label className="field">
          <span>Username</span>
          <div className="input-wrap">
            <User size={17} />
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="cinephile_99"
              autoComplete="username"
              maxLength={24}
              required
            />
          </div>
        </label>

        <label className="field">
          <span>Email address</span>
          <div className="input-wrap">
            <AtSign size={17} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        {password && (
          <div className={`password-strength strength-${strength}`}>
            <div className="strength-bars">
              {[1, 2, 3, 4].map((bar) => (
                <i key={bar} className={bar <= strength ? 'is-on' : ''} />
              ))}
            </div>
            <span>{STRENGTH_LABELS[strength]}</span>
          </div>
        )}

        <label className="field">
          <span>Confirm password</span>
          <div className="input-wrap">
            <ShieldCheck size={17} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />
          </div>
        </label>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
          {loading ? <Spinner size={17} /> : <Sparkles size={17} />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <p className="auth-legal">
        By creating an account you agree to keep the community friendly. MovieExplorer is a demo
        project powered by TMDB.
      </p>
    </AuthLayout>
  );
}
