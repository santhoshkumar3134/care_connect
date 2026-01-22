import React, { useState } from 'react';
import {
  LayoutDashboard, Users, ClipboardCheck, Calendar, FileText, Settings,
  LogOut, Bell, Search, Menu, X, ChevronRight, ChevronDown, Filter,
  Download, Eye, Trash2, CheckCircle, AlertTriangle, Info, Clock,
  MoreVertical, Shield, Star, Activity, User, Plus, Save, Lock, Camera,
  Mail, Phone, MapPin, Grid
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/store';
import { Button, Input, Card, Badge, Skeleton } from '../components/ui';

// --- Types & Mocks ---

interface AdminStat {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: any;
  color: string;
}

const MOCK_STATS: AdminStat[] = [
  { title: "Total Users", value: "12,345", trend: "+12%", trendUp: true, icon: Users, color: "bg-indigo-500" },
  { title: "Total Patients", value: "10,234", trend: "+8%", trendUp: true, icon: User, color: "bg-blue-500" },
  { title: "Total Doctors", value: "1,234", trend: "+5%", trendUp: true, icon: StethoscopeIcon, color: "bg-purple-500" },
  { title: "Appointments", value: "3,456", trend: "+15%", trendUp: true, icon: Calendar, color: "bg-emerald-500" },
  { title: "Pending Approvals", value: "23", trend: "Action Req", trendUp: false, icon: Clock, color: "bg-orange-500" },
  { title: "Active Sessions", value: "567", trend: "Now", trendUp: true, icon: Activity, color: "bg-cyan-500" },
];

function StethoscopeIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v6" /><path d="M16 15v6a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-6" /><circle cx="20" cy="10" r="2" /></svg>;
}

// --- Components ---

const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const links = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Doctor Approvals', path: '/admin/approvals', icon: ClipboardCheck, badge: 5 },
    { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
    { name: 'Activity Logs', path: '/admin/logs', icon: FileText },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-neutral-100">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-3">
            <Shield className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg text-neutral-900">HealthAdmin</span>
          <button onClick={onClose} className="ml-auto lg:hidden"><X className="h-5 w-5 text-neutral-500" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => onClose()}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600'
                  : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
              >
                <link.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-neutral-400'}`} />
                {link.name}
                {link.badge && (
                  <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button onClick={handleLogout} className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminHeader: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="lg:hidden p-2 text-neutral-500 hover:bg-neutral-100 rounded-lg">
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:flex relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search users, appointments..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-neutral-900">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-neutral-500">Super Admin</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-white shadow-sm cursor-pointer">
            {user?.name?.[0] || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

// --- Pages ---

// 1. Dashboard
export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const chartData = [
    { name: 'Mon', users: 12 }, { name: 'Tue', users: 19 }, { name: 'Wed', users: 15 },
    { name: 'Thu', users: 25 }, { name: 'Fri', users: 32 }, { name: 'Sat', users: 20 }, { name: 'Sun', users: 10 }
  ];

  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500">Overview of system performance and metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {MOCK_STATS.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-neutral-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-neutral-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white shadow-sm`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium">
              <span className={`${stat.trendUp ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {stat.trend}
              </span>
              <span className="text-neutral-400 ml-2">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-neutral-900">User Registrations</h3>
            <select className="text-xs border-none bg-neutral-50 rounded-md px-2 py-1 text-neutral-500 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Line type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col">
          <h3 className="font-semibold text-neutral-900 mb-4">Quick Actions</h3>
          <div className="space-y-3 flex-1">
            <button onClick={() => navigate('/admin/users')} className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors group">
              <span className="flex items-center gap-3 font-medium text-sm"><Users className="h-4 w-4" /> View All Users</span>
              <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-indigo-500" />
            </button>
            <button onClick={() => navigate('/admin/approvals')} className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors group">
              <span className="flex items-center gap-3 font-medium text-sm"><ClipboardCheck className="h-4 w-4" /> Approve Doctors</span>
              <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-indigo-500" />
            </button>
            <button onClick={() => navigate('/admin/logs')} className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors group">
              <span className="flex items-center gap-3 font-medium text-sm"><FileText className="h-4 w-4" /> View Audit Logs</span>
              <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-indigo-500" />
            </button>
            <button onClick={() => navigate('/admin/settings')} className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors group">
              <span className="flex items-center gap-3 font-medium text-sm"><Settings className="h-4 w-4" /> System Settings</span>
              <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-indigo-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50">
          <h3 className="font-semibold text-neutral-900">Recent Registrations</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>View All</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[
                { name: "Sarah Connor", email: "sarah@example.com", role: "PATIENT", joined: "2 hours ago" },
                { name: "Dr. Gregory House", email: "house@hospital.com", role: "DOCTOR", joined: "5 hours ago" },
                { name: "John Wick", email: "john@continental.com", role: "PATIENT", joined: "1 day ago" },
                { name: "Dr. Stephen Strange", email: "strange@magic.com", role: "DOCTOR", joined: "2 days ago" },
              ].map((u, i) => (
                <tr key={i} className="hover:bg-neutral-50">
                  <td className="px-6 py-3">
                    <div>
                      <p className="font-medium text-neutral-900">{u.name}</p>
                      <p className="text-xs text-neutral-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.role === 'DOCTOR' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> Active
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-neutral-500">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 2. User Management
export const UserManagement: React.FC = () => {
  const [filter, setFilter] = useState('ALL');
  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-500">Manage all users in the system</p>
        </div>
        <Button icon={Plus}>Add User</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input type="text" placeholder="Search by name or email..." className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>All Roles</option>
            <option>Patients</option>
            <option>Doctors</option>
            <option>Admins</option>
          </select>
          <select className="px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Disabled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase">
            <tr>
              <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /></th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-neutral-50">
                <td className="px-6 py-4"><input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-600">JD</div>
                    <div>
                      <p className="font-medium text-neutral-900">John Doe {i}</p>
                      <p className="text-xs text-neutral-500">john.doe{i}@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={i % 2 === 0 ? 'info' : 'neutral'}>{i % 2 === 0 ? 'DOCTOR' : 'PATIENT'}</Badge>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-500">Jan 15, 2025</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-neutral-400 hover:text-indigo-600 p-1"><MoreVertical className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-neutral-200 flex justify-between items-center bg-neutral-50">
          <p className="text-xs text-neutral-500">Showing 1-10 of 235 users</p>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-neutral-300 rounded bg-white text-xs disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-neutral-300 rounded bg-white text-xs hover:bg-neutral-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Doctor Approvals
export const DoctorApprovals: React.FC = () => {
  const [tab, setTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Doctor Approvals</h1>
        <p className="text-neutral-500">Review and approve healthcare provider registrations</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex space-x-8">
          {['PENDING', 'APPROVED', 'REJECTED'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${tab === t
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
              {t === 'PENDING' && <span className="bg-indigo-100 text-indigo-600 py-0.5 px-2.5 rounded-full text-xs">5</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center text-2xl font-bold text-neutral-400">Dr</div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Dr. Sarah Smith</h3>
                  <p className="text-sm text-neutral-500">Cardiologist • 12 Years Exp.</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-xs font-bold ml-1 text-neutral-700">4.8</span>
                  </div>
                </div>
              </div>
              <Badge variant={tab === 'PENDING' ? 'warning' : tab === 'APPROVED' ? 'success' : 'error'}>{tab}</Badge>
            </div>

            <div className="space-y-2 text-sm text-neutral-600 mb-6">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-neutral-400" /> sarah.smith@hospital.com</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-neutral-400" /> +1 (555) 123-4567</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-neutral-400" /> City General Hospital</div>
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-neutral-400" /> License: MED-NY-88219</div>
            </div>

            <div className="border-t border-neutral-100 pt-4 flex gap-3">
              <Button variant="outline" className="flex-1" icon={FileText}>Documents</Button>
              {tab === 'PENDING' && (
                <>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" icon={CheckCircle}>Approve</Button>
                  <Button variant="danger" className="flex-1" icon={X}>Reject</Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Appointments List
export const AdminAppointments: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
          <p className="text-neutral-500">Global appointment view</p>
        </div>
        <Button variant="outline" icon={Download}>Export CSV</Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm">
        <div className="p-4 border-b border-neutral-200 flex gap-4 bg-neutral-50 rounded-t-xl">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input type="text" value="Jan 1 - Jan 31, 2025" className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white w-64" readOnly />
          </div>
          <select className="pl-3 pr-8 py-2 border border-neutral-300 rounded-lg text-sm bg-white">
            <option>All Status</option>
            <option>Scheduled</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-neutral-200 text-neutral-500">
            <tr>
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">Date & Time</th>
              <th className="px-6 py-3 font-medium">Patient</th>
              <th className="px-6 py-3 font-medium">Doctor</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-neutral-50">
                <td className="px-6 py-4 font-mono text-neutral-500">#APT-{1000 + i}</td>
                <td className="px-6 py-4">Jan 15, 2025 <span className="text-neutral-400 ml-1">10:00 AM</span></td>
                <td className="px-6 py-4 font-medium text-neutral-900">John Doe</td>
                <td className="px-6 py-4 text-neutral-600">Dr. Sarah Smith</td>
                <td className="px-6 py-4">
                  <Badge variant={i === 3 ? 'error' : i === 2 ? 'success' : 'info'}>
                    {i === 3 ? 'CANCELLED' : i === 2 ? 'COMPLETED' : 'SCHEDULED'}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 5. Activity Logs
export const ActivityLogs: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Activity Logs</h1>
        <p className="text-neutral-500">Audit trail of system actions</p>
      </div>

      <div className="flex gap-4 mb-6">
        <select className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white"><option>All Actions</option></select>
        <select className="px-4 py-2 border border-neutral-300 rounded-lg text-sm bg-white"><option>All Admins</option></select>
        <div className="ml-auto flex items-center text-sm text-neutral-500 gap-2">
          <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
          Live Updates On
        </div>
      </div>

      <div className="space-y-4">
        {[
          { action: "Disabled User", target: "jane.doe@email.com", admin: "Admin Sarah", time: "2 mins ago", type: "danger" },
          { action: "Approved Doctor", target: "Dr. Bob Smith", admin: "Admin John", time: "15 mins ago", type: "success" },
          { action: "Settings Changed", target: "System Security", admin: "Admin Mike", time: "1 hour ago", type: "info" },
          { action: "User Login Failed", target: "admin2@system.com", admin: "System", time: "2 hours ago", type: "warning" }
        ].map((log, i) => (
          <div key={i} className={`bg-white border border-neutral-200 rounded-lg p-4 border-l-4 shadow-sm flex items-center justify-between ${log.type === 'danger' ? 'border-l-red-500' : log.type === 'success' ? 'border-l-green-500' : log.type === 'warning' ? 'border-l-orange-500' : 'border-l-blue-500'
            }`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-neutral-900">{log.action}</span>
                <span className="text-xs text-neutral-400">• {log.time}</span>
              </div>
              <p className="text-sm text-neutral-600">Target: <span className="font-mono">{log.target}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-bold">{log.admin[0]}</div>
              <span className="text-xs font-medium text-neutral-600">{log.admin}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. Settings
export const AdminSettings: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-8 animate-fade-in p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">System Settings</h1>
        <p className="text-neutral-500">Configure global preferences</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
          <h3 className="font-semibold text-neutral-900">General Preferences</h3>
        </div>
        <div className="p-6 space-y-6">
          <Input label="System Name" defaultValue="HealthCare Admin Portal" />
          <Input label="Admin Email" defaultValue="admin@healthcare.com" />
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Time Zone</label>
              <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"><option>UTC-5 (EST)</option><option>UTC+0 (GMT)</option></select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Date Format</label>
              <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"><option>MM/DD/YYYY</option><option>DD/MM/YYYY</option></select>
            </div>
          </div>
        </div>
        <div className="bg-neutral-50 px-6 py-4 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-4">
          <h3 className="font-semibold text-neutral-900">Security</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-neutral-900">Two-Factor Authentication</h4>
              <p className="text-xs text-neutral-500">Require 2FA for all admin accounts</p>
            </div>
            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
              <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-neutral-300" />
              <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-neutral-300 cursor-pointer"></label>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-neutral-900">Session Timeout</h4>
              <p className="text-xs text-neutral-500">Auto-logout after 30 minutes of inactivity</p>
            </div>
            <select className="text-sm border-neutral-300 rounded-md"><option>30 mins</option><option>1 hour</option></select>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Layout Wrapper ---
export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar on route change (mobile)
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-neutral-50 flex font-sans text-neutral-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};