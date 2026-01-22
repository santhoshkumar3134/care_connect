import React, { useState } from 'react';
import {
    Activity, Heart, Brain, Zap, CheckCircle, AlertTriangle,
    ChevronRight, Thermometer, User, Scale, Flame, Cigarette,
    Dna, ArrowRight, Loader2, Sparkles
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { Button, Badge, Input } from '../../components/ui';
import { predictDiseaseRisk } from '../../services/geminiService';
import { PredictionResult } from '../../types';

const GaugeChart = ({ value, color }: { value: number; color: string }) => {
    const data = [
        { name: 'Score', value: value, color: color },
        { name: 'Remaining', value: 100 - value, color: '#f3f4f6' },
    ];

    return (
        <div className="relative h-32 w-32 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[10%] text-center">
                <span className="text-2xl font-bold text-neutral-900">{value}%</span>
            </div>
        </div>
    );
};

const PatientPrediction: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<PredictionResult[]>([]);
    const [inputs, setInputs] = useState({
        age: '45',
        gender: 'Male',
        height: '178',
        weight: '82',
        systolicBP: '128',
        diastolicBP: '82',
        cholesterol: '210',
        hdl: '45',
        ldl: '130',
        activityLevel: 'Moderate',
        smoker: 'No',
        familyHistory: 'Diabetes'
    });

    const handlePredict = async () => {
        setLoading(true);
        try {
            const data = await predictDiseaseRisk(inputs);
            setResults(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateBMI = () => {
        const h = parseFloat(inputs.height) / 100;
        const w = parseFloat(inputs.weight);
        if (!h || !w) return 0;
        return (w / (h * h)).toFixed(1);
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/30">
                        <Sparkles className="h-3 w-3" />
                        <span>AI-Powered Analysis</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Advanced Health Prediction</h1>
                    <p className="text-purple-100 text-lg leading-relaxed">
                        Leveraging Gemini AI models to analyze your vitals and lifestyle metrics, providing early risk assessments for proactive health management.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Input Form */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl shadow-xl shadow-neutral-100/50 border border-neutral-200 overflow-hidden">
                        <div className="bg-neutral-50 p-4 border-b border-neutral-100">
                            <h3 className="font-bold text-neutral-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-500" />
                                Your Health Profile
                            </h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Section 1: Personal */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                    <User className="h-3 w-3" /> Personal Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Age" type="number" value={inputs.age} onChange={e => setInputs({ ...inputs, age: e.target.value })} containerClassName="bg-neutral-50/50" />
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                                        <select className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-neutral-50/50" value={inputs.gender} onChange={e => setInputs({ ...inputs, gender: e.target.value })}>
                                            <option>Male</option>
                                            <option>Female</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Height (cm)" type="number" value={inputs.height} onChange={e => setInputs({ ...inputs, height: e.target.value })} containerClassName="bg-neutral-50/50" />
                                    <Input label="Weight (kg)" type="number" value={inputs.weight} onChange={e => setInputs({ ...inputs, weight: e.target.value })} containerClassName="bg-neutral-50/50" />
                                </div>
                                <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                                    <span className="text-xs font-semibold text-indigo-700">Calculated BMI</span>
                                    <Badge className="bg-white text-indigo-700 shadow-sm">{calculateBMI()}</Badge>
                                </div>
                            </div>

                            <div className="h-px bg-neutral-100"></div>

                            {/* Section 2: Vitals */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                    <Heart className="h-3 w-3" /> Vitals & Labs
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Systolic BP" type="number" value={inputs.systolicBP} onChange={e => setInputs({ ...inputs, systolicBP: e.target.value })} />
                                    <Input label="Diastolic BP" type="number" value={inputs.diastolicBP} onChange={e => setInputs({ ...inputs, diastolicBP: e.target.value })} />
                                </div>
                                <Input label="Total Cholesterol" type="number" value={inputs.cholesterol} onChange={e => setInputs({ ...inputs, cholesterol: e.target.value })} />
                            </div>

                            <div className="h-px bg-neutral-100"></div>

                            {/* Section 3: Lifestyle */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                    <Flame className="h-3 w-3" /> Lifestyle
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Activity Level</label>
                                    <select className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-neutral-50/50" value={inputs.activityLevel} onChange={e => setInputs({ ...inputs, activityLevel: e.target.value })}>
                                        <option>Sedentary</option>
                                        <option>Light</option>
                                        <option>Moderate</option>
                                        <option>Active</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Smoker?</label>
                                        <select className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-neutral-50/50" value={inputs.smoker} onChange={e => setInputs({ ...inputs, smoker: e.target.value })}>
                                            <option>No</option>
                                            <option>Yes</option>
                                        </select>
                                    </div>
                                    <Input label="History" value={inputs.familyHistory} onChange={e => setInputs({ ...inputs, familyHistory: e.target.value })} placeholder="e.g. Diabetes" />
                                </div>
                            </div>

                            <Button
                                onClick={handlePredict}
                                isLoading={loading}
                                className="w-full py-6 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-[1.02] transition-all rounded-xl"
                                icon={loading ? Loader2 : Zap}
                            >
                                {loading ? 'Analyzing Profile...' : 'Generate Prediction'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-8 space-y-6">
                    {results.length > 0 ? (
                        <div className="space-y-6 animate-slide-in">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-2xl font-bold text-neutral-900">Analysis Results</h2>
                                <span className="text-sm text-neutral-500">Based on provided metrics</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.map((res, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-3xl border p-6 relative overflow-hidden transition-all hover:shadow-xl ${res.riskLevel === 'HIGH' ? 'bg-red-50/50 border-red-100' :
                                                res.riskLevel === 'MODERATE' ? 'bg-amber-50/50 border-amber-100' : 'bg-green-50/50 border-green-100'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Badge
                                                    className={`mb-2 ${res.riskLevel === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                            res.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                                        }`}
                                                    variant="neutral"
                                                >
                                                    {res.riskLevel} RISK
                                                </Badge>
                                                <h3 className="text-xl font-bold text-neutral-900">{res.condition}</h3>
                                            </div>
                                            <GaugeChart
                                                value={res.riskScore}
                                                color={
                                                    res.riskLevel === 'HIGH' ? '#ef4444' :
                                                        res.riskLevel === 'MODERATE' ? '#f59e0b' : '#10b981'
                                                }
                                            />
                                        </div>

                                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/50">
                                            <p className="text-sm text-neutral-700 leading-relaxed font-medium">
                                                {res.explanation}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">Recommendations</h4>
                                            <ul className="space-y-2">
                                                {res.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 bg-white/40 p-2 rounded-lg">
                                                        <div className={`mt-1 p-1 rounded-full ${res.riskLevel === 'HIGH' ? 'bg-red-100 text-red-600' :
                                                                res.riskLevel === 'MODERATE' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'
                                                            }`}>
                                                            <CheckCircle className="h-3 w-3" />
                                                        </div>
                                                        <span className="flex-1">{rec}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-center">
                                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                    <Brain className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-blue-900">AI Medical Disclaimer</h4>
                                    <p className="text-sm text-blue-700"> These predictions are generated by AI for informational purposes only. Always consult with a qualified healthcare provider for medical diagnosis and treatment.</p>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-200 rounded-3xl bg-neutral-50/50">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
                                <div className="relative bg-white p-6 rounded-full shadow-lg">
                                    <Dna className="h-12 w-12 text-indigo-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Ready to Analyze</h3>
                            <p className="text-neutral-500 max-w-md text-center text-lg">
                                Fill in your health profile on the left and tap "Generate Prediction" to receive a comprehensive AI risk assessment.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default PatientPrediction;
