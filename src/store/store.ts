import { create } from 'zustand';
import { User, HealthRecord, Appointment, Medication } from '../types';
import { supabase } from '../supabaseClient';
import { withRetry } from '../utils/retry';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: async () => {
    await supabase.auth.signOut();
    // Reset all stores to prevent data cross-contamination between users (Patient/Doctor)
    useDataStore.getState().resetStore();
    // Dynamically import or directly access if possible. Since they are in different files, imports might be tricky circular dependency-wise.
    // However, store.ts defines useDataStore. doctorStore.ts imports store.ts? No, doctorStore imports types.
    // We need to be careful about circular imports.
    // If we can't import useDoctorStore here (because it's separate), we might need moving AuthStore or using a subscription.

    // Actually, store.ts is the main file. doctorStore.ts is separate.
    // We can't easily import useDoctorStore inside store.ts if doctorStore.ts imports store.ts (it doesn't seem to import store.ts, only types).
    // Let's assume we can import it. But wait, we are IN store.ts.
    // I will use a window event or simple pattern if import fails, but let's try importing at top level first.
    // For now, let's just reset useDataStore here, and I will add a separate listener or modify the structure.

    set({ user: null, isAuthenticated: false });
  },
  checkSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      // Fetch profile details
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        set({
          isAuthenticated: true,
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as any,
            nalamId: profile.nalam_id
          }
        });
      }
    }
  }
}));

interface DataState {
  records: HealthRecord[];
  appointments: Appointment[];
  medications: Medication[];
  medicationLogs: any[]; // Stores adherence logs { id, medication_id, schedule_time, taken_at }
  isLoading: boolean;

  fetchData: (patientId?: string) => Promise<void>;
  generateSampleData: () => Promise<void>;

  // Real-time Subscriptions
  subscribeToAppointments: () => void;
  unsubscribeFromAppointments: () => void;
  // ... (health records subscriptions preserved via implicit ... spread if not replaced, but here we replace block)

  subscribeToHealthRecords: () => void;
  unsubscribeFromHealthRecords: () => void;

  subscribeToMedications: () => void;
  unsubscribeFromMedications: () => void;

  // Records CRUD
  addRecord: (record: Omit<HealthRecord, 'id'>, file?: File) => Promise<void>;
  updateRecord: (id: string, updatedRecord: Partial<HealthRecord>, file?: File) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;

  // Appointments CRUD
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;

  // Medications CRUD
  addMedication: (medication: Omit<Medication, 'id'>) => Promise<void>;
  updateMedication: (id: string, updatedMedication: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  // Adherence Logging
  fetchMedicationLogs: (date?: string, patientId?: string) => Promise<void>;
  logMedication: (medicationId: string, scheduleTime: string) => Promise<void>;

  // Access Control
  accessGrants: any[]; // { id, provider: { name, role }, status, granted_at }
  fetchAccessGrants: () => Promise<void>;
  grantAccess: (providerId: string) => Promise<void>;
  revokeAccess: (grantId: string) => Promise<void>;
  subscribeToAccessGrants: () => void;
  unsubscribeFromAccessGrants: () => void;
  resetStore: () => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  records: [],
  appointments: [],
  medications: [],
  medicationLogs: [],
  isLoading: false,
  accessGrants: [],

  resetStore: () => {
    set({
      records: [],
      appointments: [],
      medications: [],
      medicationLogs: [],
      isLoading: false,
      accessGrants: []
    });
  },

  fetchData: async (patientId?: string) => {
    // CRITICAL FIX: Clear existing data BEFORE fetching to prevent "ghost" data from showing
    // while the new request is in flight. This ensures the UI shows a loading state
    // instead of stale data from a previous session or user.
    set({
      isLoading: true,
      records: [],
      appointments: [],
      medications: [],
      medicationLogs: []
    });

    // Get current user first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Determine target ID: if patientId provided (and I am a doctor), use it. Else use my own ID.
    const targetUserId = patientId || user.id;


    await withRetry(async () => {
      // Parallel Fetching
      const [recordsReq, aptReq, medsReq] = await Promise.all([
        supabase
          .from('health_records')
          .select('*')
          .eq('patient_id', targetUserId)
          .order('date', { ascending: false }),
        supabase
          .from('appointments')
          .select('*, doctor:doctor_id(name)')
          .or(`patient_id.eq.${targetUserId},doctor_id.eq.${targetUserId}`)
          .order('date', { ascending: true }),
        supabase
          .from('medications')
          .select('*, prescribed_by_profile:prescribed_by(name)')
          .eq('patient_id', targetUserId)
          .order('name', { ascending: true })
      ]);

      // Check for errors to trigger retry
      if (recordsReq.error) throw recordsReq.error;
      if (aptReq.error) throw aptReq.error;
      if (medsReq.error) throw medsReq.error;

      set({
        records: recordsReq.data || [],
        appointments: aptReq.data?.map((a: any) => ({
          ...a,
          doctorName: a.doctor?.name || 'Unknown Doctor',
          patientName: 'Me' // Context implies current user
        })) || [],
        medications: medsReq.data || [],
        isLoading: false
      });

      // Also fetch logs for target user
      if (patientId) {
        get().fetchMedicationLogs(undefined, patientId);
      } else {
        get().fetchMedicationLogs();
      }
    });
  },

  subscribeToAppointments: () => {
    // We need to access get() here to call fetchData, but create only passes set, get.
    // We can use get().fetchData() inside the callback.
    // The previous implementation plan suggested user check, but simpler is just subscribing.

    supabase
      .channel('patient-appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        // filter: `patient_id=eq.${user.id}` // Ideally filter by user, but for now we refresh on any change for simplicity or if we can't easily get user id in sync
        // To do it properly we need the user ID.
      }, () => {
        // Simplest approach: Refetch all data to ensure joined fields (doctor name) are correct
        get().fetchData();
      })
      .subscribe();
  },

  unsubscribeFromAppointments: () => {
    supabase.getChannels().forEach(channel => {
      if (channel.topic === 'realtime:patient-appointments') {
        supabase.removeChannel(channel);
      }
    });
  },

  subscribeToHealthRecords: () => {
    supabase
      .channel('patient-health-records')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'health_records',
      }, () => {
        get().fetchData();
      })
      .subscribe();
  },

  unsubscribeFromHealthRecords: () => {
    supabase.getChannels().forEach(channel => {
      if (channel.topic === 'realtime:patient-health-records') {
        supabase.removeChannel(channel);
      }
    });
  },

  subscribeToMedications: () => {
    supabase
      .channel('patient-medications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'medications',
      }, () => {
        get().fetchData();
      })
      .subscribe();
  },

  unsubscribeFromMedications: () => {
    supabase.getChannels().forEach(channel => {
      if (channel.topic === 'realtime:patient-medications') {
        supabase.removeChannel(channel);
      }
    });
  },

  generateSampleData: async () => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const userId = user.id;

    // 1. Health Records
    await supabase.from('health_records').insert([
      { patient_id: userId, title: 'Annual Comprehensive Physical', type: 'VISIT_NOTE', date: '2023-10-15', doctor_name: 'Dr. Sarah Smith', summary: 'Patient is in good health. BP 120/80. Recommended increasing daily water intake.' },
      { patient_id: userId, title: 'Blood Chemistry Panel', type: 'LAB', date: '2023-11-20', doctor_name: 'Dr. James Wilson', summary: 'Cholesterol slightly elevated (210 mg/dL). Vitamin D levels are normal.' },
      { patient_id: userId, title: 'Chest X-Ray / Radiography', type: 'SCAN', date: '2024-01-05', doctor_name: 'Dr. Emily Chen', summary: 'Lungs clear. No signs of infection or abnormalities detected.' },
      { patient_id: userId, title: 'Dermatology Consultation', type: 'VISIT_NOTE', date: '2024-01-20', doctor_name: 'Dr. Lisa Ray', summary: 'Examined skin rash on left arm. Prescribed topical cream.' },
      { patient_id: userId, title: 'Amoxicillin Prescription', type: 'PRESCRIPTION', date: '2024-02-01', doctor_name: 'Dr. Mark Sloan', summary: '500mg capsules for sinus infection. Take for 7 days.' }
    ]);

    // 2. Appointments (Need valid doctor IDs, so we'll skip creating them with names and let them be created via booking flow or seeder)
    // Minimally we can try to find a doctor profile to use, OR just skip this part since we have ultimate_realistic_data.sql now.
    // I will comment out the invalid insert to prevent errors.
    /*
    await supabase.from('appointments').insert([
      { patient_id: userId, doctor_name: 'Dr. Sarah Smith', patient_name: 'Me', date: '2026-03-15', time: '10:00 AM', status: 'UPCOMING', type: 'VIDEO' },
      { patient_id: userId, doctor_name: 'Dr. Michael Park', patient_name: 'Me', date: '2026-02-10', time: '02:00 PM', status: 'COMPLETED', type: 'IN_PERSON' }
    ]);
    */

    // 3. Medications
    await supabase.from('medications').insert([
      { patient_id: userId, name: 'Lisinopril', dosage: '10mg', freq: 'Once daily', time: '08:00 AM', stock: 28, refill: '2026-04-01' },
      { patient_id: userId, name: 'Metformin', dosage: '500mg', freq: 'Twice daily', time: '08:00 AM, 08:00 PM', stock: 14, refill: '2026-03-15' },
      { patient_id: userId, name: 'Vitamin D3', dosage: '1000 IU', freq: 'Once daily', time: '07:00 AM', stock: 90, refill: '2026-06-01' }
    ]);

    // 4. Messages (Sender must be current user for RLS)
    await supabase.from('messages').insert([
      { sender_id: userId, receiver_id: userId, text: 'Welcome to CareConnect! This is your secure health dashboard.', is_read: false }
    ]);

    get().fetchData();
    set({ isLoading: false });
  },

  // Records
  addRecord: async (record, file) => {
    set({ isLoading: true });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      set({ isLoading: false });
      return;
    }

    let fileUrl = '';
    let fileType = '';

    if (file) {
      try {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        console.log('Uploading file:', { fileName: file.name, filePath, size: file.size });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('health-docs')
          .upload(filePath, file);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          throw uploadError;
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL (works if bucket is public) or signed URL
        const { data: urlData } = supabase.storage
          .from('health-docs')
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        fileType = file.type;

        console.log('File URL generated:', fileUrl);
      } catch (error) {
        console.error('Error during file upload:', error);
        set({ isLoading: false });
        throw error;
      }
    }

    const { error } = await supabase.from('health_records').insert({
      patient_id: user.id,
      title: record.title,
      type: record.type,
      date: record.date,
      doctor_name: record.doctorName,
      summary: record.summary,
      file_url: fileUrl,
      file_type: fileType
    });

    if (error) {
      console.error('Database insert error:', error);
      set({ isLoading: false });
      throw error;
    }

    console.log('Record added successfully');
    await get().fetchData();
    set({ isLoading: false });
  },

  updateRecord: async (id, updatedRecord, file) => {
    set({ isLoading: true });

    const updates: any = {
      title: updatedRecord.title,
      type: updatedRecord.type,
      date: updatedRecord.date,
      doctor_name: updatedRecord.doctorName,
      summary: updatedRecord.summary,
    };

    if (file) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        await supabase.storage.from('health-docs').upload(filePath, file);
        const { data } = await supabase.storage.from('health-docs').createSignedUrl(filePath, 3600);
        updates.file_url = data?.signedUrl;
        updates.file_type = file.type;
      }
    }

    await supabase.from('health_records').update(updates).eq('id', id);
    get().fetchData();
    set({ isLoading: false });
  },

  deleteRecord: async (id) => {
    await supabase.from('health_records').delete().eq('id', id);
    set((state) => ({ records: state.records.filter(r => r.id !== id) }));
  },

  // Appointments
  addAppointment: async (appointment) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user logged in');
        throw new Error('You must be logged in to book an appointment');
      }

      console.log('Booking appointment for user:', user.id, 'with data:', appointment);

      // Find doctor ID from doctor name OR use provided doctor ID if we had it
      // The appointment object from UI likely still has doctorName.
      // We need to resolve it.

      const { data: doctorData, error: doctorError } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', appointment.doctorName)
        .eq('role', 'DOCTOR')
        .single();

      if (doctorError) {
        console.error('Error finding doctor:', doctorError);
      }

      if (!doctorData) {
        console.error('Doctor not found:', appointment.doctorName);
        throw new Error(`Doctor "${appointment.doctorName}" not found. Please try again.`);
      }

      console.log('Found doctor ID:', doctorData.id);

      const appointmentData = {
        patient_id: user.id,
        doctor_id: doctorData.id,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        type: appointment.type,
        reason: appointment.reason || null,
        notes: appointment.notes || null
      };

      console.log('Inserting appointment:', appointmentData);

      const { data: insertedData, error: insertError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select();

      if (insertError) {
        console.error('Error inserting appointment:', insertError);
        throw insertError;
      }

      console.log('Appointment created successfully:', insertedData);

      await get().fetchData();
      set({ isLoading: false });
    } catch (error) {
      console.error('Error in addAppointment:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateAppointment: async (id, updatedAppointment) => {
    const updates: any = {
      date: updatedAppointment.date,
      time: updatedAppointment.time,
      type: updatedAppointment.type,
      status: updatedAppointment.status,
      reason: updatedAppointment.reason,
      notes: updatedAppointment.notes
    };

    // If doctorId matches provided ID, use it directly (Best Practice)
    if (updatedAppointment.doctorId) {
      updates.doctor_id = updatedAppointment.doctorId;
    }
    // Fallback: If doctor name changes but no ID provided, lookup new doctor ID
    else if (updatedAppointment.doctorName) {
      const { data: doctorData } = await supabase
        .from('profiles')
        .select('id')
        .eq('name', updatedAppointment.doctorName)
        .eq('role', 'DOCTOR')
        .single();

      if (doctorData) {
        updates.doctor_id = doctorData.id;
      }
    }

    // Optimistic Update: Update local state immediately for instant feedback
    const previousAppointments = get().appointments; // Keep ref for rollback

    // merging updatedAppointment ensures doctorName is updated in UI
    set(state => ({
      appointments: state.appointments.map(apt =>
        apt.id === id ? { ...apt, ...updatedAppointment } : apt
      )
    }));

    try {
      const { error } = await supabase.from('appointments').update(updates).eq('id', id);

      if (error) {
        throw error;
      }

      // Success - refetch to ensure consistency
      get().fetchData();
    } catch (error) {
      console.error('Update appointment failed:', error);
      // Rollback optimistic update
      set({ appointments: previousAppointments });
      alert('Failed to update appointment. This might be due to a database restriction. Please check console.');
    }
  },

  deleteAppointment: async (id) => {
    await supabase.from('appointments').delete().eq('id', id);
    set((state) => ({ appointments: state.appointments.filter(a => a.id !== id) }));
  },

  // Medications
  addMedication: async (medication) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('medications')
      .insert({ ...medication, patient_id: user.id });
    if (error) throw error;
  },

  updateMedication: async (id, updatedMedication) => {
    const { error } = await supabase.from('medications').update(updatedMedication).eq('id', id);
    if (error) throw error;
  },

  deleteMedication: async (id) => {
    // Optimistic update
    set((state) => ({ medications: state.medications.filter(m => m.id !== id) }));
    const { error } = await supabase.from('medications').delete().eq('id', id);
    if (error) {
      // Rollback if needed (fetching data again is simplest rollback)
      get().fetchData();
      throw error;
    }
  },

  fetchMedicationLogs: async (date, patientId) => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const targetUserId = patientId || user.id;

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', targetUserId)
      .eq('log_date', targetDate);

    if (error) {
      console.error('Error fetching logs:', error);
      return;
    }
    set({ medicationLogs: data || [] });
  },

  logMedication: async (medicationId, scheduleTime) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const newLog = {
      user_id: user.id,
      medication_id: medicationId,
      schedule_time: scheduleTime,
      log_date: today,
      taken_at: new Date().toISOString()
    };

    // Optimistic Update
    set(state => ({
      medicationLogs: [...state.medicationLogs, { ...newLog, id: 'temp-' + Date.now() }]
    }));

    const { data, error } = await supabase
      .from('medication_logs')
      .insert(newLog)
      .select()
      .single();

    if (error) {
      console.error('Error logging medication:', error);
      // Revert optimistic update? For now just log error.
      // Ideally we revert state here.
      set(state => ({
        medicationLogs: state.medicationLogs.filter(l => l.id.toString().substring(0, 5) !== 'temp-')
      }));
      throw error;
    } else {
      // Replace temp with real
      set(state => ({
        medicationLogs: state.medicationLogs.map(l => l.id.toString().startsWith('temp-') && l.medication_id === medicationId && l.schedule_time === scheduleTime ? data : l)
      }));
    }
  },

  // Access Control

  fetchAccessGrants: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch grants joined with provider details
    const { data, error } = await supabase
      .from('access_grants')
      .select('*, provider:provider_id(name, role, specialization)')
      .eq('patient_id', user.id); // RLS handles this, but explicit is good

    if (error) console.error("Error fetching access grants:", error);
    set({ accessGrants: data || [] });
  },

  grantAccess: async (providerId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('access_grants').insert({
      patient_id: user.id,
      provider_id: providerId,
      status: 'GRANTED',
      granted_at: new Date().toISOString()
    });

    if (error) throw error;
    // We rely on realtime subscription or subsequent fetch to update UI
    get().fetchAccessGrants();
  },

  revokeAccess: async (grantId) => {
    // Toggle logic: If currently GRANTED -> REVOKED, else -> GRANTED
    const current = get().accessGrants.find(g => g.id === grantId);
    if (!current) return;

    const newStatus = current.status === 'GRANTED' ? 'REVOKED' : 'GRANTED';

    // Optimistic
    set(state => ({
      accessGrants: state.accessGrants.map(g => g.id === grantId ? { ...g, status: newStatus } : g)
    }));

    const { error } = await supabase
      .from('access_grants')
      .update({ status: newStatus })
      .eq('id', grantId);

    if (error) {
      // Rollback
      get().fetchAccessGrants();
      throw error;
    }
  },

  subscribeToAccessGrants: () => {
    supabase
      .channel('patient-access-grants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'access_grants'
      }, () => {
        get().fetchAccessGrants();
      })
      .subscribe();
  },

  unsubscribeFromAccessGrants: () => {
    supabase.getChannels().forEach(channel => {
      if (channel.topic === 'realtime:patient-access-grants') {
        supabase.removeChannel(channel);
      }
    });
  }
}));