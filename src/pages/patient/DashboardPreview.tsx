import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDataStore } from '../../store/store';
import {
    Calendar, Pill, Activity, MessageSquare, FileText, Heart,
    Clock, Video, MapPin, CheckCircle, TrendingUp, Target,
    Droplet, Footprints, ArrowRight, Bell, Zap, Brain, Users,
    AlertCircle, ChevronRight, Flame, Moon, Sun, Award, Star,
    Smile, Frown, Meh, ThumbsUp, Plus, Minus, ExternalLink, Mic, Monitor
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';

export const DashboardPreview: React.FC = () => {
    const { user } = useAuthStore();
    const { appointments, medications, records, fetchData } = useDataStore();
    const navigate = useNavigate();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Interactive States
    const [waterIntake, setWaterIntake] = useState(5);
    const [mood, setMood] = useState<string | null>(null);
    const [streak, setStreak] = useState(12);

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [fetchData]);

    // Get greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return { text: 'Good Morning', icon: Sun, color: 'text-yellow-500' };
        if (hour < 18) return { text: 'Good Afternoon', icon: Sun, color: 'text-orange-500' };
        return { text: 'Good Evening', icon: Moon, color: 'text-indigo-500' };
    };

    const greeting = getGreeting();

    // Calculate health metrics
    const upcomingAppointments = appointments.filter(apt => apt.status === 'SCHEDULED');
    const nextAppointment = upcomingAppointments[0]; // Assuming sorted
    const medicationsDueToday = medications.filter(med => true);
    const recentRecords = records.slice(0, 3);

    // Health score calculation
    const healthScore = Math.min(95, 70 + (appointments.length * 5) + (records.length * 2));
    const scoreChange = '+5';

    // Stats for cards
    const stats = [
        {
            label: 'Appointments',
            value: upcomingAppointments.length,
            icon: Calendar,
            color: 'from-blue-500 to-blue-600',
            action: () => navigate('/patient/appointments')
        },
        {
            label: 'Medications',
            value: medications.length,
            icon: Pill,
            color: 'from-green-500 to-green-600',
            action: () => navigate('/patient/medications')
        },
        {
            label: 'Health Records',
            value: records.length,
            icon: FileText,
            color: 'from-purple-500 to-purple-600',
            action: () => navigate('/patient/records')
        },
        {
            label: 'Health Score',
            value: `${healthScore}%`,
            icon: Heart,
            color: 'from-pink-500 to-rose-600',
            action: () => navigate('/patient/analytics')
        },
    ];

    // Today's tasks
    const todayTasks = [
        ...upcomingAppointments.map(apt => ({
            time: apt.time,
            type: 'appointment',
            title: `Dr. ${apt.doctorName}`,
            subtitle: apt.type,
            urgent: false,
            meetingLink: 'https://meet.google.com/new', // Mock link
            action: () => navigate('/patient/appointments')
        })),
        ...medicationsDueToday.slice(0, 2).map(med => ({
            time: med.time.split(',')[0] || '09:00 AM',
            type: 'medication',
            title: `Take ${med.name}`,
            subtitle: med.dosage,
            urgent: true,
            action: () => navigate('/patient/medications')
        }))
    ].sort((a, b) => {
        const timeA = a.time.includes('AM') || a.time.includes('PM') ? a.time : '12:00 PM';
        const timeB = b.time.includes('AM') || b.time.includes('PM') ? b.time : '12:00 PM';
        return timeA.localeCompare(timeB);
    }).slice(0, 4);

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Enhanced Welcome Header */}
            <div className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <greeting.icon className={`h-6 w-6 ${greeting.color}`} />
                                <h1 className="text-3xl font-bold">{greeting.text}, {user?.name}! 👋</h1>
                            </div>
                            <p className="text-blue-100 text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/20">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Flame className="h-6 w-6 text-orange-300" />
                            </div>
                            <div>
                                <p className="text-xs text-blue-100">Health Streak</p>
                                <p className="text-xl font-bold">{streak} Days 🔥</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm text-blue-100 mb-1">Your Health Score</p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold">{healthScore}</span>
                                    <Badge className="bg-green-500 text-white border-0 px-3 py-1">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {scoreChange}
                                    </Badge>
                                </div>
                            </div>
                            <div className="text-right">
                                <Award className="h-12 w-12 text-yellow-300 mb-1" />
                                <p className="text-xs text-blue-100">Excellent!</p>
                            </div>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 h-full rounded-full transition-all duration-1000 shadow-lg flex items-center justify-end pr-2"
                                style={{ width: `${healthScore}%` }}
                            >
                                <Star className="h-3 w-3 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        onClick={stat.action}
                        className="bg-white rounded-xl border border-neutral-200 p-5 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className={`bg-gradient-to-br ${stat.color} text-white p-3 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <p className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</p>
                        <p className="text-sm text-neutral-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Tasks & Wellness */}
                <div className="lg:col-span-2 space-y-6">

                    {/* UPCOMING MEETING CARD (NEW) - Shown if Next Appointment Exists */}
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg p-1 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30">
                                        <Video className="h-8 w-8 text-white" />
                                    </div>
                                    <div>
                                        <Badge className="bg-green-500/80 text-white border-0 mb-2">Starting Soon</Badge>
                                        <h3 className="text-xl font-bold">Consultation with Dr. {nextAppointment ? nextAppointment.doctorName : 'Sarah Chen'}</h3>
                                        <p className="text-indigo-100 flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {nextAppointment ? nextAppointment.time : '10:00 AM'} • {nextAppointment ? nextAppointment.type : 'General Checkup'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Button
                                        variant="outline"
                                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 flex-1 md:flex-none"
                                        onClick={() => navigate('/patient/appointments')}
                                    >
                                        Reschedule
                                    </Button>
                                    <Button
                                        className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold flex-1 md:flex-none shadow-lg"
                                        onClick={() => window.open('https://meet.google.com/new', '_blank')}
                                    >
                                        <Video className="h-4 w-4 mr-2" />
                                        Join Call
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Wellness Check-in Section */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Smile className="h-5 w-5 text-yellow-500" />
                                Wellness Check-in
                            </h3>
                            <span className="text-xs text-neutral-500">{new Date().toLocaleDateString()}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Mood Tracker */}
                            <div className="bg-neutral-50 rounded-xl p-4">
                                <p className="text-sm font-semibold text-neutral-700 mb-3">How are you feeling today?</p>
                                <div className="flex justify-between gap-2">
                                    {['Great', 'Good', 'Okay', 'Low'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMood(m)}
                                            className={`flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${mood === m ? 'bg-primary text-white shadow-md scale-105' : 'bg-white hover:bg-neutral-200 text-neutral-600'
                                                }`}
                                        >
                                            {m === 'Great' && <Star className="h-5 w-5" />}
                                            {m === 'Good' && <Smile className="h-5 w-5" />}
                                            {m === 'Okay' && <Meh className="h-5 w-5" />}
                                            {m === 'Low' && <Frown className="h-5 w-5" />}
                                            <span className="text-xs font-medium">{m}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hydration Tracker */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm font-semibold text-blue-900">Hydration</p>
                                    <p className="text-xs font-bold text-blue-600">{waterIntake} / 8 cups</p>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <button
                                        onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                                        className="p-2 bg-white rounded-lg text-blue-600 hover:bg-blue-100 transition-colors shadow-sm"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>

                                    <div className="flex-1 h-3 bg-blue-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(waterIntake / 8) * 100}%` }}
                                        ></div>
                                    </div>

                                    <button
                                        onClick={() => setWaterIntake(Math.min(20, waterIntake + 1))}
                                        className="p-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex justify-center gap-1 mt-3">
                                    {[...Array(8)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={`h-6 w-3 rounded-sm transition-all ${i < waterIntake ? 'bg-blue-500' : 'bg-blue-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-4">

                    {/* Today's Schedule (Mini Version) */}
                    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm">
                        <div className="bg-neutral-50 p-4 border-b border-neutral-200 rounded-t-2xl">
                            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Flame className="h-4 w-4 text-orange-500" />
                                Schedule
                            </h2>
                        </div>
                        <div className="p-3 space-y-2">
                            {todayTasks.length > 0 ? todayTasks.map((task, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer" onClick={task.action}>
                                    <div className={`p-2 rounded-lg ${task.type === 'appointment' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                                        {task.type === 'appointment' ? <Video className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{task.title}</p>
                                        <p className="text-xs text-neutral-500">{task.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-neutral-400 text-center py-4">No tasks today</p>
                            )}
                        </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/patient/chatbot')}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Brain className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold">AI Health Assistant</h3>
                                <p className="text-xs text-cyan-100">24/7 Available</p>
                            </div>
                        </div>
                        <p className="text-sm text-cyan-50 mb-4">Get instant health guidance and symptom analysis</p>
                        <Button className="w-full bg-white text-cyan-600 hover:bg-cyan-50">
                            Start Chat
                        </Button>
                    </div>

                    {/* Daily Goals Review */}
                    <div className="bg-white rounded-2xl border border-neutral-200 p-5">
                        <h3 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                            <Target className="h-5 w-5 text-red-500" />
                            Progress
                        </h3>
                        <div className="space-y-4">
                            {/* Steps */}
                            <div className="flex items-center gap-3">
                                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Footprints className="h-4 w-4" /></div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold">Steps</span>
                                        <span>6.5k / 10k</span>
                                    </div>
                                    <div className="w-full bg-orange-100 rounded-full h-1.5">
                                        <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Sleep */}
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><Moon className="h-4 w-4" /></div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold">Sleep</span>
                                        <span>7.5 / 8 h</span>
                                    </div>
                                    <div className="w-full bg-indigo-100 rounded-full h-1.5">
                                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Back Button */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
                <p className="text-sm text-yellow-800 mb-3 flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    This is a <strong>preview</strong> - Testing new dashboard design
                </p>
                <div className="flex gap-3 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/patient/dashboard')}
                        className="border-yellow-600 text-yellow-700 hover:bg-yellow-100"
                    >
                        Back to Original
                    </Button>
                    <Button
                        onClick={() => alert('Dashboard approved! This will replace the original.')}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        ✓ Approve & Use This Design
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPreview;
