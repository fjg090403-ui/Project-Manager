import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoredTheme, setStoredTheme } from '../theme.js';

const options = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
];

export default function ThemeToggle() {
  const [theme, setTheme] = useState(getStoredTheme());

  useEffect(() => {
    setStoredTheme(theme);
  }, [theme]);

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-line bg-surface/80 p-1 shadow-sm">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          aria-label={`${label} theme`}
          className={`rounded-xl p-2 transition ${theme === value ? 'bg-elevated text-text shadow-sm' : 'text-muted hover:bg-elevated hover:text-text'}`}
          key={value}
          onClick={() => setTheme(value)}
          type="button"
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  );
}
