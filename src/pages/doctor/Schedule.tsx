import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/ui';
import { Calendar as CalendarIcon, Clock, MapPin, User, ChevronLeft, ChevronRight, MoreVertical, Video, Phone, MessageSquare } from 'lucide-react';
import { useDoctorStore } from '../../store/doctorStore';

const DoctorSchedule: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filter, setFilter] = useState('All');

    const {
        appointments,
        isLoading,
        fetchDoctorAppointments,
        subscribeToAppointments,
        unsubscribeFromAppointments
    } = useDoctorStore();

    useEffect(() => {
        fetchDoctorAppointments();
        subscribeToAppointments();
        return () => unsubscribeFromAppointments();
    }, []);

    const handleMessage = (patient: any) => { // Using any for now to handle the object/string transition if needed
        navigate('/doctor/chat', { state: { selectedPatientName: patient.name, selectedPatientId: patient.id } });
    };

    const handleViewProfile = (patient: any) => {
        navigate('/doctor/patients', { state: { searchTerm: patient.name, patientId: patient.id } });
    };

    const filters = ['All', 'Upcoming', 'Completed', 'Pending'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'info';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'error';
            case 'NO_SHOW': return 'warning';
            default: return 'neutral';
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'All') return true;
        return apt.status === filter.toUpperCase();
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Schedule & Appointments</h1>
                    <p className="text-neutral-500">Manage your daily appointments and availability</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">Sync Calendar</Button>
                    <Button icon={CalendarIcon}>New Appointment</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Side */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Date Navigation */}
                    <Card className="flex items-center justify-between p-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-gray-900">
                                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </h2>
                            <p className="text-sm text-gray-500">Today</p>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </Card>

                    {/* Timeline View */}
                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500">Loading appointments...</div>
                        ) : filteredAppointments.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">No appointments found.</div>
                        ) : (
                            filteredAppointments.map((apt) => (
                                <Card key={apt.id} className="relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-primary">
                                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                                        <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-gray-100 pr-4">
                                            <span className="text-lg font-bold text-gray-900">{apt.time.split(' ')[0]}</span>
                                            <span className="text-xs text-gray-500 uppercase">{apt.time.split(' ')[1]}</span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{apt.patient?.name || 'Unknown Patient'}</h3>
                                                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{apt.type}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span>30 min</span>
                                                    </p>
                                                </div>
                                                <Badge>{apt.status}</Badge>
                                            </div>
                                            <div className="flex items-center gap-2 mt-4">
                                                {apt.type === 'VIDEO' && (
                                                    <Button size="sm" variant="outline" icon={Video} onClick={() => alert('Video consultation starting...')}>Join Call</Button>
                                                )}
                                                <Button size="sm" variant="ghost" icon={User} onClick={() => handleViewProfile(apt.patient)}>View Profile</Button>
                                                <Button size="sm" variant="ghost" icon={MessageSquare} onClick={() => handleMessage(apt.patient)}>Message</Button>
                                            </div>
                                        </div>
                                        <button className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card title="Quick Stats">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
                                <p className="text-xs text-blue-600 font-medium">Appointments</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-green-600">{appointments.filter(a => a.status === 'COMPLETED').length}</p>
                                <p className="text-xs text-green-600 font-medium">Completed</p>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-orange-600">{appointments.filter(a => a.status === 'SCHEDULED').length}</p>
                                <p className="text-xs text-orange-600 font-medium">Pending</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-xl text-center">
                                <p className="text-2xl font-bold text-purple-600">4.9</p>
                                <p className="text-xs text-purple-600 font-medium">Rating</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg">Upcoming Break</h3>
                            <p className="text-indigo-100 text-sm">Lunch break starts in 1 hour</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                            <Clock className="h-5 w-5" />
                            <span className="font-mono">1:00 PM - 2:00 PM</span>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DoctorSchedule;
