import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Languages,
  Loader2,
  Mail,
  Palette,
  ShieldCheck,
  UserRound
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Alert, Button, Card, Input, Select, Skeleton } from '../components/ui.jsx';
import { api } from '../services/api';

const preferenceKey = 'saas-pm-profile-preferences';

const defaultPreferences = {
  language: 'es',
  timezone: 'Europe/Madrid',
  emailDigest: 'weekly',
  compactMode: false
};

export default function Profile() {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [preferences, setPreferences] = useState(() => {
    try {
      return { ...defaultPreferences, ...JSON.parse(localStorage.getItem(preferenceKey) || '{}') };
    } catch {
      return defaultPreferences;
    }
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    api.get('/users/me')
      .then(({ data }) => {
        setMe(data);
        setProfile({ name: data.name || '', email: data.email || '' });
      })
      .catch(() => setNotice({ type: 'error', text: 'Could not load profile information' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences));
  }, [preferences]);

  const initials = useMemo(() => {
    const name = profile.name || me?.email || 'SP';
    return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  }, [profile.name, me?.email]);

  const passwordState = useMemo(() => {
    const strongEnough = passwords.newPassword.length >= 8;
    const hasNumber = /\d/.test(passwords.newPassword);
    const matches = passwords.newPassword && passwords.newPassword === passwords.confirmPassword;
    return { strongEnough, hasNumber, matches, valid: passwords.currentPassword && strongEnough && hasNumber && matches };
  }, [passwords]);

  async function saveProfile(event) {
    event.preventDefault();
    setSavingProfile(true);
    setNotice(null);
    try {
      const { data } = await api.put('/users/me', {
        name: profile.name.trim(),
        email: profile.email.trim().toLowerCase()
      });
      localStorage.setItem('user', JSON.stringify(data));
      setMe(data);
      setProfile({ name: data.name, email: data.email });
      setNotice({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Could not update profile' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (!passwordState.valid) return;
    setSavingPassword(true);
    setNotice(null);
    try {
      await api.post('/users/me/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setNotice({ type: 'success', text: 'Password updated successfully' });
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Could not update password' });
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-52" />
        <div className="grid gap-4 xl:grid-cols-3">
          <Skeleton className="h-96 xl:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <Card className="overflow-hidden">
        <div className="profile-hero">
          <div className="profile-avatar">{initials}</div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{me?.organizationName || 'Personal workspace'}</p>
            <h1>{profile.name || 'Profile'}</h1>
            <p>{profile.email}</p>
          </div>
          <div className="profile-status">
            <BadgeCheck size={16} />
            <span>{me?.role || 'MEMBER'}</span>
          </div>
        </div>
      </Card>

      {notice && <Alert type={notice.type}>{notice.text}</Alert>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <div className="space-y-5">
          <Card className="p-5">
            <SectionHeader icon={UserRound} title="Información personal" subtitle="Datos visibles para tu equipo y organización." />
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={saveProfile}>
              <Field label="Nombre completo" icon={UserRound}>
                <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required />
              </Field>
              <Field label="Email" icon={Mail}>
                <Input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required />
              </Field>
              <Field label="Organización" icon={Building2}>
                <Input value={me?.organizationName || 'No organization'} disabled />
              </Field>
              <Field label="Rol" icon={ShieldCheck}>
                <Input value={me?.role || 'MEMBER'} disabled />
              </Field>
              <div className="md:col-span-2 flex justify-end">
                <Button disabled={savingProfile} type="submit">
                  {savingProfile ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
                  Save profile
                </Button>
              </div>
            </form>
          </Card>

          <Card className="p-5">
            <SectionHeader icon={KeyRound} title="Seguridad" subtitle="Actualiza tu contraseña y mantén protegida la cuenta." />
            <form className="mt-5 grid gap-4" onSubmit={changePassword}>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Contraseña actual" icon={KeyRound}>
                  <PasswordInput
                    onChange={(value) => setPasswords({ ...passwords, currentPassword: value })}
                    show={showPasswords}
                    value={passwords.currentPassword}
                  />
                </Field>
                <Field label="Nueva contraseña" icon={ShieldCheck}>
                  <PasswordInput
                    onChange={(value) => setPasswords({ ...passwords, newPassword: value })}
                    show={showPasswords}
                    value={passwords.newPassword}
                  />
                </Field>
                <Field label="Confirmar contraseña" icon={CheckCircle2}>
                  <PasswordInput
                    onChange={(value) => setPasswords({ ...passwords, confirmPassword: value })}
                    show={showPasswords}
                    value={passwords.confirmPassword}
                  />
                </Field>
              </div>
              <div className="profile-checklist">
                <CheckItem active={passwordState.strongEnough}>Minimum 8 characters</CheckItem>
                <CheckItem active={passwordState.hasNumber}>Includes a number</CheckItem>
                <CheckItem active={passwordState.matches}>Passwords match</CheckItem>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button className="profile-ghost" onClick={() => setShowPasswords(!showPasswords)} type="button">
                  {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>
                <Button disabled={!passwordState.valid || savingPassword} type="submit">
                  {savingPassword ? <Loader2 className="mr-2 animate-spin" size={16} /> : null}
                  Update password
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <SectionHeader icon={Palette} title="Preferencias" subtitle="Personaliza la experiencia de trabajo." />
            <div className="mt-5 space-y-4">
              <Field label="Tema" icon={Palette}>
                <div className="rounded-2xl border border-line bg-elevated/60 p-1">
                  <ThemeToggle />
                </div>
              </Field>
              <Field label="Idioma" icon={Languages}>
                <Select value={preferences.language} onChange={(event) => setPreferences({ ...preferences, language: event.target.value })}>
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </Select>
              </Field>
              <Field label="Zona horaria" icon={Globe2}>
                <Select value={preferences.timezone} onChange={(event) => setPreferences({ ...preferences, timezone: event.target.value })}>
                  <option value="Europe/Madrid">Europe/Madrid</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="America/New_York">America/New_York</option>
                </Select>
              </Field>
              <Field label="Resumen por email" icon={Mail}>
                <Select value={preferences.emailDigest} onChange={(event) => setPreferences({ ...preferences, emailDigest: event.target.value })}>
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="off">Desactivado</option>
                </Select>
              </Field>
              <label className="profile-toggle">
                <span>
                  <strong>Modo compacto</strong>
                  <small>Reduce la densidad visual del tablero.</small>
                </span>
                <input
                  checked={preferences.compactMode}
                  onChange={(event) => setPreferences({ ...preferences, compactMode: event.target.checked })}
                  type="checkbox"
                />
              </label>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader icon={ShieldCheck} title="Estado de cuenta" subtitle="Señales rápidas de seguridad." />
            <div className="mt-5 space-y-3">
              <StatusItem icon={CheckCircle2} title="JWT activo" text="Sesión autenticada correctamente." />
              <StatusItem icon={ShieldCheck} title="BCrypt" text="Contraseñas protegidas en backend." />
              <StatusItem icon={AlertCircle} title="Privacidad" text="No se muestran secretos en la interfaz." />
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function SectionHeader({ icon: Icon, subtitle, title }) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-elevated p-2.5 text-text">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-base font-black text-text">{title}</h2>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ children, icon: Icon, label }) {
  return (
    <label className="grid gap-2">
      <span className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-normal text-muted">
        <Icon size={14} />
        {label}
      </span>
      {children}
    </label>
  );
}

function PasswordInput({ onChange, show, value }) {
  return (
    <Input
      autoComplete="new-password"
      type={show ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function CheckItem({ active, children }) {
  return (
    <span className={active ? 'profile-check profile-check-active' : 'profile-check'}>
      <CheckCircle2 size={14} />
      {children}
    </span>
  );
}

function StatusItem({ icon: Icon, text, title }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-elevated/55 p-3">
      <div className="mt-0.5 text-brand-600"><Icon size={17} /></div>
      <div>
        <p className="text-sm font-extrabold text-text">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
      </div>
    </div>
  );
}
