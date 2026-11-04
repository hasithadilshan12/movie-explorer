import { GoogleLogin } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../utils/constants';
import { useToast } from '../context/ToastContext';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.72 0 3.28.62 4.5 1.64l3.36-3.36A11.9 11.9 0 0 0 12 .5C7.3.5 3.25 3.2 1.24 7.12l4.03 2.64z"
      />
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.86-.08-1.68-.22-2.47H12v4.67h6.45a5.52 5.52 0 0 1-2.39 3.62l3.88 3.01c2.27-2.1 3.55-5.19 3.55-8.83z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.24 1.24 16.88A11.5 11.5 0 0 0 12 23.5c3.24 0 5.96-1.07 7.94-2.9l-3.88-3.01a7.1 7.1 0 0 1-4.06 1.22 7.08 7.08 0 0 1-6.73-4.57z"
      />
      <path
        fill="#34A853"
        d="M5.27 9.76a7.1 7.1 0 0 0 0 4.48l-4.03 2.64a11.5 11.5 0 0 1 0-9.76l4.03 2.64z"
      />
    </svg>
  );
}

export default function GoogleAuthButton({ onCredential, onError, disabled = false }) {
  const toast = useToast();

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        className="google-fallback"
        onClick={() =>
          toast.info(
            'Google sign-in needs a client ID. Add VITE_GOOGLE_CLIENT_ID to frontend/.env and GOOGLE_CLIENT_ID to backend/.env, then restart both servers.',
            { title: 'One-time Google setup', duration: 9000 }
          )
        }
      >
        <GoogleIcon />
        <span>Continue with Google</span>
        <em>Setup needed</em>
      </button>
    );
  }

  return (
    <div className={`google-login-wrap ${disabled ? 'is-disabled' : ''}`}>
      <GoogleLogin
        onSuccess={(response) => {
          if (response?.credential) onCredential(response.credential);
          else onError?.('Google did not return a credential.');
        }}
        onError={() => onError?.('Google sign-in was cancelled or failed.')}
        theme="filled_black"
        shape="pill"
        size="large"
        text="continue_with"
        width="340"
        logo_alignment="center"
        useOneTap={false}
      />
    </div>
  );
}
