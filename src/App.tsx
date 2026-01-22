import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Activity, MessageSquare, Menu, X,
  LogOut, UserCircle, Stethoscope, ChevronRight, Search, Bell, Settings,
  Shield, Heart, Apple, Pill, Users, Calendar, Fingerprint, Mail, Lock
} from 'lucide-react';
import { useAuthStore, useDataStore } from './store/store';
import { useDoctorStore } from './store/doctorStore';
import { useNotificationStore } from './store/notificationStore';
import { Button, Input, Card, Badge, Skeleton } from './components/ui';
import { supabase } from './supabaseClient';
// Patient Portal Pages
import PatientDashboard from './pages/patient/Dashboard';
import DashboardPreview from './pages/patient/DashboardPreview';

import PatientRecords from './pages/patient/Records';
import PatientAnalytics from './pages/patient/Analytics';
import PatientPrediction from './pages/patient/Prediction';
import PatientChatbot from './pages/patient/Chatbot';
import PatientProfile from './pages/patient/Profile';
import PatientAppointments from './pages/patient/Appointments';
import PatientNutrition from './pages/patient/Nutrition';
import PatientAccessControl from './pages/patient/AccessControl';
import PatientMedications from './pages/patient/Medications';
import PatientMessages from './pages/patient/Messages';

// Doctor Portal Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorChat from './pages/doctor/Chat';

// Admin Portal Pages
import AdminLayout from './pages/admin/Layout';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import DoctorApprovals from './pages/admin/DoctorApprovals';
import AdminAppointments from './pages/admin/Appointments';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminSettings from './pages/admin/Settings';

// --- Auth Views ---
const LoginView: React.FC = () => {
  const { checkSession } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if URL has ?signup=true parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('signup') === 'true') {
      setIsLogin(false);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN - Real Supabase Authentication
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) throw loginError;

        if (data.user) {
          // Fetch user profile to get role
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileError) throw profileError;

          if (!profile) {
            throw new Error('Profile not found. Please contact support.');
          }

          // Update auth store
          await checkSession();

          // Navigate based on role
          if (profile.role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (profile.role === 'DOCTOR') {
            navigate('/doctor/dashboard');
          } else {
            navigate('/patient/dashboard');
          }
        }
      } else {
        // SIGNUP - Real Supabase Registration
        if (!name.trim()) {
          throw new Error('Please enter your full name');
        }

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }

        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
              role: role
            }
          }
        });

        if (signupError) throw signupError;

        if (data.user) {
          // Auto-login after signup
          await checkSession();

          // Navigate based on role
          if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (role === 'DOCTOR') {
            navigate('/doctor/dashboard');
          } else {
            navigate('/patient/dashboard');
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Promo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-cyan-500 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>

        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Stethoscope className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight">CareConnect</span>
          </div>

          <h1 className="text-4xl font-bold mb-6 leading-tight">
            {isLogin ? 'Welcome Back!' : 'Join the Healthcare Revolution'}
          </h1>

          <div className="space-y-4">
            {[
              "Centralize all your medical records in one secure vault",
              "Get AI-powered health insights and disease predictions",
              "Control who accesses your health data and when",
              "Connect with healthcare providers seamlessly"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Shield className="h-3 w-3" />
                </div>
                <span className="text-lg font-medium text-blue-50">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 text-sm text-blue-100 opacity-80">
          © 2026 CareConnect. All rights reserved.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-left mb-10">
            <h2 className="text-3xl font-bold text-neutral-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-neutral-500">
              {isLogin ? 'Welcome back! Please enter your credentials' : 'Start your journey to smarter healthcare'}
            </p>
          </div>

          <div className="bg-white">
            {!isLogin && (
              <div className="flex flex-col sm:flex-row gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => setRole('PATIENT')}
                  className={`flex-1 py-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${role === 'PATIENT'
                    ? 'border-primary bg-blue-50 text-primary font-semibold'
                    : 'border-transparent bg-neutral-50 text-neutral-500 font-medium hover:bg-neutral-100'
                    }`}
                >
                  <UserCircle className="h-5 w-5" /> Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={`flex-1 py-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${role === 'DOCTOR'
                    ? 'border-primary bg-blue-50 text-primary font-semibold'
                    : 'border-transparent bg-neutral-50 text-neutral-500 font-medium hover:bg-neutral-100'
                    }`}
                >
                  <Stethoscope className="h-5 w-5" /> Doctor
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex-1 py-3 border-2 rounded-xl flex items-center justify-center gap-2 transition-all text-sm ${role === 'ADMIN'
                    ? 'border-primary bg-blue-50 text-primary font-semibold'
                    : 'border-transparent bg-neutral-50 text-neutral-500 font-medium hover:bg-neutral-100'
                    }`}
                >
                  <Lock className="h-5 w-5" /> Admin
                </button>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Full name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email address</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 flex items-center justify-center">@</div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={isLogin ? "your.email@example.com" : ""}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {!isLogin && <p className="mt-1 text-xs text-neutral-400">Must be at least 8 characters</p>}
              </div>

              {!isLogin && (
                <div className="flex items-center">
                  <input id="terms" name="terms" type="checkbox" required className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                  <label htmlFor="terms" className="ml-2 block text-sm text-neutral-500">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </label>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-base rounded-xl shadow-lg shadow-blue-200"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Create account')}
                {!loading && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="font-medium text-primary hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            {isLogin && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-xs text-blue-700">
                  <p><strong>Doctor:</strong> dr.sarah@careconnect.com / doctor123</p>
                  <p><strong>Patient:</strong> santhosh@patient.com / patient123</p>
                  <p><strong>Admin:</strong> admin@careconnect.com / Admin@123</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Landing Page ---
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">CareConnect</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">How it Works</a>
              <a href="#pricing" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#about" className="text-gray-500 hover:text-gray-900 font-medium transition-colors">About</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-900 font-semibold hover:text-primary transition-colors">Log in</Link>
              <Link to="/login?signup=true">
                <Button className="rounded-full px-6 shadow-lg shadow-blue-200">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-semibold mb-6 animate-fade-in">
            <Activity className="h-4 w-4" /> Powered by Advanced AI
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-neutral-900 tracking-tight mb-6 animate-slide-in">
            Your Health, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">One Smart Platform</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-neutral-500 mb-10 leading-relaxed animate-slide-in" style={{ animationDelay: '0.1s' }}>
            CareConnect centralizes your medical records with AI-powered insights, predictive health analytics, and seamless provider collaboration—all under your control.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
            <Link to="/login?signup=true">
              <Button size="lg" className="rounded-full px-8 h-14 text-lg shadow-xl shadow-blue-200 w-full sm:w-auto">
                Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg border-2 w-full sm:w-auto">Sign In</Button>
            </Link>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-neutral-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> HIPAA Compliant</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> SOC 2 Certified</span>
            <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-500" /> 256-bit Encryption</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Centralized Health Vault", desc: "Store all your medical records, lab reports, prescriptions, and imaging in one secure cloud location." },
              { icon: Shield, title: "Patient-Controlled Access", desc: "Grant time-bound, granular permissions to healthcare providers. You decide who sees what." },
              { icon: Activity, title: "AI Disease Prediction", desc: "Advanced ML models analyze your health data to predict risks for diabetes, heart disease, and more." },
              { icon: MessageSquare, title: "24/7 AI Health Assistant", desc: "Get instant symptom analysis and health guidance from our intelligent chatbot anytime." },
              { icon: Activity, title: "Health Analytics", desc: "Visualize your health trends with interactive charts and personalized insights." },
              { icon: Shield, title: "Enterprise Security", desc: "Bank-grade encryption and compliance with healthcare data protection standards." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 hover:shadow-md transition-all">
                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-white mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">{feature.title}</h3>
                <p className="text-neutral-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-neutral-400 text-sm">
          <div className="flex items-center justify-center gap-2 mb-4 text-primary font-bold text-lg">
            <Heart className="h-6 w-6 fill-current" /> CareConnect
          </div>
          <p>© 2026 CareConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// --- Notification Panel Component ---
const NotificationPanel: React.FC<{ user: any }> = ({ user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, subscribeToNotifications, unsubscribeFromNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
    return () => unsubscribeFromNotifications();
  }, []);

  // Handle notification click
  const handleNotificationClick = async (notification: any) => {
    setIsOpen(false);
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (user?.role === 'PATIENT') {
      switch (notification.type) {
        case 'medication':
        case 'refill':
          navigate('/patient/medications');
          break;
        case 'APPOINTMENT':
        case 'appointment':
          navigate('/patient/appointments');
          break;
        case 'HEALTH_RECORD':
        case 'lab':
          navigate('/patient/records');
          break;
        case 'MESSAGE':
        case 'message':
          navigate('/patient/messages');
          break;
        default:
          navigate('/patient/dashboard');
      }
    } else if (user?.role === 'DOCTOR') {
      switch (notification.type) {
        case 'urgent':
        case 'APPOINTMENT':
        case 'appointment':
          navigate('/doctor/schedule');
          break;
        case 'HEALTH_RECORD':
        case 'lab':
          navigate('/doctor/patients');
          break;
        case 'MESSAGE':
        case 'message':
          navigate('/doctor/chat');
          break;
        case 'prescription':
          navigate('/doctor/patients');
          break;
        default:
          navigate('/doctor/dashboard');
      }
    } else if (user?.role === 'ADMIN') {
      switch (notification.type) {
        case 'approval':
          navigate('/admin/doctor-approvals');
          break;
        case 'SYSTEM':
        case 'system':
          navigate('/admin/settings');
          break;
        case 'report':
          navigate('/admin/user-management');
          break;
        case 'activity':
          navigate('/admin/activity-logs');
          break;
        default:
          navigate('/admin/dashboard');
      }
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    // Note: We might need to add priority to the Notification interface or infer it
    // For now, let's treat APPOINTMENT as critical
    if (filter === 'critical') return n.type === 'APPOINTMENT';
    return true;
  });

  // Helper to map icons
  const getIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT': return Calendar;
      case 'MESSAGE': return MessageSquare;
      case 'HEALTH_RECORD': return FileText;
      case 'SYSTEM': return Settings;
      default: return Bell;
    }
  };

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'APPOINTMENT': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'SYSTEM': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-blue-100 text-blue-600 border-blue-200';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-primary hover:bg-blue-50 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
        aria-label="View notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-neutral-200 z-40 animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-neutral-900">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'all' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === 'unread' ? 'bg-primary text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50/30' : ''
                        }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg h-fit ${getPriorityColor(notification.type)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-sm text-neutral-900 truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <span className="h-2 w-2 bg-primary rounded-full shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-600 mb-2">{notification.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400">
                              {new Date(notification.createdAt).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-primary font-semibold hover:underline">
                              View
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <p className="text-neutral-500 font-medium">No notifications</p>
                  <p className="text-xs text-neutral-400 mt-1">You're all caught up! 🎉</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {unreadCount > 0 && (
              <div className="p-3 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
                <button
                  onClick={() => markAllAsRead()}
                  className="w-full text-center text-sm font-semibold text-primary hover:text-blue-700 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- Layout ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const patientNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/patient/dashboard' },
    { name: 'My Profile', icon: UserCircle, path: '/patient/profile' },
    { name: 'Health Records', icon: FileText, path: '/patient/records' },
    { name: 'Analytics', icon: Activity, path: '/patient/analytics' },
    { name: 'Appointments', icon: Calendar, path: '/patient/appointments' },
    { name: 'Predictions', icon: Activity, path: '/patient/prediction' },
    { name: 'Medications', icon: Pill, path: '/patient/medications' },
    { name: 'Nutrition', icon: Apple, path: '/patient/nutrition' },
    { name: 'AI Assistant', icon: MessageSquare, path: '/patient/chatbot' },
    { name: 'Messages', icon: Mail, path: '/patient/messages' },
    { name: 'Access Control', icon: Shield, path: '/patient/access-control' },
  ];

  const doctorNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
    { name: 'My Patients', icon: Users, path: '/doctor/patients' },
    { name: 'Schedule', icon: Calendar, path: '/doctor/schedule' },
    { name: 'Messages', icon: MessageSquare, path: '/doctor/chat' },
    { name: 'Profile', icon: UserCircle, path: '/patient/profile' },
  ];

  const navItems = user?.role === 'DOCTOR' ? doctorNavItems : patientNavItems;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col fixed inset-y-0 bg-white border-r border-gray-200 z-20">
        <div className="flex items-center h-20 flex-shrink-0 px-6 border-b border-gray-100">
          <div className="bg-primary text-white p-1.5 rounded-lg mr-3">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">CareConnect</span>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto py-6">
          <nav className="flex-1 px-4 space-y-1.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 mt-auto space-y-2">
            <div className="px-4 py-3 bg-neutral-50 rounded-xl mb-4">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Fingerprint className="h-3 w-3" /> Nalam ID
              </p>
              <p className="text-xs font-mono text-neutral-600 truncate">{user?.nalamId}</p>
            </div>
            <button
              onClick={logout}
              className="group flex w-full items-center px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 md:pl-64 transition-all duration-300">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-20 bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>

            <h1 className="text-2xl font-bold text-gray-900 hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>

            {/* Notification System */}
            <NotificationPanel user={user} />

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            {/* Profile Menu with Hover */}
            <div className="relative group">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                  <p className="text-[10px] font-mono text-gray-400 mt-1 uppercase">{user?.nalamId}</p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm group-hover:ring-2 group-hover:ring-primary/30 transition-all">
                  {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'JD'}
                </div>
              </div>

              {/* Hover Menu */}
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {/* Profile Header */}
                <div className="p-4 border-b border-neutral-200 bg-gradient-to-br from-primary/5 to-blue-50">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold shadow-md">
                      {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'JD'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-neutral-900 truncate">{user?.name}</p>
                      <p className="text-xs text-neutral-500 capitalize">{user?.role?.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Fingerprint className="h-3 w-3 text-neutral-400" />
                    <span className="text-[10px] font-mono text-neutral-600 flex-1">{user?.nalamId}</span>
                    <button
                      className="text-primary hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const nalamId = user?.nalamId || '';
                        const btn = e.currentTarget;
                        const originalHTML = btn.innerHTML;

                        try {
                          // Try modern clipboard API first
                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(nalamId);
                          } else {
                            // Fallback method for older browsers
                            const textArea = document.createElement('textarea');
                            textArea.value = nalamId;
                            textArea.style.position = 'fixed';
                            textArea.style.left = '-999999px';
                            document.body.appendChild(textArea);
                            textArea.focus();
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                          }

                          // Show success feedback
                          btn.innerHTML = '<svg class="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                          setTimeout(() => {
                            btn.innerHTML = originalHTML;
                          }, 1500);
                        } catch (err) {
                          console.error('Failed to copy:', err);
                          // Show error feedback
                          btn.innerHTML = '<svg class="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>';
                          setTimeout(() => {
                            btn.innerHTML = originalHTML;
                          }, 1500);
                        }
                      }}
                      title="Copy Nalam ID"
                    >
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link
                    to="/patient/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors group/item"
                  >
                    <UserCircle className="h-4 w-4 text-neutral-400 group-hover/item:text-primary" />
                    <span className="text-sm font-medium text-neutral-700 group-hover/item:text-neutral-900">View Profile</span>
                  </Link>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors group/item"
                    onClick={() => alert('Settings page - coming soon!')}
                  >
                    <Settings className="h-4 w-4 text-neutral-400 group-hover/item:text-primary" />
                    <span className="text-sm font-medium text-neutral-700 group-hover/item:text-neutral-900">Settings</span>
                  </button>

                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-50 transition-colors group/item"
                    onClick={() => alert('Help & Support - coming soon!')}
                  >
                    <MessageSquare className="h-4 w-4 text-neutral-400 group-hover/item:text-primary" />
                    <span className="text-sm font-medium text-neutral-700 group-hover/item:text-neutral-900">Help & Support</span>
                  </button>

                  <div className="h-px bg-neutral-200 my-2"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 transition-colors group/item"
                  >
                    <LogOut className="h-4 w-4 text-neutral-400 group-hover/item:text-red-500" />
                    <span className="text-sm font-medium text-neutral-700 group-hover/item:text-red-600">Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4 mb-8">
                  <div className="bg-primary text-white p-1.5 rounded-lg mr-3">
                    <Heart className="h-5 w-5 fill-current" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">CareConnect</span>
                </div>
                <nav className="px-2 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className="group flex items-center px-4 py-3 text-base font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <item.icon className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
                      {item.name}
                    </Link>
                  ))}
                  <div className="px-4 py-4 border-t border-neutral-100 mt-4">
                    <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">Your Nalam ID</p>
                    <p className="text-sm font-mono text-neutral-600">{user?.nalamId}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full group flex items-center px-4 py-3 text-base font-medium rounded-xl text-red-500 hover:bg-red-50"
                  >
                    <LogOut className="mr-4 h-6 w-6 flex-shrink-0" />
                    Logout
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};


// --- App Root ---
const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (user?.role === 'ADMIN') {
    return (
      <AdminLayout />
    );
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

const DashboardResolver: React.FC = () => {
  const { user } = useAuthStore();
  if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
}

const ChatResolver: React.FC = () => {
  const { user } = useAuthStore();
  return user?.role === 'DOCTOR' ? <DoctorChat /> : <PatientChatbot />;
}

import { NetworkStatus } from './components/NetworkStatus';

const App: React.FC = () => {
  const { user } = useAuthStore();

  // Global Store Reset: Ensure strict isolation between sessions (Patient vs Doctor)
  useEffect(() => {
    if (!user) {
      useDataStore.getState().resetStore();
      useDoctorStore.getState().resetStore();
      console.log('Stores reset: Data sanitized.');
    }
  }, [user]);

  return (
    <Router>
      <NetworkStatus />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginView />} />

        {/* Layout Route Pattern for Protected Pages */}
        <Route element={<ProtectedLayout />}>
          {/* Admin Portal Routes */}
          <Route path="admin">
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="approvals" element={<DoctorApprovals />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="logs" element={<ActivityLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Patient Portal Routes */}
          <Route path="patient">
            <Route path="dashboard" element={<PatientDashboard />} />
            <Route path="dashboard-preview" element={<DashboardPreview />} />

            <Route path="records" element={<PatientRecords />} />
            <Route path="analytics" element={<PatientAnalytics />} />
            <Route path="prediction" element={<PatientPrediction />} />
            <Route path="chatbot" element={<PatientChatbot />} />
            <Route path="profile" element={<PatientProfile />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="nutrition" element={<PatientNutrition />} />
            <Route path="access-control" element={<PatientAccessControl />} />
            <Route path="medications" element={<PatientMedications />} />
            <Route path="messages" element={<PatientMessages />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Doctor Portal Routes */}
          <Route path="doctor">
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patient/:id" element={<PatientRecords />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="chat" element={<DoctorChat />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Legacy Routes - Redirect to new structure */}
          <Route path="/dashboard" element={<DashboardResolver />} />
          <Route path="/records" element={<Navigate to="/patient/records" replace />} />
          <Route path="/analytics" element={<Navigate to="/patient/analytics" replace />} />
          <Route path="/prediction" element={<Navigate to="/patient/prediction" replace />} />
          <Route path="/chat" element={<Navigate to="/patient/chatbot" replace />} />
          <Route path="/profile" element={<Navigate to="/patient/profile" replace />} />
          <Route path="/appointments" element={<Navigate to="/patient/appointments" replace />} />
          <Route path="/nutrition" element={<Navigate to="/patient/nutrition" replace />} />
          <Route path="/access" element={<Navigate to="/patient/access-control" replace />} />
          <Route path="/medications" element={<Navigate to="/patient/medications" replace />} />
          <Route path="/messages" element={<Navigate to="/patient/messages" replace />} />
          <Route path="/patients" element={<Navigate to="/doctor/patients" replace />} />
          <Route path="/doctor-appointments" element={<Navigate to="/doctor/schedule" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;