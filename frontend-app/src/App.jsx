import { Bell, Columns3, LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Search, Sparkles, UserRound } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/board', label: 'Kanban', icon: Columns3 },
  { to: '/profile', label: 'Profile', icon: UserRound }
];

const titles = {
  '/': 'Dashboard',
  '/board': 'Kanban',
  '/profile': 'Profile'
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const authenticated = Boolean(localStorage.getItem('accessToken'));
  const authRoute = location.pathname === '/login' || location.pathname === '/register';
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/login');
  }

  if (!authenticated || authRoute) {
    return (
      <div className="app-shell">
        <nav className="auth-topbar">
          <Link className="brand" to="/">SaaS PM</Link>
          <ThemeToggle />
        </nav>
        <main className="shell">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className={`app-shell app-frame ${collapsed ? 'sidebar-is-collapsed' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <Link className="sidebar-brand" to="/" aria-label="SaaS PM home">
            <span className="sidebar-logo">SP</span>
            <span className="sidebar-copy">
              <strong>SaaS PM</strong>
              <small>Workspace</small>
            </span>
          </Link>
          <button
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="sidebar-icon-button"
            onClick={() => setCollapsed(!collapsed)}
            type="button"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        <div className="sidebar-search">
          <Search size={16} />
          <span>Search workspace</span>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`} end={to === '/'} key={to} to={to}>
              <Icon size={18} />
              <span>{label}</span>
              <span className="sidebar-tooltip">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card">
          <Sparkles size={16} />
          <div>
            <strong>Ship smarter</strong>
            <span>Weekly focus is up 18%</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <ThemeToggle />
          <button className="sidebar-link sidebar-logout" onClick={logout} type="button">
            <LogOut size={18} />
            <span>Logout</span>
            <span className="sidebar-tooltip">Logout</span>
          </button>
        </div>
      </aside>

      <div className="workspace">
        <header className="workspace-topbar">
          <div>
            <p className="eyebrow">Project workspace</p>
            <h1>{titles[location.pathname] || 'Workspace'}</h1>
          </div>
          <div className="workspace-actions">
            <button className="sidebar-icon-button" aria-label="Notifications" type="button">
              <Bell size={18} />
            </button>
          </div>
        </header>

        <main className="shell">
          <Outlet />
        </main>
      </div>

      <nav className="mobile-tabbar" aria-label="Mobile navigation">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink className={({ isActive }) => `mobile-tab ${isActive ? 'mobile-tab-active' : ''}`} end={to === '/'} key={to} to={to}>
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button className="mobile-tab" onClick={logout} type="button">
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
