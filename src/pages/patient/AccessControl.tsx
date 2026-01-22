import React, { useState } from 'react';
import {
    Shield, Lock, Unlock, Users, Clock, AlertTriangle,
    CheckCircle, XCircle, ChevronRight, Eye, FileText, Activity
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';

interface AccessLog {
    id: string;
    accessor: string;
    role: string;
    action: string;
    resource: string;
    timestamp: Date;
    status: 'allowed' | 'denied';
}

interface ProviderAccess {
    id: string;
    name: string;
    role: string;
    hospital: string;
    status: 'active' | 'revoked' | 'expired';
    since: string;
    permissions: string[];
}

const PatientAccessControl: React.FC = () => {
    const [emergencyAccess, setEmergencyAccess] = useState(false);

    const [authorizedProviders, setAuthorizedProviders] = useState<ProviderAccess[]>([
        {
            id: '1',
            name: 'Dr. Sarah Chen',
            role: 'Cardiologist',
            hospital: 'General Hospital',
            status: 'active',
            since: 'Jan 2024',
            permissions: ['Medical History', 'Lab Results', 'Prescriptions']
        },
        {
            id: '2',
            name: 'Dr. Michael Park',
            role: 'Primary Care',
            hospital: 'City Clinic',
            status: 'active',
            since: 'Mar 2023',
            permissions: ['Full Access']
        },
        {
            id: '3',
            name: 'Dr. Emily Wilson',
            role: 'Nutritionist',
            hospital: 'Wellness Center',
            status: 'revoked',
            since: 'Jun 2025',
            permissions: ['Dietary Records']
        }
    ]);

    const [accessLogs] = useState<AccessLog[]>([
        { id: '1', accessor: 'Dr. Sarah Chen', role: 'Cardiologist', action: 'Viewed', resource: 'Lab Results (Blood Work)', timestamp: new Date(Date.now() - 3600000), status: 'allowed' },
        { id: '2', accessor: 'Dr. Michael Park', role: 'Primary Care', action: 'Updated', resource: 'Prescription List', timestamp: new Date(Date.now() - 86400000), status: 'allowed' },
        { id: '3', accessor: 'Dr. Emily Wilson', role: 'Nutritionist', action: 'Viewed', resource: 'Medical History', timestamp: new Date(Date.now() - 172800000), status: 'denied' },
        { id: '4', accessor: 'Emergency Dept', role: 'System', action: 'Request', resource: 'Allergies', timestamp: new Date(Date.now() - 250000000), status: 'allowed' }
    ]);

    const handleRevoke = (id: string) => {
        setAuthorizedProviders(prev => prev.map(p =>
            p.id === id ? { ...p, status: 'revoked' } : p
        ));
    };

    const handleGrant = (id: string) => {
        setAuthorizedProviders(prev => prev.map(p =>
            p.id === id ? { ...p, status: 'active' } : p
        ));
    };

    return (
        <div className="space-y-8 animate-fade-in pb-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Shield className="h-6 w-6 text-indigo-600" />
                        Data Access & Privacy
                    </h1>
                    <p className="text-neutral-500">Manage who can view your health records and monitor access logs.</p>
                </div>

                {/* Emergency Toggle */}
                <div className={`
          flex items-center gap-4 p-4 rounded-xl border-2 transition-all
          ${emergencyAccess ? 'bg-red-50 border-red-200 shadow-md' : 'bg-white border-neutral-200'}
        `}>
                    <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${emergencyAccess ? 'text-red-600' : 'text-neutral-400'}`} />
                            Emergency Access
                        </span>
                        <span className="text-xs text-neutral-500">Allow ER doctors temporary full access</span>
                    </div>
                    <button
                        onClick={() => setEmergencyAccess(!emergencyAccess)}
                        className={`
              relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              ${emergencyAccess ? 'bg-red-600' : 'bg-neutral-200'}
            `}
                    >
                        <span className={`
              inline-block h-6 w-6 transform rounded-full bg-white transition-transform
              ${emergencyAccess ? 'translate-x-7' : 'translate-x-1'}
            `} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Permissions */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Active Providers */}
                    <Card title="Authorized Providers" icon={Users}>
                        <div className="space-y-4">
                            {authorizedProviders.filter(p => p.status === 'active').map(provider => (
                                <div key={provider.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                                        <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-neutral-900">{provider.name}</h3>
                                            <p className="text-xs text-neutral-500">{provider.role} • {provider.hospital}</p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {provider.permissions.map((perm, idx) => (
                                                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full border border-neutral-200">
                                                        {perm}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <Button variant="outline" size="sm" icon={Lock} onClick={() => { }}>Edit</Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
                                            onClick={() => handleRevoke(provider.id)}
                                        >
                                            Revoke
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button variant="dashed" className="w-full py-4 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50">
                                + Grant Access to New Provider
                            </Button>
                        </div>
                    </Card>

                    {/* Revoked Providers */}
                    {authorizedProviders.some(p => p.status === 'revoked') && (
                        <div className="opacity-75 hover:opacity-100 transition-opacity">
                            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 px-1">Revoked Access</h3>
                            <div className="space-y-3">
                                {authorizedProviders.filter(p => p.status === 'revoked').map(provider => (
                                    <div key={provider.id} className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-lg grayscale hover:grayscale-0 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 font-bold">
                                                {provider.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-neutral-700">{provider.name}</h4>
                                                <p className="text-xs text-neutral-500">Access Revoked</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleGrant(provider.id)}>Restore Access</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Logs */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-indigo-600" />
                                Access Logs
                            </h2>
                            <Button variant="ghost" size="sm">View All</Button>
                        </div>

                        <div className="relative border-l border-neutral-200 ml-3 space-y-8">
                            {accessLogs.map(log => (
                                <div key={log.id} className="relative pl-6 group">
                                    {/* Timeline Dot */}
                                    <span className={`
                       absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white
                       ${log.status === 'allowed' ? 'bg-green-500' : 'bg-red-500'}
                     `}></span>

                                    <div className="flex flex-col">
                                        <span className="text-xs text-neutral-400 font-mono mb-1">
                                            {log.timestamp.toLocaleDateString()} • {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <p className="text-sm text-neutral-800">
                                            <span className="font-bold">{log.accessor}</span> {log.status === 'denied' ? 'attempted to view' : log.action.toLowerCase()} <span className="text-indigo-600 font-medium">{log.resource}</span>
                                        </p>
                                        {log.status === 'denied' && (
                                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full w-fit">
                                                <XCircle className="h-3 w-3" /> Access Denied
                                            </span>
                                        )}
                                        {log.status === 'allowed' && (
                                            <span className="mt-1 text-[10px] text-green-600">Authorized by you</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
                        <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4" />
                            Privacy Insight
                        </h3>
                        <p className="text-xs text-indigo-800 leading-relaxed">
                            You have granted full medical history access to 2 providers. Review permissions regularly to ensure data security.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PatientAccessControl;
