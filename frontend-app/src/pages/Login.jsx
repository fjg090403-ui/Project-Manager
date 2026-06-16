import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authenticate } from '../services/api';
import { Alert } from '../components/ui.jsx';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'manager@example.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const validity = useMemo(() => ({
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    password: form.password.length >= 6
  }), [form]);

  async function submit(event) {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!validity.email || !validity.password) return;
    setError('');
    setLoading(true);
    try {
      await authenticate('login', { ...form, email: form.email.trim().toLowerCase() });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="SaaS Project Manager"
      title="Welcome back"
      subtitle="Sign in to continue planning, shipping and tracking work with your team."
    >
      <form onSubmit={submit} className="auth-form">
        <Field
          icon={Mail}
          invalid={touched.email && !validity.email}
          onBlur={() => setTouched({ ...touched, email: true })}
          onChange={(value) => setForm({ ...form, email: value })}
          placeholder="Email address"
          type="email"
          valid={touched.email && validity.email}
          value={form.email}
        />
        <Field
          action={showPassword ? EyeOff : Eye}
          icon={LockKeyhole}
          invalid={touched.password && !validity.password}
          onAction={() => setShowPassword(!showPassword)}
          onBlur={() => setTouched({ ...touched, password: true })}
          onChange={(value) => setForm({ ...form, password: value })}
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          valid={touched.password && validity.password}
          value={form.password}
        />
        {error && <Alert type="error">{error}</Alert>}
        <button className="auth-submit" disabled={loading} type="submit">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Sign in</span>}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
      <p className="auth-switch">
        New to SaaS PM? <Link to="/register">Create a workspace</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ children, eyebrow, subtitle, title }) {
  return (
    <section className="auth-stage">
      <div className="auth-ambient auth-ambient-one" />
      <div className="auth-ambient auth-ambient-two" />
      <div className="auth-showcase">
        <div className="auth-mark">SP</div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="auth-metrics">
          <span>98%</span>
          <span>delivery clarity</span>
        </div>
      </div>
      <div className="auth-glass">
        {children}
      </div>
    </section>
  );
}

function Field({ action: Action, icon: Icon, invalid, onAction, onBlur, onChange, placeholder, type, valid, value }) {
  return (
    <label className={`auth-field ${invalid ? 'auth-field-error' : ''} ${valid ? 'auth-field-success' : ''}`}>
      <Icon size={18} />
      <input onBlur={onBlur} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
      {Action && (
        <button aria-label="Toggle password visibility" onClick={onAction} type="button">
          <Action size={18} />
        </button>
      )}
      {!Action && valid && <CheckCircle2 className="text-emerald-500" size={18} />}
      {!Action && invalid && <AlertCircle className="text-red-500" size={18} />}
    </label>
  );
}
