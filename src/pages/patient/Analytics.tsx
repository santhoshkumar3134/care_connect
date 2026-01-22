import React, { useState, useEffect } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import {
    Activity, Heart, TrendingUp, Download, Share2,
    Brain, Monitor, Zap, Award, Scale, Droplet
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { useDataStore } from '../../store/store';

// Helper to generate data based on range
const generateData = (range: string) => {
    const count = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    const today = new Date();

    // Base values to simulate trends
    let currentWeight = 70.5;

    for (let i = count - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);

        // Simulate slight weight fluctuation/trend
        if (Math.random() > 0.5) currentWeight += (Math.random() * 0.2 - 0.1);

        data.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            systolic: 120 + Math.floor(Math.random() * 10 - 2),
            diastolic: 80 + Math.floor(Math.random() * 8 - 2),
            heartRate: 72 + Math.floor(Math.random() * 12 - 6),
            weight: Number(currentWeight.toFixed(1)),
            glucose: 95 + Math.floor(Math.random() * 15 - 5),
            activeCalories: 350 + Math.floor(Math.random() * 200)
        });
    }
    return data;
};

const PatientAnalytics: React.FC = () => {
    const { records, medications, appointments, fetchData } = useDataStore();
    const [timeRange, setTimeRange] = useState('7d');
    const [analyticsData, setAnalyticsData] = useState(generateData('7d'));

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Update data when time range changes
    useEffect(() => {
        setAnalyticsData(generateData(timeRange));
    }, [timeRange]);

    // Dynamic Calculations
    const totalMeds = medications.length;
    const compliantMeds = medications.filter(m => m.stock > 5).length;
    const adherenceRate = totalMeds > 0 ? Math.round((compliantMeds / totalMeds) * 100) : 100;

    const adherenceData = [
        { name: 'Taken', value: adherenceRate, color: '#10b981' },
        { name: 'Missed', value: 100 - adherenceRate, color: '#ef4444' },
    ];

    const baseScore = 70;
    const engagementBonus = Math.min(15, (appointments.length + records.length) * 2);
    const adherenceBonus = Math.round((adherenceRate / 100) * 15);
    const healthScore = Math.min(100, baseScore + engagementBonus + adherenceBonus);

    // Calculate average for selected range to show summaries
    const avgWeight = (analyticsData.reduce((acc, curr) => acc + curr.weight, 0) / analyticsData.length).toFixed(1);
    const avgGlucose = Math.round(analyticsData.reduce((acc, curr) => acc + curr.glucose, 0) / analyticsData.length);

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-2xl text-white shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6" />
                        Health Analytics
                    </h1>
                    <p className="text-indigo-100 text-sm mt-1">Detailed insights based on your {records.length} health records</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-white/10 rounded-lg p-1 backdrop-blur-sm border border-white/20">
                        {['7d', '30d', '3m'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${timeRange === range ? 'bg-white text-indigo-900 shadow-md' : 'text-white hover:bg-white/10'
                                    }`}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        className="bg-white text-indigo-600 hover:bg-white/90 border-0"
                        icon={Share2}
                        onClick={() => {
                            const data = `CareConnect Health Analytics Report
=====================================
Generated: ${new Date().toLocaleString()}
Time Period: ${timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Last 3 Months'}

HEALTH SCORE: ${healthScore}/100
${healthScore > 90 ? '⭐ Excellent - Top 10%' : healthScore > 75 ? '✓ Good' : '⚠ Needs Attention'}

KEY METRICS:
- Average Weight: ${avgWeight} kg
- Average Blood Glucose: ${avgGlucose} mg/dL
- Medication Adherence: ${adherenceRate}%
- Total Health Records: ${records.length}
- Total Appointments: ${appointments.length}

Your health trends are ${healthScore > 85 ? 'positive' : 'stable'}. Continue monitoring your vitals regularly.

---
Generated by CareConnect Health Portal
`;
                            const blob = new Blob([data], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `health-analytics-${new Date().toISOString().split('T')[0]}.txt`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                        }}
                    >
                        Share Report
                    </Button>
                </div>
            </div>



            {/* AI Insights Banner (Dynamic) */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-start gap-4">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mt-1">
                    <Brain className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="font-bold text-amber-900">AI Health Insight</h3>
                    <p className="text-sm text-amber-800 mt-1">
                        "Your health score is <strong>{healthScore}/100</strong>.
                        Your average weight over the last {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'quarter'} is <strong>{avgWeight}kg</strong>, which is stable.
                        Blood glucose levels are within normal range (avg {avgGlucose} mg/dL)."
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column: Trend Charts */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Vitals Chart (BP & HR) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-rose-500" />
                                    Blood Pressure & Heart Rate
                                </h3>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData}>
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
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} minTickGap={30} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="systolic" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorBP)" name="Systolic BP" />
                                    <Area type="monotone" dataKey="diastolic" stroke="#6366f1" strokeWidth={2} fillOpacity={0} fill="url(#colorBP)" name="Diastolic BP" />
                                    <Area type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorHR)" name="Heart Rate" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Weight Trend Chart (NEW) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                                <Scale className="h-5 w-5 text-blue-500" />
                                Weight Trends
                            </h3>
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
                                Avg: {avgWeight} kg
                            </Badge>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData}>
                                    <defs>
                                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} minTickGap={30} />
                                    <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} unit=" kg" />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" name="Weight (kg)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Blood Glucose Chart (NEW) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-neutral-900 flex items-center gap-2">
                                <Droplet className="h-5 w-5 text-red-500" />
                                Blood Glucose
                            </h3>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">Avg: {avgGlucose} mg/dL</Badge>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analyticsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} minTickGap={30} />
                                    <YAxis domain={[70, 160]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} unit=" mg/dL" />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="glucose" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} name="Glucose" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Health Score Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Health Score
                            </h3>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs">{healthScore > 90 ? 'Top 10%' : 'Good'}</span>
                        </div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-5xl font-bold">{healthScore}</span>
                            <span className="text-lg opacity-80 mb-2">/ 100</span>
                        </div>
                        <p className="text-sm text-indigo-100 mb-4">
                            Based on your {records.length} records, {appointments.length} visits, and adherence.
                        </p>
                        <Button className="w-full bg-white text-indigo-600 hover:bg-white/90 border-0">
                            View Breakdown
                        </Button>
                    </div>

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
                                <span className="text-3xl font-bold text-neutral-900">{adherenceRate}%</span>
                                <span className="text-xs text-neutral-500">Taken</span>
                            </div>
                        </div>
                        <div className="w-full space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    Taken on time
                                </span>
                                <span className="font-bold">{compliantMeds} meds</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    Missed/Late
                                </span>
                                <span className="font-bold">{totalMeds - compliantMeds} meds</span>
                            </div>
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
                                    <p className="text-xs text-neutral-500">~ 2450 kcal / week</p>
                                </div>
                                <Badge className="ml-auto bg-green-100 text-green-700">+12%</Badge>
                            </div>
                            <div className="bg-neutral-50 p-3 rounded-xl flex items-center gap-3">
                                <Award className="h-8 w-8 text-purple-500" />
                                <div>
                                    <p className="text-sm font-bold text-neutral-900">Weekly Goal</p>
                                    <p className="text-xs text-neutral-500">Based on your activity level</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientAnalytics;
