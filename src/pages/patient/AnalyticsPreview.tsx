import React, { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Activity, Heart, TrendingUp, Calendar, Download, Share2,
    FileText, Brain, AlertCircle, CheckCircle, ChevronDown, Zap,
    Monitor, Smartphone, Award
} from 'lucide-react';
import { Button, Badge, Card } from '../../components/ui';

// Mock Data
const vitalsData = [
    { date: 'Mon', systolic: 120, diastolic: 80, heartRate: 72 },
    { date: 'Tue', systolic: 118, diastolic: 79, heartRate: 75 },
    { date: 'Wed', systolic: 122, diastolic: 82, heartRate: 70 },
    { date: 'Thu', systolic: 119, diastolic: 81, heartRate: 74 },
    { date: 'Fri', systolic: 121, diastolic: 80, heartRate: 73 },
    { date: 'Sat', systolic: 120, diastolic: 78, heartRate: 71 },
    { date: 'Sun', systolic: 118, diastolic: 79, heartRate: 72 },
];

const sleepData = [
    { day: 'Mon', hours: 7.5 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 8.0 },
    { day: 'Thu', hours: 7.2 },
    { day: 'Fri', hours: 7.8 },
    { day: 'Sat', hours: 8.5 },
    { day: 'Sun', hours: 8.2 },
];

const adherenceData = [
    { name: 'Taken', value: 85, color: '#10b981' },
    { name: 'Missed', value: 15, color: '#ef4444' },
];

const AnalyticsPreview: React.FC = () => {
    const [timeRange, setTimeRange] = useState('7d');

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Health Analytics
                    </h1>
                    <p className="text-indigo-100 text-sm mt-1">Detailed insights into your well-being</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                    <Button className="bg-white text-indigo-600 hover:bg-indigo-50">
                        <Download className="h-4 w-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* AI Insights Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mt-1">
                    <Brain className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900">AI Health Insight</h3>
                    <p className="text-sm text-amber-800 mt-1">
                        "Your heart rate variability has improved by <strong>12%</strong> this week compared to last week.
                        This suggests better recovery and lower stress levels. Keep up the good sleep schedule!"
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Vitals Chart - 2 Columns */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-neutral-900">Blood Pressure & Heart Rate</h3>
                                <p className="text-xs text-neutral-500">Daily average measurements</p>
                            </div>
                            <div className="flex bg-neutral-100 rounded-lg p-1">
                                {['7d', '30d', '3m'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'
                                            }`}
                                    >
                                        {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={vitalsData}>
                                    <defs>
                                        <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="systolic"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorBP)"
                                        name="Systolic BP"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="diastolic"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        fillOpacity={0}
                                        fill="url(#colorBP)"
                                        name="Diastolic BP"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="heartRate"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorHR)"
                                        name="Heart Rate"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Sleep Chart */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Monitor className="h-5 w-5 text-indigo-500" />
                                Sleep Duration
                            </h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={sleepData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'transparent' }} />
                                        <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Activity Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                            <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-orange-500" />
                                Activity Impact
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-neutral-50 p-3 rounded-xl flex items-center gap-3">
                                    <TrendingUp className="h-8 w-8 text-green-500" />
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">Active Calories</p>
                                        <p className="text-xs text-neutral-500">450 kcal avg / day</p>
                                    </div>
                                    <Badge className="ml-auto bg-green-100 text-green-700">+12%</Badge>
                                </div>
                                <div className="bg-neutral-50 p-3 rounded-xl flex items-center gap-3">
                                    <Award className="h-8 w-8 text-purple-500" />
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">Weekly Goal</p>
                                        <p className="text-xs text-neutral-500">4/5 days achieved</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Adherence & Scores */}
                <div className="space-y-6">
                    {/* Medication Adherence */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col items-center">
                        <h3 className="font-bold text-neutral-900 mb-2 w-full text-left">Medication Adherence</h3>
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={adherenceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {adherenceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-neutral-900">85%</span>
                                <span className="text-xs text-neutral-500">Taken</span>
                            </div>
                        </div>
                        <div className="w-full space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Taken on time
                                </span>
                                <span className="font-bold">42 doses</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Missed/Late
                                </span>
                                <span className="font-bold">7 doses</span>
                            </div>
                        </div>
                    </div>

                    {/* Health Score Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Health Score
                            </h3>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">Top 10%</span>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-bold">92</span>
                            <span className="text-lg opacity-80 mb-2">/ 100</span>
                        </div>
                        <p className="text-sm text-indigo-100 mb-4">You are doing better than 90% of patients in your age group!</p>
                        <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 border-0">
                            View Breakdown
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPreview;
