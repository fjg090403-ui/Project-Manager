import { AlertCircle, ArrowRight, Building2, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../components/ui.jsx';
import { authenticate } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const validity = useMemo(() => ({
    name: form.name.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    organizationName: form.organizationName.trim().length === 0 || form.organizationName.trim().length >= 2,
    password: form.password.length >= 6
  }), [form]);

  async function submit(event) {
    event.preventDefault();
    setTouched({ name: true, email: true, organizationName: true, password: true });
    if (!validity.name || !validity.email || !validity.organizationName || !validity.password) return;
    setError('');
    setLoading(true);
    try {
      await authenticate('register', {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        organizationName: form.organizationName.trim()
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create the account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="New workspace"
      title="Create your command center"
      subtitle="Launch a polished project workspace with boards, tasks and team visibility."
    >
      <form onSubmit={submit} className="auth-form">
        <Field
          icon={UserRound}
          invalid={touched.name && !validity.name}
          onBlur={() => setTouched({ ...touched, name: true })}
          onChange={(value) => setForm({ ...form, name: value })}
          placeholder="Full name"
          valid={touched.name && validity.name}
          value={form.name}
        />
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
          icon={Building2}
          invalid={touched.organizationName && !validity.organizationName}
          onBlur={() => setTouched({ ...touched, organizationName: true })}
          onChange={(value) => setForm({ ...form, organizationName: value })}
          placeholder="Organization"
          valid={touched.organizationName && validity.organizationName && form.organizationName.length > 0}
          value={form.organizationName}
        />
        <Field
          action={showPassword ? EyeOff : Eye}
          hint="Use at least 6 characters"
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
          {loading ? <Loader2 className="animate-spin" size={18} /> : <span>Create account</span>}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
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
          <span>4 min</span>
          <span>to first board</span>
        </div>
      </div>
      <div className="auth-glass">
        {children}
      </div>
    </section>
  );
}

function Field({ action: Action, hint, icon: Icon, invalid, onAction, onBlur, onChange, placeholder, type = 'text', valid, value }) {
  return (
    <div>
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
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}
