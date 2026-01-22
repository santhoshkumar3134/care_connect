
export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nalamId?: string; // Unique Health ID
  specialty?: string; // For doctors
}

export interface HealthRecord {
  id: string;
  title: string;
  type: 'LAB' | 'PRESCRIPTION' | 'SCAN' | 'VISIT_NOTE';
  date: string;
  doctorName: string;
  summary?: string;
  fileUrl?: string;
  fileType?: string; // MIME type of the attached file
}

export interface Appointment {
  id: string;
  doctorId?: string; // For updates
  doctorName: string;
  patientName?: string;
  date: string;
  time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' | 'RESCHEDULED';
  type: 'VIDEO' | 'IN_PERSON' | 'PHONE';
  reason?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  feedback_date?: string;
}

export interface HealthMetric {
  date: string;
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PredictionResult {
  condition: string;
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  explanation: string;
  recommendations: string[];
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  freq: string;
  time: string;
  stock: number;
  refill: string;
}

export interface Notification {
  id: string;
  userId: string;
  fromUserId?: string;
  type: 'APPOINTMENT' | 'MESSAGE' | 'HEALTH_RECORD' | 'SYSTEM';
  title: string;
  content: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  fromUser?: {
    name: string;
    avatar?: string;
  };
}