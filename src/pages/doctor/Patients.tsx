import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../../components/ui';
import { Search, Filter, Eye, MessageSquare, MoreHorizontal, UserPlus, X, FileText, Calendar, Activity, Phone, Mail, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/store';
import { useDoctorStore } from '../../store/doctorStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorPatients: React.FC = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiSummary, setAiSummary] = useState('');

    const {
        patients: doctorPatients,
        isLoading,
        fetchDoctorPatients,
        subscribeToPatientRelationships,
        unsubscribeFromPatientRelationships
    } = useDoctorStore();

    // Prescription State
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [medications, setMedications] = useState<any[]>([
        { name: '', dosage: '', frequency: 'Once Daily', duration: '' }
    ]);

    useEffect(() => {
        fetchDoctorPatients();
        subscribeToPatientRelationships();
        return () => unsubscribeFromPatientRelationships();
    }, []);

    // Calculate age helper
    const calculateAge = (dob?: string) => {
        if (!dob) return 'N/A';
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    // Transform store data to component format
    const patientsList = doctorPatients.map(rel => ({
        id: rel.patient.id,
        name: rel.patient.name,
        email: rel.patient.email,
        phone: rel.patient.phone || 'N/A',
        age: calculateAge(rel.patient.date_of_birth),
        gender: rel.patient.gender || 'Unknown',
        condition: 'General Checkup', // Placeholder as not in profile
        status: rel.is_active ? 'Active' : 'Inactive',
        lastVisit: rel.start_date ? new Date(rel.start_date).toLocaleDateString() : 'N/A',
        avatar_url: rel.patient.avatar_url
    }));

    const handleAddMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: 'Once Daily', duration: '' }]);
    };

    const handleUpdateMedication = (index: number, field: string, value: string) => {
        const newMeds = [...medications];
        newMeds[index][field as any] = value;
        setMedications(newMeds);
    };

    useEffect(() => {
        const state = location.state as any;
        if (state?.selectedPatientId && patientsList.length > 0) {
            const patient = patientsList.find(p => p.id === state.selectedPatientId);
            if (patient) {
                setSelectedPatient(patient);
            }
        }
        if (state?.searchTerm) {
            setSearchTerm(state.searchTerm);
        }
        // Clear state to prevent sticky behavior if needed, but keeping it simple for now
        if (state) {
            window.history.replaceState({}, document.title);
        }
    }, [location.state, doctorPatients]);

    const handleMessage = (patientId: string, patientName: string) => {
        navigate('/doctor/chat', { state: { selectedPatientId: patientId, selectedPatientName: patientName } });
    };

    const filteredPatients = patientsList.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Critical': return 'error';
            case 'Discharged': return 'neutral';
            default: return 'info';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">My Patients</h1>
                    <p className="text-neutral-500">Manage patient records and histories</p>
                </div>
                <Button icon={UserPlus} onClick={() => setIsAddModalOpen(true)}>Add New Patient</Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search patients by name or condition..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </Card>

            {/* Patients Table */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Age/Gender</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnosis</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Visit</th>
                                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">Loading patients...</td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-gray-500">No patients found.</td>
                                </tr>
                            ) : (
                                filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedPatient(patient)}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {patient.avatar_url ? (
                                                        <img src={patient.avatar_url} alt={patient.name} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        patient.name.split(' ').map((n: string) => n[0]).join('')
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{patient.name}</p>
                                                    <p className="text-xs text-gray-500">{patient.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{patient.id.slice(0, 8)}...</td>
                                        <td className="py-4 px-6 text-sm text-gray-900">{patient.age} / {patient.gender}</td>
                                        <td className="py-4 px-6 text-sm text-gray-600 font-medium">{patient.condition}</td>
                                        <td className="py-4 px-6">
                                            <Badge variant={getStatusColor(patient.status) as any}>{patient.status}</Badge>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">{patient.lastVisit}</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/doctor/patient/${patient.id}`); }}
                                                >
                                                    View Record
                                                </Button>
                                                <button
                                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                    title="View Details"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedPatient(patient); }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                                                    title="Message"
                                                    onClick={(e) => { e.stopPropagation(); handleMessage(patient.id, patient.name); }}
                                                >
                                                    <MessageSquare className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Patient Details Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPatient(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-in" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50 sticky top-0 z-10">
                            <h3 className="font-bold text-xl text-neutral-900">Patient Details</h3>
                            <button onClick={() => setSelectedPatient(null)} className="p-1 hover:bg-neutral-200 rounded-full"><X className="h-5 w-5 text-neutral-500" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-start gap-4">
                                <div className="h-20 w-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                                    {selectedPatient.avatar_url ? (
                                        <img src={selectedPatient.avatar_url} alt={selectedPatient.name} className="h-20 w-20 rounded-full object-cover" />
                                    ) : (
                                        selectedPatient.name.split(' ').map((n: string) => n[0]).join('')
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-2xl font-bold text-neutral-900">{selectedPatient.name}</h2>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <Badge variant="neutral">ID: {selectedPatient.id.slice(0, 8)}</Badge>
                                                <Badge variant="neutral">{selectedPatient.age} yrs</Badge>
                                                <Badge variant="neutral">{selectedPatient.gender}</Badge>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setIsGeneratingSummary(true);
                                                setAiSummary('');
                                                const { summarizePatientHistory } = await import('../../services/geminiService');
                                                // Mock history for now since main list doesn't have deep history
                                                const history = [
                                                    { date: selectedPatient.lastVisit, type: 'Visit', summary: `Routine checkup for ${selectedPatient.condition}` },
                                                    { date: '2025-12-01', type: 'Lab', summary: 'Blood work showed stable levels' },
                                                    { date: '2025-11-15', type: 'Prescription', summary: 'Refilled core medications' }
                                                ];
                                                // @ts-ignore
                                                const summary = await summarizePatientHistory(selectedPatient.name, selectedPatient.age, selectedPatient.condition, history);
                                                setAiSummary(summary);
                                                setIsGeneratingSummary(false);
                                            }}
                                            className="group flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                            disabled={isGeneratingSummary}
                                        >
                                            {isGeneratingSummary ? (
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Sparkles className="h-4 w-4" />
                                            )}
                                            <span className="text-sm font-medium">AI Summary</span>
                                        </button>
                                    </div>

                                    {/* AI Summary Result */}
                                    {aiSummary && (
                                        <div className="mt-4 p-3 bg-violet-50 border border-violet-100 rounded-xl animate-fade-in relative group/summary">
                                            <div className="absolute -left-1 top-4 w-1 h-8 bg-violet-500 rounded-full" />
                                            <h4 className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" /> Clinical Insights (Gemini)
                                            </h4>
                                            <div className="text-sm text-violet-900 leading-relaxed whitespace-pre-line pl-2">
                                                {aiSummary}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4 mt-3 text-sm text-neutral-500">
                                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {selectedPatient.phone}</div>
                                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedPatient.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Info Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-xs text-red-500 font-bold uppercase mb-1">Condition</p>
                                    <p className="font-semibold text-red-900">{selectedPatient.condition}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-xs text-blue-500 font-bold uppercase mb-1">Last Visit</p>
                                    <p className="font-semibold text-blue-900">{selectedPatient.lastVisit}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                                    <p className="text-xs text-green-500 font-bold uppercase mb-1">Status</p>
                                    <p className="font-semibold text-green-900">{selectedPatient.status}</p>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <p className="text-xs text-purple-500 font-bold uppercase mb-1">Next Appt</p>
                                    <p className="font-semibold text-purple-900">In 2 weeks</p>
                                </div>
                            </div>

                            {/* Medical History Section */}
                            <div>
                                <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" /> Medical History
                                </h4>
                                <div className="space-y-3">
                                    <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-neutral-900">General Checkup</span>
                                            <span className="text-sm text-neutral-500">Jan 15, 2026</span>
                                        </div>
                                        <p className="text-sm text-neutral-600">Routine follow-up. Blood pressure slightly elevated (130/85). Prescribed lifestyle changes.</p>
                                    </div>
                                    <div className="p-4 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
                                        <div className="flex justify-between mb-1">
                                            <span className="font-semibold text-neutral-900">Lab Results - Blood Panel</span>
                                            <span className="text-sm text-neutral-500">Dec 20, 2025</span>
                                        </div>
                                        <p className="text-sm text-neutral-600">Cholesterol levels within normal range. Vitamin D deficiency noted.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Health Trends Graph (New Feature) */}
                            <div>
                                <h4 className="font-bold text-neutral-900 mb-3 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-rose-500" /> Vitals & Health Trends
                                </h4>
                                <div className="p-4 bg-white border border-neutral-200 rounded-xl shadow-sm h-64">
                                    <h5 className="text-sm font-semibold text-neutral-500 mb-4 ml-2">Blood Pressure (Last 6 Months)</h5>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={[
                                            { name: 'Aug', systolic: 120, diastolic: 80 },
                                            { name: 'Sep', systolic: 122, diastolic: 82 },
                                            { name: 'Oct', systolic: 130, diastolic: 85 },
                                            { name: 'Nov', systolic: 128, diastolic: 84 },
                                            { name: 'Dec', systolic: 125, diastolic: 82 },
                                            { name: 'Jan', systolic: 120, diastolic: 78 },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="name" fontSize={12} stroke="#9ca3af" />
                                            <YAxis fontSize={12} stroke="#9ca3af" domain={[60, 160]} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex gap-3 pt-4 border-t border-neutral-100">
                                <Button className="flex-1" icon={MessageSquare} onClick={() => handleMessage(selectedPatient.id, selectedPatient.name)}>Message</Button>
                                <Button className="flex-1" variant="outline" icon={FileText} onClick={() => setIsPrescriptionModalOpen(true)}>Prescribe</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Patient Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsAddModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-in" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                            <h3 className="font-bold text-lg text-neutral-900">Register New Patient</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-neutral-200 rounded-full"><X className="h-5 w-5 text-neutral-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label="Full Name" placeholder="e.g. John Doe" />
                            <Input label="Email Address" type="email" placeholder="john@example.com" />
                            <Input label="Phone Number" placeholder="(555) 000-0000" />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Date of Birth" type="date" />
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                                    <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
                                        <option>Select...</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <Button className="w-full mt-4" onClick={() => { setIsAddModalOpen(false); alert("Patient registration request sent."); }}>Register Patient</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Digital Prescription Pad Modal */}
            {isPrescriptionModalOpen && selectedPatient && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setIsPrescriptionModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-in border border-neutral-200" onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white rounded-t-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><h1 className="text-8xl font-bold">Rx</h1></div>
                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold font-serif tracking-wide">Digital Prescription Pad</h2>
                                    <p className="opacity-90 text-sm mt-1">Nalam Health Clinic • {user?.name || 'Doctor'}</p>
                                </div>
                                <button onClick={() => setIsPrescriptionModalOpen(false)} className="p-1.5 hover:bg-white/20 rounded-full transition-colors"><X className="h-6 w-6" /></button>
                            </div>
                        </div>

                        <div className="p-8 space-y-8 bg-neutral-50/30">
                            {/* Patient Info Bar */}
                            <div className="flex flex-wrap gap-6 p-4 bg-white border border-neutral-200 rounded-xl shadow-sm">
                                <div><span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Patient Name</span><p className="font-semibold text-lg text-neutral-900">{selectedPatient.name}</p></div>
                                <div><span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Age/Gender</span><p className="font-medium text-neutral-700">{selectedPatient.age} / {selectedPatient.gender}</p></div>
                                <div><span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">Date</span><p className="font-medium text-neutral-700">{new Date().toLocaleDateString()}</p></div>
                                <div className="ml-auto"><span className="text-xs text-neutral-500 uppercase tracking-wider font-bold">ID</span><p className="font-mono text-neutral-600">{selectedPatient.id}</p></div>
                            </div>

                            {/* Medications Table */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <h3 className="font-bold text-neutral-800 flex items-center gap-2"><FileText className="text-teal-600 h-5 w-5" /> Prescribed Medications</h3>
                                    <Button size="sm" variant="outline" onClick={handleAddMedication} icon={UserPlus}>+ Add Drug</Button>
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-xs">
                                            <tr>
                                                <th className="px-4 py-3">Medicine Name</th>
                                                <th className="px-4 py-3">Dosage</th>
                                                <th className="px-4 py-3">Frequency</th>
                                                <th className="px-4 py-3">Duration</th>
                                                <th className="px-4 py-3 w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {medications.map((med, index) => (
                                                <tr key={index} className="group hover:bg-neutral-50 transition-colors">
                                                    <td className="p-2"><input className="w-full p-2 rounded border border-transparent hover:border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-transparent" placeholder="e.g. Amoxicillin" value={med.name} onChange={e => handleUpdateMedication(index, 'name', e.target.value)} /></td>
                                                    <td className="p-2"><input className="w-full p-2 rounded border border-transparent hover:border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-transparent" placeholder="e.g. 500mg" value={med.dosage} onChange={e => handleUpdateMedication(index, 'dosage', e.target.value)} /></td>
                                                    <td className="p-2">
                                                        <select className="w-full p-2 rounded border border-transparent hover:border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-transparent" value={med.frequency} onChange={e => handleUpdateMedication(index, 'frequency', e.target.value)}>
                                                            <option>Once Daily</option>
                                                            <option>Twice Daily</option>
                                                            <option>Thrice Daily</option>
                                                            <option>Every 6 Hours</option>
                                                            <option>As Needed</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-2"><input className="w-full p-2 rounded border border-transparent hover:border-neutral-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-transparent" placeholder="e.g. 7 Days" value={med.duration} onChange={e => handleUpdateMedication(index, 'duration', e.target.value)} /></td>
                                                    <td className="p-2 text-center">
                                                        <button onClick={() => setMedications(meds => meds.filter((_, i) => i !== index))} className="text-neutral-300 hover:text-red-500 transition-colors p-1"><X className="h-4 w-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {medications.length === 0 && (
                                        <div className="p-8 text-center text-neutral-400 italic">No medications added yet.</div>
                                    )}
                                </div>
                            </div>

                            {/* Footer / Signature */}
                            <div className="flex flex-col sm:flex-row items-end justify-between gap-6 pt-6 border-t border-neutral-200">
                                <div className="w-full sm:w-auto">
                                    <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Electronic Signature</label>
                                    <div className="h-16 w-64 border-b-2 border-neutral-300 flex items-end pb-2">
                                        <p className="font-cursive text-3xl text-indigo-900 font-bold italic transform -rotate-2">{user?.name || 'Dr. Sarah Chen, MD'}</p>
                                    </div>
                                    <p className="text-[10px] text-neutral-400 mt-1">Digitally signed on {new Date().toLocaleString()}</p>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button variant="outline" onClick={() => setIsPrescriptionModalOpen(false)}>Cancel</Button>
                                    <Button
                                        onClick={() => {
                                            alert(`Prescription for ${medications.length} items sent to Pharmacy!`);
                                            setIsPrescriptionModalOpen(false);
                                        }}
                                        className="bg-teal-600 hover:bg-teal-700 text-white min-w-[160px]"
                                    >
                                        <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Send to Pharmacy</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorPatients;
