import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { useDoctorStore } from '../../store/doctorStore';
import { Card, Button } from '../../components/ui';
import {
    Users, Calendar, Clock, TrendingUp, Activity,
    FileText, MessageSquare, Star, ArrowUpRight,
    MoreHorizontal, ChevronRight, Stethoscope
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

// Mock Data for Charts (Keep these for UI visualization unless we have real analytics endpoint)
const activityData = [
    { name: 'Mon', patients: 12, consultations: 8 },
    { name: 'Tue', patients: 19, consultations: 15 },
    { name: 'Wed', patients: 15, consultations: 10 },
    { name: 'Thu', patients: 22, consultations: 18 },
    { name: 'Fri', patients: 28, consultations: 24 },
    { name: 'Sat', patients: 14, consultations: 10 },
    { name: 'Sun', patients: 5, consultations: 2 },
];

const genderData = [
    { name: 'Male', value: 450 },
    { name: 'Female', value: 380 },
    { name: 'Other', value: 20 },
];

const COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];

const DoctorDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const { patients, appointments, fetchDoctorPatients, fetchDoctorAppointments, isLoading } = useDoctorStore();
    const [timeRange, setTimeRange] = useState('This Week');
    const navigate = useNavigate();

    // Fetch data on mount
    useEffect(() => {
        fetchDoctorPatients();
        fetchDoctorAppointments();
    }, []);

    // Welcome Date
    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const pendingAppointments = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED').length;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Welcome back, Dr. {user?.name?.split(' ')[1] || 'Doctor'}! 👋
                    </h1>
                    <p className="text-neutral-500 mt-1">{today} • You have {pendingAppointments} pending appointments today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" icon={Calendar} onClick={() => navigate('/doctor/schedule')}>View Schedule</Button>
                    <Button icon={Stethoscope} onClick={() => navigate('/doctor/patients')}>Start Consultation</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Patients', value: patients.length.toString(), trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', link: '/doctor/patients' },
                    { title: 'Appointments', value: appointments.length.toString(), trend: '+8%', icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50', link: '/doctor/schedule' },
                    { title: 'Prescriptions', value: '35', trend: '+5%', icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/doctor/patients' },
                    { title: 'Avg. Rating', value: '4.8', trend: '+0.2', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50', link: '#' },
                ].map((stat, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => stat.link !== '#' && navigate(stat.link)}>
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <TrendingUp className="h-3 w-3 mr-1" /> {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-neutral-500">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-neutral-900 mt-1">
                                {isLoading ? '...' : stat.value}
                            </h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Patient Activity" className="h-[400px]"
                        action={
                            <select
                                className="text-sm border-none bg-neutral-50 rounded-lg px-2 py-1 cursor-pointer focus:ring-0 text-neutral-600"
                                value={timeRange}
                                onChange={(e) => setTimeRange(e.target.value)}
                            >
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                            </select>
                        }
                    >
                        <div className="h-[320px] w-full pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#1f2937' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="patients"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPatients)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Recent Appointments List */}
                    <Card title="Today's Schedule">
                        <div className="space-y-4">
                            {[
                                { time: '09:00 AM', patient: 'Sarah Johnson', type: 'General Checkup', status: 'Completed', img: 'SJ' },
                                { time: '10:30 AM', patient: 'Michael Chen', type: 'Follow-up', status: 'In Progress', img: 'MC' },
                                { time: '11:45 AM', patient: 'Emma Wilson', type: 'Lab Results', status: 'Pending', img: 'EW' },
                                { time: '02:15 PM', patient: 'James Rodriguez', type: 'Emergency', status: 'Pending', img: 'JR' },
                            ].map((apt, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors group cursor-pointer" onClick={() => navigate('/doctor/schedule')}>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-bold text-neutral-500 w-16">{apt.time}</div>
                                        <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                                            {apt.img}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-neutral-900">{apt.patient}</h4>
                                            <p className="text-xs text-neutral-500">{apt.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            apt.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {apt.status}
                                        </span>
                                        <button className="text-neutral-300 hover:text-primary transition-colors">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full mt-2 text-primary hover:bg-blue-50" icon={ArrowUpRight} onClick={() => navigate('/doctor/schedule')}>
                                View Full Schedule
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    {/* Patient Demographics */}
                    <Card title="Demographics">
                        <div className="h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={genderData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {genderData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
                                <p className="text-xs text-neutral-400">Total</p>
                                <p className="text-2xl font-bold text-neutral-900">850</p>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card title="Quick Actions">
                        <div className="space-y-2">
                            <button
                                className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-blue-50 rounded-xl transition-all group"
                                onClick={() => navigate('/doctor/patients')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600 group-hover:text-blue-700">
                                        <Users className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-neutral-700 group-hover:text-blue-900">Register New Patient</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-blue-500" />
                            </button>

                            <button
                                className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-purple-50 rounded-xl transition-all group"
                                onClick={() => navigate('/doctor/patients')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-purple-600 group-hover:text-purple-700">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-neutral-700 group-hover:text-purple-900">Create Report</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-purple-500" />
                            </button>

                            <button
                                className="w-full flex items-center justify-between p-3 bg-neutral-50 hover:bg-emerald-50 rounded-xl transition-all group"
                                onClick={() => navigate('/doctor/chat')}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-emerald-600 group-hover:text-emerald-700">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <span className="font-medium text-neutral-700 group-hover:text-emerald-900">Messages (3)</span>
                                </div>
                                <ChevronRight className="h-4 w-4 text-neutral-400 group-hover:text-emerald-500" />
                            </button>
                        </div>
                    </Card>

                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-white/20 text-xs px-2 py-1 rounded-md backdrop-blur-sm">PRO</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">AI Assistant</h3>
                        <p className="text-blue-100 text-sm mb-4">You have 12 pending predicted diagnoses to review.</p>
                        <button
                            className="w-full py-2 px-4 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
                            onClick={() => navigate('/doctor/patients')}
                        >
                            Review Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
