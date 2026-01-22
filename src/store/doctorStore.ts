import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import { Appointment } from '../types';
import { withRetry } from '../utils/retry';

// Extended types for Doctor View
export interface DoctorAppointment extends Appointment {
    patient: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        nalam_id?: string;
        avatar_url?: string;
    };
    doctor?: {
        id: string;
        name: string;
        specialization: string;
    };
}

export interface DoctorPatient {
    id: string; // relationship id
    patient_id: string;
    doctor_id: string;
    start_date: string;
    is_active: boolean;
    patient: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        nalam_id?: string;
        avatar_url?: string;
        date_of_birth?: string;
        gender?: string;
    };
}

interface DoctorState {
    appointments: DoctorAppointment[];
    patients: DoctorPatient[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchDoctorAppointments: () => Promise<void>;
    fetchDoctorPatients: () => Promise<void>;

    // Real-time subscriptions
    subscribeToAppointments: () => void;
    unsubscribeFromAppointments: () => void;
    subscribeToPatientRelationships: () => void;
    unsubscribeFromPatientRelationships: () => void;

    // State updates
    // State updates
    updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
    resetStore: () => void;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
    appointments: [],
    patients: [],
    isLoading: false,
    error: null,

    resetStore: () => {
        set({
            appointments: [],
            patients: [],
            isLoading: false,
            error: null
        });
    },

    fetchDoctorAppointments: async () => {
        // Clear data before fetching to prevent stale state (ghost data)
        set({ isLoading: true, error: null, appointments: [] });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            await withRetry(async () => {
                // Fetch appointments where doctor_id match current user
                const { data, error } = await supabase
                    .from('appointments')
                    .select(`
          *,
          patient:patient_id(id, name, email, phone, nalam_id, avatar_url),
          doctor:doctor_id(id, name, specialization)
        `)
                    .eq('doctor_id', user.id)
                    .order('date', { ascending: true })
                    .order('time', { ascending: true });

                if (error) throw error;

                set({ appointments: data as unknown as DoctorAppointment[] });
            });
        } catch (error: any) {
            console.error('Error fetching doctor appointments:', error);
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    fetchDoctorPatients: async () => {
        // Clear data before fetching to prevent stale state (ghost data)
        set({ isLoading: true, error: null, patients: [] });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            await withRetry(async () => {
                // Fetch access grants first
                const { data: grants, error: grantsError } = await supabase
                    .from('access_grants')
                    .select('*')
                    .eq('provider_id', user.id)
                    .eq('status', 'GRANTED');

                if (grantsError) throw grantsError;

                if (!grants || grants.length === 0) {
                    set({ patients: [] });
                    return;
                }

                // Extract patient IDs
                const patientIds = grants.map(g => g.patient_id);

                // Fetch patient profiles
                const { data: patients, error: patientsError } = await supabase
                    .from('profiles')
                    .select('id, name, email, phone, nalam_id, avatar_url, date_of_birth, gender')
                    .in('id', patientIds);

                if (patientsError) throw patientsError;

                // Merge grants with patient data
                const transformedData = grants.map((grant: any) => {
                    const patient = patients?.find(p => p.id === grant.patient_id);
                    return {
                        id: grant.id,
                        patient_id: grant.patient_id,
                        doctor_id: grant.provider_id,
                        start_date: grant.granted_at,
                        is_active: true,
                        patient: patient || null
                    };
                }).filter(p => p.patient !== null); // Only include if patient data was found

                set({ patients: transformedData as unknown as DoctorPatient[] });
            });
        } catch (error: any) {
            console.error('Error fetching doctor patients:', error);
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },

    subscribeToAppointments: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const channel = supabase
            .channel('doctor-appointments')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'appointments',
                filter: `doctor_id=eq.${user.id}`
            }, (payload) => {
                // Optimistic update or refetch
                // For simplicity, we just refetch to ensure we get the joined data (patient info)
                // In a more complex app, we would optimistally merge payload.new
                get().fetchDoctorAppointments();
            })
            .subscribe();

        // Store channel cleanup if needed, but Zustand stores are usually global
    },

    unsubscribeFromAppointments: () => {
        supabase.getChannels().forEach(channel => {
            if (channel.topic === 'realtime:doctor-appointments') {
                supabase.removeChannel(channel);
            }
        });
    },

    subscribeToPatientRelationships: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        supabase
            .channel('doctor-patients')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'access_grants',
                filter: `provider_id=eq.${user.id}`
            }, () => {
                get().fetchDoctorPatients();
            })
            .subscribe();
    },

    unsubscribeFromPatientRelationships: () => {
        supabase.getChannels().forEach(channel => {
            if (channel.topic === 'realtime:doctor-patients') {
                supabase.removeChannel(channel);
            }
        });
    },

    updateAppointmentStatus: async (id, status) => {
        try {
            // Optimistic update
            set(state => ({
                appointments: state.appointments.map(apt =>
                    apt.id === id ? { ...apt, status } : apt
                )
            }));

            const { error } = await supabase
                .from('appointments')
                .update({ status })
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error updating appointment status:', error);
            // Revert if failed (could implement previous state tracking)
            get().fetchDoctorAppointments();
            set({ error: error.message });
        }
    }
}));
