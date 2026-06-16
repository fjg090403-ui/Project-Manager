import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Bell,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';
import { Badge, Button, Card, EmptyState, Skeleton } from '../components/ui.jsx';
import { api } from '../services/api';

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/me'),
      api.get('/projects'),
      api.get('/tasks'),
      api.get('/notifications')
    ]).then(([meRes, projectRes, taskRes, notificationRes]) => {
      setMe(meRes.data);
      setProjects(projectRes.data);
      setTasks(taskRes.data);
      setNotifications(notificationRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'DONE').length;
    const pending = tasks.filter((task) => task.status !== 'DONE').length;
    const highPriority = tasks.filter((task) => task.priority === 'HIGH').length;
    const productivity = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    return { completed, pending, highPriority, productivity };
  }, [tasks]);

  const weeklyData = useMemo(() => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return labels.map((day, index) => ({
      day,
      completed: Math.max(0, metrics.completed - Math.abs(index - 4)),
      created: Math.max(1, tasks.length - Math.abs(index - 3))
    }));
  }, [metrics.completed, tasks.length]);

  const activityData = useMemo(() => {
    return [
      { name: 'To do', value: tasks.filter((task) => task.status === 'TODO').length },
      { name: 'Progress', value: tasks.filter((task) => task.status === 'IN_PROGRESS').length },
      { name: 'Done', value: tasks.filter((task) => task.status === 'DONE').length }
    ];
  }, [tasks]);

  const recentActivity = useMemo(() => {
    return tasks.slice(0, 5).map((task) => ({
      id: task.id,
      title: task.title,
      meta: `${task.assigneeName || 'Unassigned'} · ${task.priority || 'MEDIUM'}`
    }));
  }, [tasks]);

  if (loading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-44" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-32" />)}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 lg:col-span-2" />
          <Skeleton className="h-80" />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="hero overflow-hidden">
        <div>
          <p className="eyebrow">{me?.organizationName || 'Workspace'}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">Command center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            A calm overview of projects, delivery momentum and team activity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="primary-link" to="/board">Open Kanban</Link>
          <Button variant="secondary">Export report</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={FolderKanban} label="Active projects" value={projects.length} trend="+12%" tone="blue" />
        <KpiCard icon={Clock3} label="Pending tasks" value={metrics.pending} trend="Focus queue" tone="amber" />
        <KpiCard icon={CheckCircle2} label="Completed" value={metrics.completed} trend={`${metrics.productivity}% done`} tone="green" />
        <KpiCard icon={Target} label="High priority" value={metrics.highPriority} trend="Needs attention" tone="red" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <SectionTitle icon={TrendingUp} title="Productividad semanal" subtitle="Completed vs created tasks" />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="completed" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#2f6fed" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2f6fed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 16, border: '1px solid #e4e7ec', boxShadow: '0 18px 50px rgba(16,24,40,.12)' }} />
                <Area type="monotone" dataKey="completed" stroke="#2f6fed" strokeWidth={3} fill="url(#completed)" />
                <Area type="monotone" dataKey="created" stroke="#98a2b3" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={Sparkles} title="Actividad" subtitle="Tasks by current status" />
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid stroke="#eef2f7" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#667085', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: '1px solid #e4e7ec' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#101828" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="p-5">
          <SectionTitle icon={FolderKanban} title="Proyectos activos" subtitle="Current portfolio" />
          <div className="mt-5 space-y-3">
            {projects.length === 0 ? (
              <EmptyState title="No projects yet" description="Projects will appear here once created." />
            ) : projects.slice(0, 4).map((project) => (
              <ListItem key={project.id} title={project.name} description={project.description || 'No description'} badge="Active" />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={Clock3} title="Tareas pendientes" subtitle="Next work to move forward" />
          <div className="mt-5 space-y-3">
            {tasks.filter((task) => task.status !== 'DONE').slice(0, 5).map((task) => (
              <ListItem key={task.id} title={task.title} description={task.assigneeName || 'Unassigned'} badge={task.priority || 'MEDIUM'} />
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle icon={Bell} title="Notificaciones" subtitle="Latest workspace signals" />
          <div className="mt-5 space-y-3">
            {notifications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-elevated/60 p-5 text-center text-sm text-muted">No notifications</div>
            ) : notifications.slice(0, 5).map((notification) => (
              <ListItem key={notification.id} title={notification.message} description={new Date(notification.createdAt).toLocaleDateString()} badge={notification.read ? 'Read' : 'New'} />
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle icon={Sparkles} title="Actividad reciente" subtitle="Latest task movement and assignments" />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {recentActivity.map((item) => (
            <ListItem key={item.id} title={item.title} description={item.meta} badge="Task" />
          ))}
        </div>
      </Card>
    </section>
  );
}

function KpiCard({ icon: Icon, label, value, trend, tone }) {
  const tones = {
    blue: 'bg-brand-50 text-brand-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700'
  };

  return (
    <Card className="group p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
        <Badge tone={tone === 'blue' ? 'blue' : tone === 'green' ? 'green' : tone === 'red' ? 'red' : 'amber'}>{trend}</Badge>
      </div>
      <p className="mt-5 text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 text-3xl font-extrabold tracking-tight text-text">{value}</p>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-2xl bg-elevated p-2.5 text-text">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-base font-bold text-text">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function ListItem({ title, description, badge }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-elevated/60 p-3 transition hover:border-brand-100 hover:bg-surface hover:shadow-soft">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-text">{title}</p>
        <p className="truncate text-xs text-muted">{description}</p>
      </div>
      <Badge tone="neutral">{badge}</Badge>
    </div>
  );
}
