import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  PieChart, Pie, Cell, BarChart, Bar, RadialBarChart, RadialBar, Legend
} from 'recharts';
import {
  Activity, Calendar, FileText, MessageSquare, Plus, Search,
  Upload, User, Shield, AlertTriangle, CheckCircle, CheckCircle2, Bell, ChevronRight, ChevronDown,
  Video, MapPin, Clock, MoreHorizontal, Heart, Scale, Droplets, ArrowRight, Pill, Stethoscope, Thermometer,
  Mail, Phone, Map, Edit2, Lock, Eye, Trash2, Coffee, Utensils, Zap, X, Save, Camera, CreditCard, AlertCircle, Star,
  Users, ClipboardList, TrendingUp, Settings, Send, Mic, Paperclip, PhoneCall, Video as VideoIcon, Info, Download, Share2, Fingerprint, Database,
  Siren, Microscope, Brain, RefreshCw
} from 'lucide-react';
import { useAuthStore, useDataStore } from '../store/store';
import { supabase } from '../supabaseClient';
import { Button, Card, Badge, Input, Skeleton } from '../components/ui';
import { getHealthChatResponse, predictDiseaseRisk } from '../services/geminiService';
import { ChatMessage, PredictionResult, HealthRecord, Appointment, Medication } from '../types';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// ... (imports remain)

// Doctor Feedback Modal
const DoctorFeedbackModal: React.FC<{ isOpen: boolean; onClose: () => void; appointment: any; onUpdate: () => void }> = ({ isOpen, onClose, appointment, onUpdate }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setRating(appointment.rating || 0);
      setFeedback(appointment.feedback || '');
    }
  }, [appointment, isOpen]);

  if (!isOpen || !appointment) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          rating,
          feedback,
          feedback_date: new Date().toISOString()
        })
        .eq('id', appointment.id);

      if (error) throw error;

      // Update local store immediately for responsiveness
      await useDataStore.getState().updateAppointment(appointment.id, { rating, feedback });

      if (onUpdate) onUpdate();
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <div>
            <h3 className="font-bold text-neutral-900">{appointment.rating ? 'Edit Review' : 'Rate your visit'}</h3>
            <p className="text-xs text-neutral-500">{appointment.doctorName} • {appointment.date}</p>
          </div>
          <button onClick={onClose}><X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" /></button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className="focus:outline-none transition-transform hover:scale-110 group"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${rating >= s ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200 group-hover:text-yellow-200'}`}
                />
              </button>
            ))}
          </div>
          <div className="text-center text-sm font-semibold text-neutral-600">
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : rating === 5 ? 'Excellent' : 'Select a rating'}
          </div>
          <textarea
            className="w-full border border-neutral-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-neutral-400"
            rows={3}
            placeholder="Share your experience (optional)..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
          />
          <Button className="w-full" onClick={handleSubmit} isLoading={loading} disabled={rating === 0}>
            {appointment.rating ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Record Upload/Edit Modal
const RecordUploadModal: React.FC<{ isOpen: boolean; onClose: () => void; onUpload: (data: any) => Promise<void>; defaultDoctor?: string; initialData?: HealthRecord | null }> = ({ isOpen, onClose, onUpload, defaultDoctor, initialData }) => {
  const [formData, setFormData] = useState<{
    title: string;
    type: string;
    date: string;
    doctorName: string;
    summary: string;
    file: File | null;
    fileName: string;
  }>({
    title: '',
    type: 'LAB',
    date: new Date().toISOString().split('T')[0],
    doctorName: defaultDoctor || '',
    summary: '',
    file: null,
    fileName: ''
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        type: initialData.type,
        date: initialData.date,
        doctorName: initialData.doctorName,
        summary: initialData.summary || '',
        file: null,
        fileName: initialData.fileUrl ? 'Attached File' : ''
      });
    } else {
      setFormData({
        title: '',
        type: 'LAB',
        date: new Date().toISOString().split('T')[0],
        doctorName: defaultDoctor || '',
        summary: '',
        file: null,
        fileName: ''
      });
    }
  }, [initialData, defaultDoctor, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0], fileName: e.target.files[0].name });
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    await onUpload(formData);
    setUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <h3 className="font-bold text-neutral-900">{initialData ? 'Edit Health Record' : 'Upload Health Record'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Input label="Record Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Blood Test Results" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Record Type</label>
            <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
              <option value="LAB">Lab Result</option>
              <option value="PRESCRIPTION">Prescription</option>
              <option value="SCAN">Scan/Imaging</option>
              <option value="VISIT_NOTE">Visit Summary</option>
            </select>
          </div>
          <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          <Input label="Doctor/Provider Name" value={formData.doctorName} onChange={e => setFormData({ ...formData, doctorName: e.target.value })} placeholder="Dr. Smith" />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Attachment</label>
            <div className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${formData.fileName ? 'border-primary bg-blue-50' : 'border-neutral-300 hover:bg-neutral-50'}`} onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
              {formData.fileName ? (
                <div className="flex items-center justify-center gap-2 text-primary font-medium"><FileText className="h-5 w-5" /><span className="truncate max-w-[200px]">{formData.fileName}</span></div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-neutral-400"><Upload className="h-8 w-8 mb-1" /><p className="text-sm">Click to upload file</p></div>
              )}
            </div>
          </div>
          <div><label className="block text-sm font-medium text-neutral-700 mb-1">Summary/Notes</label><textarea className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" rows={3} value={formData.summary} onChange={e => setFormData({ ...formData, summary: e.target.value })} /></div>
          <Button className="w-full" onClick={handleSubmit} disabled={!formData.title || !formData.doctorName || uploading} isLoading={uploading}>{initialData ? 'Update Record' : 'Upload Record'}</Button>
        </div>
      </div>
    </div>
  );
};

const RecordPreviewModal: React.FC<{ record: HealthRecord | null; onClose: () => void; onDownload: (r: HealthRecord) => void }> = ({ record, onClose, onDownload }) => {
  if (!record) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-in" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <h3 className="font-bold text-neutral-900">Record Details</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div><h2 className="text-xl font-bold text-neutral-900 mb-1">{record.title}</h2><div className="flex items-center gap-2 text-sm text-neutral-500"><Calendar className="h-3.5 w-3.5" />{record.date}</div></div>
            <div className={`p-2.5 rounded-xl shadow-sm bg-blue-100 text-blue-600`}><Activity className="h-6 w-6" /></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-neutral-200 text-neutral-500 shadow-sm"><User className="h-5 w-5" /></div>
            <div><p className="text-xs font-bold text-neutral-400 uppercase">Doctor / Provider</p><p className="font-medium text-neutral-900">{record.doctorName}</p></div>
          </div>
          {/* Image Preview for Scans */}
          {record.fileUrl && record.fileType?.startsWith('image/') && (
            <div className="rounded-xl overflow-hidden border border-neutral-200">
              <img
                src={record.fileUrl}
                alt={record.title}
                className="w-full max-h-96 object-contain bg-neutral-50"
                onError={(e) => {
                  console.error('Image failed to load:', record.fileUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {record.fileUrl && !record.fileType?.startsWith('image/') && (
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
              <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm"><Paperclip className="h-5 w-5" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-blue-900">Attachment Available</p><p className="text-xs text-blue-600">Click download to view</p></div>
            </div>
          )}
          <div><p className="text-xs font-bold text-neutral-500 uppercase mb-2">Summary / Notes</p><div className="text-sm text-neutral-700 leading-relaxed bg-white border border-neutral-200 p-4 rounded-xl max-h-40 overflow-y-auto shadow-inner">{record.summary || "No detailed summary available."}</div></div>
          <div className="pt-2 flex gap-3"><Button variant="outline" className="flex-1" onClick={onClose}>Close</Button><Button className="flex-1" icon={Download} onClick={() => onDownload(record)}>Download</Button></div>
        </div>
      </div>
    </div>
  );
};

// Feedback Modal Component
const FeedbackModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void; appointment: any; initialFeedback?: any }> = ({ isOpen, onClose, onSubmit, appointment, initialFeedback }) => {
  const [rating, setRating] = useState(initialFeedback?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback?.feedback || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFeedback?.categories || []);
  const [wouldRecommend, setWouldRecommend] = useState(initialFeedback?.wouldRecommend ?? true);

  const categories = [
    { id: 'professional', label: 'Professional', icon: '👔' },
    { id: 'knowledgeable', label: 'Knowledgeable', icon: '🧠' },
    { id: 'caring', label: 'Caring', icon: '❤️' },
    { id: 'punctual', label: 'Punctual', icon: '⏰' },
    { id: 'thorough', label: 'Thorough', icon: '🔍' },
    { id: 'good-listener', label: 'Good Listener', icon: '👂' }
  ];

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    onSubmit({
      rating,
      feedback,
      categories: selectedCategories,
      wouldRecommend
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Rate Your Visit</h2>
              <p className="text-blue-100 text-sm">Share your experience with {appointment?.doctorName}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              How would you rate your experience? <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-10 w-10 ${star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-neutral-300'
                      }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-neutral-600">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Needs Improvement'}
              </p>
            )}
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              What did you appreciate? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${selectedCategories.includes(category.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                >
                  <span className="text-lg mr-2">{category.icon}</span>
                  <span className="text-sm font-medium">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Share your experience
            </label>
            <textarea
              placeholder="Tell us about your visit, what went well, and any suggestions for improvement..."
              rows={4}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
            <p className="text-xs text-neutral-500 mt-1">{feedback.length}/500 characters</p>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={wouldRecommend}
                onChange={e => setWouldRecommend(e.target.checked)}
                className="mt-1 h-4 w-4 text-primary rounded focus:ring-2 focus:ring-primary/20"
              />
              <div>
                <p className="font-semibold text-sm text-neutral-900">
                  I would recommend {appointment?.doctorName} to others
                </p>
                <p className="text-xs text-neutral-600 mt-1">
                  Help other patients find great healthcare providers
                </p>
              </div>
            </label>
          </div>

          {/* Info */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-neutral-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600">
              <p className="font-semibold mb-1">Your feedback matters</p>
              <p>Your review will be shared anonymously and helps improve healthcare quality.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 p-6 rounded-b-2xl flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" icon={Send}>
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

const CancelModal: React.FC<{ isOpen: boolean; appointment: any; reason: string; onReasonChange: (r: string) => void; onClose: () => void; onConfirm: () => void }> = ({ isOpen, appointment, reason, onReasonChange, onClose, onConfirm }) => {
  if (!isOpen || !appointment) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Cancel Appointment?</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p><strong>Doctor:</strong> {appointment.doctorName}</p>
              <p><strong>Date:</strong> {appointment.date} at {appointment.time}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Reason for Cancellation *</label>
            <textarea className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none" rows={4} placeholder="E.g., Scheduling conflict..." value={reason} onChange={(e) => onReasonChange(e.target.value)} autoFocus />
            <p className="text-xs text-neutral-500 mt-1">💡 This helps your doctor</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Keep Appointment</Button>
            <Button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={!reason.trim()}>Confirm Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BookAppointmentModal: React.FC<{ isOpen: boolean; onClose: () => void; onBook: (data: any) => void; initialData?: any }> = ({ isOpen, onClose, onBook, initialData }) => {
  const [formData, setFormData] = useState({
    doctorId: initialData?.doctor_id || '',
    doctorName: initialData?.doctorName || '',
    specialty: initialData?.specialty || 'General Practice',
    date: initialData?.date || '',
    time: initialData?.time || '',
    type: initialData?.type || 'IN_PERSON',
    reason: initialData?.reason || '',
    notes: initialData?.notes || ''
  });

  const [rescheduleReason, setRescheduleReason] = useState('');
  const [doctors, setDoctors] = useState<Array<{ name: string; specialty: string; id: string }>>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]); // Track booked times

  // Fetch real doctors from database
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, specialization, role')
          .eq('role', 'DOCTOR')
          .order('name');

        if (error) throw error;

        const doctorList = data?.map(doc => ({
          id: doc.id,
          name: doc.name,
          specialty: doc.specialization || 'General Practice'
        })) || [];

        setDoctors(doctorList);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Fetch blocked/booked slots
  useEffect(() => {
    const fetchBookedSlots = async () => {
      // If no doctor or date selected, don't fetch
      if (!formData.doctorId || !formData.date) {
        setBookedSlots([]);
        return;
      }

      // Check for overlapping appointments
      let query = supabase
        .from('appointments')
        .select('time')
        .eq('doctor_id', formData.doctorId)
        .eq('date', formData.date)
        .neq('status', 'CANCELLED')
        .neq('status', 'NO_SHOW'); // Cancelled/NoShow slots are free

      // If updating (rescheduling), current appointment shouldn't block itself
      if (initialData?.id) {
        query = query.neq('id', initialData.id);
      }

      const { data } = await query;

      if (data) {
        setBookedSlots(data.map(item => item.time));
      }
    };

    fetchBookedSlots();
  }, [formData.doctorId, formData.date, initialData]);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
  ];

  const handleSubmit = () => {
    if (!formData.doctorName || !formData.date || !formData.time) {
      alert('Please fill in all required fields');
      return;
    }

    const appointmentData = {
      doctorId: formData.doctorId, // Pass doctorId directly
      doctorName: formData.doctorName,
      specialty: formData.specialty,
      date: formData.date,
      time: formData.time,
      type: formData.type,
      reason: formData.reason,
      notes: formData.notes,
      rescheduleReason: initialData ? rescheduleReason : undefined,
      isRescheduled: initialData ? true : false,
      status: initialData ? 'RESCHEDULED' : 'SCHEDULED' // update status if rescheduled
    };

    onBook(appointmentData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                {initialData?.id ? 'Reschedule Appointment' : 'Book New Appointment'}
                {initialData?.id && <span className="bg-amber-400 text-amber-900 text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">UPDATING</span>}
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                {initialData?.id ? 'Change date, time, or doctor. Original reason preserved.' : 'Schedule a consultation with our specialists'}
              </p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Select Doctor <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={formData.doctorName}
              onChange={e => {
                const doctor = doctors.find(d => d.name === e.target.value);
                setFormData({
                  ...formData,
                  doctorName: e.target.value,
                  specialty: doctor?.specialty || '',
                  doctorId: doctor?.id || '' // Set doctorId
                });
              }}
              disabled={loadingDoctors}
            >
              <option value="">{loadingDoctors ? 'Loading doctors...' : 'Choose a doctor...'}</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.name}>
                  {doc.name} - {doc.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'IN_PERSON' })}
                className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'IN_PERSON'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300'
                  }`}
              >
                <Stethoscope className={`h-6 w-6 mx-auto mb-2 ${formData.type === 'IN_PERSON' ? 'text-primary' : 'text-neutral-400'}`} />
                <p className="font-semibold text-sm">In-Person Visit</p>
                <p className="text-xs text-neutral-500 mt-1">Visit clinic</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'VIDEO' })}
                className={`p-4 rounded-lg border-2 transition-all ${formData.type === 'VIDEO'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300'
                  }`}
              >
                <VideoIcon className={`h-6 w-6 mx-auto mb-2 ${formData.type === 'VIDEO' ? 'text-primary' : 'text-neutral-400'}`} />
                <p className="font-semibold text-sm">Video Call</p>
                <p className="text-xs text-neutral-500 mt-1">Online consultation</p>
              </button>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-neutral-700">
                Time <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
              >
                <option value="">Select time...</option>
                {timeSlots.map(slot => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={bookedSlots.includes(slot)}
                    className={bookedSlots.includes(slot) ? 'text-red-300 bg-neutral-100' : ''}
                  >
                    {slot} {bookedSlots.includes(slot) ? '(Booked)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reason for Visit (Editable) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Fever, Checkup, Consultation"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
            />
          </div>

          {/* Reschedule Explanation (Only if rescheduling) */}
          {initialData && (
            <div className="space-y-2 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
              <label className="block text-sm font-semibold text-neutral-900">
                Reason for Rescheduling
              </label>
              <input
                type="text"
                placeholder="e.g., Time conflict, Not feeling well..."
                className="w-full mt-2 rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-200"
                value={rescheduleReason}
                onChange={e => setRescheduleReason(e.target.value)}
              />
              <p className="text-xs text-neutral-500 mt-1">Optional: Provide a reason for changing the appointment.</p>
            </div>
          )}

          {/* Additional Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700">
              Additional Notes{!initialData && ' (Optional)'}
            </label>
            <textarea
              placeholder="Any symptoms, concerns, or information the doctor should know..."
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Appointment Confirmation</p>
              <p className="text-blue-700">You will receive a confirmation email and SMS once your appointment is confirmed by the clinic.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 p-6 rounded-b-2xl flex gap-3 z-10">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" icon={Calendar}>
            {initialData?.id ? 'Update Appointment' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const AddMedicationModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (data: any) => Promise<void>; initialData?: Medication | null }> = ({ isOpen, onClose, onAdd, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    freq: 'Once daily',
    time: '08:00 AM',
    stock: 30,
    refill: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        dosage: initialData.dosage,
        freq: initialData.freq,
        time: initialData.time,
        stock: initialData.stock,
        refill: initialData.refill
      });
    } else {
      setFormData({
        name: '',
        dosage: '',
        freq: 'Once daily',
        time: '08:00 AM',
        stock: 30,
        refill: new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name || !formData.dosage) {
      alert('Please fill in required fields');
      return;
    }
    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save medication');
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert 12h "08:00 AM" -> 24h "08:00" for input value
  const to24Hour = (time12: string) => {
    if (!time12 || !time12.includes(' ')) return '';
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Helper to convert 24h "13:00" -> 12h "01:00 PM" for storage
  const to12Hour = (time24: string) => {
    if (!time24) return '';
    let [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12.toString().padStart(2, '0')}:${minutes} ${suffix}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <h3 className="font-bold text-neutral-900">{initialData ? 'Edit Medication' : 'Add Medication'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Input label="Medication Name" placeholder="e.g. Lisinopril" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Dosage" placeholder="e.g. 10mg" value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Frequency</label>
              <select
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={formData.freq}
                onChange={e => setFormData({ ...formData, freq: e.target.value })}
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>As needed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Time</label>
              <input
                type="time"
                className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                value={to24Hour(formData.time)}
                onChange={e => setFormData({ ...formData, time: to12Hour(e.target.value) })}
              />
            </div>
            <Input label="Current Stock" type="number" value={formData.stock.toString()} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
          </div>

          <Input label="Refill Date" type="date" value={formData.refill} onChange={e => setFormData({ ...formData, refill: e.target.value })} />

          <Button className="w-full" onClick={handleSubmit} isLoading={loading}>
            {initialData ? 'Update Medication' : 'Add Current Medication'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Grant Access Modal
const GrantAccessModal: React.FC<{ isOpen: boolean; onClose: () => void; onGrant: (providerId: string) => Promise<void> }> = ({ isOpen, onClose, onGrant }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchDoctors = async () => {
        setLoading(true);
        const { data } = await supabase.from('profiles').select('*').eq('role', 'DOCTOR');
        setDoctors(data || []);
        setLoading(false);
      };
      fetchDoctors();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    await onGrant(selectedId);
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slide-in">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
          <h3 className="font-bold text-neutral-900">Grant Access</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-neutral-400 hover:text-neutral-600" /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-neutral-600">Select a doctor to grant them read-only access to your health records.</p>

          {loading ? (
            <div className="py-8 text-center text-neutral-500">Loading doctors...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {doctors.map(doc => (
                <label key={doc.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedId === doc.id ? 'border-primary bg-primary/5' : 'border-neutral-100 hover:border-neutral-200'}`}>
                  <input
                    type="radio"
                    name="doctor"
                    className="h-4 w-4 text-primary"
                    checked={selectedId === doc.id}
                    onChange={() => setSelectedId(doc.id)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">{doc.name}</p>
                    <p className="text-xs text-neutral-500">{doc.specialization || 'General Practice'}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          <Button className="w-full" onClick={handleSubmit} isLoading={submitting} disabled={!selectedId}>
            Grant Access
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- DOCTOR VIEWS ---

// Doctor Routes are now handled in separate files in src/pages/doctor/
// This ensures strict separation of concerns and prevents code duplication.

// --- PATIENT COMPONENTS ---

export const PatientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>(); // Get patient ID from URL if in doctor view
  const { fetchData, isLoading } = useDataStore(); // Get isLoading to prevent premature rendering
  const navigate = useNavigate();

  // Strict Data Fetching Logic:
  // 1. If ID is present (Doctor viewing Patient), fetch THAT patient's data.
  // 2. If ID is missing (Patient viewing self), fetch OWN data.
  // 3. Reset store on unmount to prevent data bleeding.
  useEffect(() => {
    const loadData = async () => {
      // If we have an ID (Doctor view), use it. Otherwise undefined (Patient view).
      await fetchData(id);
    };
    loadData();

    // Cleanup: when leaving this specific record view, we might want to clear?
    // Actually, global reset on logout is safer. But ensuring we fetch specific ID is key.
  }, [id, fetchData]);

  const quickActions = [
    {
      title: 'Upload Report',
      desc: 'Add new lab results or medical documents',
      icon: Upload,
      color: 'bg-blue-600',
      path: '/patient/records'
    },
    {
      title: 'Book Appointment',
      desc: 'Schedule a visit with your doctor',
      icon: Calendar,
      color: 'bg-emerald-500',
      path: '/patient/appointments'
    },
    {
      title: 'AI Health Chat',
      desc: 'Get instant health guidance 24/7',
      icon: MessageSquare,
      color: 'bg-cyan-500',
      path: '/patient/chatbot'
    },
    {
      title: 'Health Predictions',
      desc: 'View your AI risk assessments',
      icon: Activity,
      color: 'bg-orange-500',
      path: '/patient/prediction'
    },
  ];

  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Chen',
      specialty: 'Cardiologist',
      date: 'Jan 15, 2026',
      time: '10:00 AM',
      type: 'Video',
      initials: 'SC',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      doctor: 'Dr. Michael Park',
      specialty: 'General Physician',
      date: 'Jan 18, 2026',
      time: '2:30 PM',
      type: 'In-Person',
      initials: 'MP',
      color: 'bg-emerald-100 text-emerald-600'
    }
  ];

  const activities = [
    { title: 'Lab Report Uploaded', desc: 'Complete Blood Count (CBC) results ...', time: '2h ago', icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { title: 'Appointment Confirmed', desc: 'Video call with Dr. Sarah Chen', time: '5h ago', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
    { title: 'Access Request', desc: 'Dr. James Wilson requested access t...', time: '1d ago', icon: Shield, color: 'bg-orange-100 text-orange-600' },
    { title: 'Health Check Complete', desc: 'Weekly vitals logged successfully', time: '2d ago', icon: CheckCircle, color: 'bg-green-100 text-green-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* Preview Banner */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 text-white p-2 rounded-lg">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-neutral-900">Try Our New Dashboard Design! ✨</p>
            <p className="text-xs text-neutral-600">Experience a modern, health-focused layout</p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/patient/dashboard-preview')}
          className="bg-gradient-to-r from-cyan-500 to-blue-600"
        >
          Preview New Design
        </Button>
      </div>

      {/* Welcome Area with ID */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Hello, {user?.name}</h1>
          <p className="text-sm text-neutral-500 flex items-center gap-1.5 mt-1">
            <Fingerprint className="h-4 w-4 text-primary" />
            <span className="font-mono text-neutral-600 font-medium">Nalam ID: {user?.nalamId}</span>
          </p>
        </div>
        <Button icon={Plus} size="sm" onClick={() => navigate('/patient/records')}>Log Vital Metrics</Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => (
          <div
            key={idx}
            onClick={() => navigate(action.path)}
            className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 cursor-pointer hover:shadow-md transition-all group flex flex-col justify-between h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${action.color} text-white shadow-sm`}>
                <action.icon className="h-6 w-6" />
              </div>
              <ChevronRight className="h-5 w-5 text-neutral-300 group-hover:text-neutral-500 transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">{action.title}</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-lg font-semibold text-neutral-900">Upcoming Appointments</h2>
            <button onClick={() => navigate('/patient/appointments')} className="text-sm text-primary font-medium hover:underline flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex flex-col sm:flex-row gap-5">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-sm ${apt.color} shrink-0`}>
                  {apt.initials}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{apt.doctor}</h3>
                      <p className="text-sm text-neutral-500">{apt.specialty}</p>
                    </div>
                    <Badge variant="info">Upcoming</Badge>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm text-neutral-600">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-1.5 text-neutral-400" /> {apt.date}</div>
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-1.5 text-neutral-400" /> {apt.time}</div>
                    <div className="flex items-center">
                      {apt.type === 'Video' ? <Video className="h-4 w-4 mr-1.5 text-neutral-400" /> : <MapPin className="h-4 w-4 mr-1.5 text-neutral-400" />}
                      {apt.type}
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 mt-4 pt-4 flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate('/patient/appointments')}
                    >
                      Reschedule
                    </Button>
                    {apt.type === 'Video' && (
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open('https://meet.google.com/new', '_blank')}
                      >
                        Join Call
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Activity</h2>
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-2">
            {activities.map((item, i) => (
              <div key={i} className="flex gap-4 p-4 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer border-b border-neutral-50 last:border-0">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 truncate">{item.title}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">{item.desc}</p>
                </div>
                <span className="text-xs text-neutral-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Analytics ---
export const PatientAnalytics: React.FC = () => {
  const chartData = [
    { date: 'Jan 1', bp: 118, hr: 68, sugar: 92, weight: 74.2 },
    { date: 'Jan 3', bp: 122, hr: 73, sugar: 94, weight: 73.9 },
    { date: 'Jan 5', bp: 120, hr: 70, sugar: 90, weight: 73.8 },
    { date: 'Jan 7', bp: 125, hr: 76, sugar: 98, weight: 73.5 },
    { date: 'Jan 9', bp: 119, hr: 72, sugar: 91, weight: 73.3 },
    { date: 'Jan 11', bp: 121, hr: 69, sugar: 95, weight: 73.0 },
    { date: 'Jan 13', bp: 120, hr: 72, sugar: 96, weight: 72.8 },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-neutral-900">Health Analytics</h1>
        <p className="text-neutral-500">Track your health trends and insights over time</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Heart className="h-5 w-5" /></div>
            <span className="text-xs font-medium text-neutral-400">Avg Heart Rate</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-neutral-900">71</span>
            <span className="text-sm text-neutral-500">bpm</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <Badge variant="success">Normal</Badge>
            <span className="text-xs font-medium text-neutral-400">— 0%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Activity className="h-5 w-5" /></div>
            <span className="text-xs font-medium text-neutral-400">Avg Blood Pressure</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-neutral-900">120/79</span>
            <span className="text-sm text-neutral-500">mmHg</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <Badge variant="success">Normal</Badge>
            <span className="text-xs font-medium text-green-600">↘ -3%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Droplets className="h-5 w-5" /></div>
            <span className="text-xs font-medium text-neutral-400">Avg Blood Sugar</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-neutral-900">95</span>
            <span className="text-sm text-neutral-500">mg/dL</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <Badge variant="warning">Elevated</Badge>
            <span className="text-xs font-medium text-orange-600">↗ +2%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Scale className="h-5 w-5" /></div>
            <span className="text-xs font-medium text-neutral-400">Current Weight</span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-bold text-neutral-900">72.5</span>
            <span className="text-sm text-neutral-500">kg</span>
          </div>
          <div className="flex justify-between items-center mt-3">
            <Badge variant="success">Normal</Badge>
            <span className="text-xs font-medium text-green-600">↘ -1.7kg</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Blood Pressure Trend">
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[60, 140]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="bp" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorBp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Heart Rate Trend">
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[60, 85]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="hr" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Blood Sugar Levels">
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[80, 160]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="sugar" stroke="#F97316" strokeWidth={2} fillOpacity={1} fill="url(#colorSugar)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Weight Progress">
          <div className="w-full" style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[70, 76]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} dot={{ r: 4, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Chatbot & Messaging ---
export const PatientChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { text: "I have a headache", icon: Thermometer },
    { text: "Chest discomfort", icon: Activity },
    { text: "Medication info", icon: Pill },
    { text: "Book appointment", icon: Calendar },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await getHealthChatResponse(messages, input);

    const botMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden animate-fade-in">
      <div className="px-6 py-4 border-b border-neutral-100 bg-white flex justify-between items-center">
        <div>
          <h3 className="font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> AI Health Assistant
          </h3>
          <p className="text-xs text-green-600 flex items-center mt-1 font-medium"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span> Online</p>
        </div>
        <Button variant="ghost" size="sm" icon={Info}></Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-neutral-50/50">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-6 text-primary">
              <Stethoscope className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Hello! I'm your CareConnect Health Assistant.</h3>
            <p className="text-neutral-500 max-w-md mb-8">I can help you with symptom analysis, medication information, and general health questions.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {quickPrompts.map((p, i) => (
                <button key={i} onClick={() => { setInput(p.text); }} className="flex items-center px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:border-primary hover:text-primary transition-colors shadow-sm">
                  <p.icon className="h-4 w-4 mr-2" /> {p.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
            {msg.role === 'model' && (
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0 mr-3 mt-1 shadow-sm bg-gradient-to-tr from-primary to-blue-400">
                <MessageSquare className="h-4 w-4" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none'
              }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className={`text-[10px] mt-1.5 text-right ${msg.role === 'user' ? 'text-blue-100' : 'text-neutral-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="h-8 w-8 bg-gradient-to-tr from-primary to-blue-400 rounded-full flex items-center justify-center text-white shrink-0 mr-3 mt-1">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="bg-white border border-neutral-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-neutral-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a health question..."
            className="flex-1 pl-5 pr-12 py-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-neutral-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-orange-500 bg-orange-50 py-1.5 px-3 rounded-full w-fit mx-auto">
          <AlertTriangle className="h-3 w-3" />
          AI info is for reference only. Consult a doctor for medical advice.
        </div>
      </div>
    </div>
  );
};

// --- Profile ---
export const PatientProfile: React.FC = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    weight: '75',
    height: '178',
    phone: '+1 (555) 123-4567',
    location: 'New York, USA',
    insuranceProvider: 'BlueCross BlueShield',
    policyNumber: 'XC-8839201',
    expiryDate: '12/2026',
    allergies: 'Penicillin, Peanuts',
    conditions: 'Hypertension',
    primaryPhysician: 'Dr. Sarah Chen'
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-8">
      <div className="flex items-center gap-6 mb-2">
        <div className="relative group cursor-pointer" onClick={handleTriggerUpload}>
          <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md overflow-hidden ${!profileImage ? 'bg-primary text-white' : ''}`}>
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white h-8 w-8" />
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{user?.name}</h1>
          <p className="text-neutral-500 font-mono text-sm tracking-tight bg-neutral-100 px-2 py-0.5 rounded-md inline-block mt-1">
            Nalam ID: {user?.nalamId}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant="info">{user?.role === 'DOCTOR' ? 'Certified Specialist' : 'Premium Member'}</Badge>
            <Badge variant="success">Verified</Badge>
          </div>
        </div>
        <div className="ml-auto">
          <Button
            variant={isEditing ? 'primary' : 'outline'}
            size="sm"
            icon={isEditing ? Save : Edit2}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Medical Snapshot */}
        <div className="space-y-6">
          {user?.role === 'PATIENT' && (
            <Card title="Medical Identity">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Blood Type</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-xs">O+</div>
                    <span className="text-sm font-medium">Positive</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Allergies</p>
                  {isEditing ? (
                    <Input value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} />
                  ) : (
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                      <p className="text-sm font-medium text-neutral-900">{formData.allergies}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Chronic Conditions</p>
                  {isEditing ? (
                    <Input value={formData.conditions} onChange={e => setFormData({ ...formData, conditions: e.target.value })} />
                  ) : (
                    <div className="flex items-start gap-2">
                      <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm font-medium text-neutral-900">{formData.conditions}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {user?.role === 'DOCTOR' && (
            <Card title="Professional Info">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Specialty</p>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs"><Stethoscope className="h-4 w-4" /></div>
                    <span className="text-sm font-medium">Cardiology</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">License Number</p>
                  <p className="text-sm font-mono font-medium text-neutral-900">MD-NY-882910</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">Years of Experience</p>
                  <p className="text-sm font-medium text-neutral-900">12 Years</p>
                </div>
              </div>
            </Card>
          )}

          {user?.role === 'PATIENT' && (
            <Card title="Insurance Info">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="h-24 w-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <CreditCard className="h-6 w-6 opacity-80" />
                    <span className="text-xs font-mono opacity-70">HEALTH INSURANCE</span>
                  </div>
                  <p className="text-xs text-blue-200 mb-1">Provider</p>
                  <h4 className="font-bold text-lg mb-4">{formData.insuranceProvider}</h4>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-blue-200 mb-0.5">Policy Number</p>
                      <p className="font-mono text-sm tracking-wider">{formData.policyNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-200 mb-0.5">Expires</p>
                      <p className="font-mono text-sm">{formData.expiryDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              {isEditing && (
                <div className="mt-4 space-y-2">
                  <Input label="Provider" value={formData.insuranceProvider} onChange={e => setFormData({ ...formData, insuranceProvider: e.target.value })} />
                  <Input label="Policy #" value={formData.policyNumber} onChange={e => setFormData({ ...formData, policyNumber: e.target.value })} />
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right Column - Personal & Contact */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Personal Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Full Name</label>
                <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
              </div>
              {user?.role === 'PATIENT' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Date of Birth</label>
                    <p className="text-sm font-semibold text-neutral-900">12 Sep, 1985</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Gender</label>
                    <p className="text-sm font-semibold text-neutral-900">Male</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Primary Physician</label>
                    {isEditing ? (
                      <Input value={formData.primaryPhysician} onChange={e => setFormData({ ...formData, primaryPhysician: e.target.value })} />
                    ) : (
                      <p className="text-sm font-semibold text-neutral-900 flex items-center gap-1">
                        <Stethoscope className="h-3 w-3 text-primary" /> {formData.primaryPhysician}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Height</label>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm"
                        />
                        <span className="text-sm text-neutral-500">cm</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-neutral-900">{formData.height} cm</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Weight</label>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="w-20 rounded border border-neutral-300 px-2 py-1 text-sm"
                        />
                        <span className="text-sm text-neutral-500">kg</span>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-neutral-900">{formData.weight} kg</p>
                    )}
                  </div>
                </>
              )}

              {user?.role === 'DOCTOR' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Hospital Affiliation</label>
                    <p className="text-sm font-semibold text-neutral-900">City General Hospital</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-500 mb-1">Department</label>
                    <p className="text-sm font-semibold text-neutral-900">Cardiology</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card title="Contact Details">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden w-full">
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="w-full">
                  <p className="text-xs text-neutral-500">Phone</p>
                  {isEditing ? (
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded border border-neutral-300 px-2 py-1 text-sm mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                  <Map className="h-4 w-4" />
                </div>
                <div className="w-full">
                  <p className="text-xs text-neutral-500">Location</p>
                  {isEditing ? (
                    <input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full rounded border border-neutral-300 px-2 py-1 text-sm mt-1"
                    />
                  ) : (
                    <p className="text-sm font-medium">{formData.location}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {user?.role === 'PATIENT' && (
            <Card title="Emergency Contact">
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-red-700">Jane Doe</h4>
                  <p className="text-xs text-red-500">Spouse</p>
                </div>
                <div className="flex items-center gap-2 text-red-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-red-100 cursor-pointer hover:bg-red-50 transition-colors">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">+1 (555) 987-6543</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Patient Records ---
export const PatientHealthRecords: React.FC = () => {
  const { records, addRecord, fetchData, subscribeToHealthRecords, unsubscribeFromHealthRecords } = useDataStore();
  const [filter, setFilter] = useState('ALL');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewRecord, setPreviewRecord] = useState<any>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'LAB' as const,
    file: null as File | null,
  });

  useEffect(() => {
    fetchData();
    subscribeToHealthRecords();
    return () => unsubscribeFromHealthRecords();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUploadData({ ...uploadData, file: e.target.files[0] });
    }
  };

  const handleDownloadRecord = async (record: any) => {
    // If there's a file URL, download the actual file
    if (record.fileUrl) {
      try {
        // Determine file extension from file type or URL
        // Note: Using direct URL download instead of fetch to avoid CORS issues
        let extension = 'file';
        if (record.fileType) {
          // Extract extension from MIME type (e.g., 'image/jpeg' -> 'jpg')
          const mimeExtension = record.fileType.split('/')[1];
          extension = mimeExtension === 'jpeg' ? 'jpg' : mimeExtension;
        } else if (record.fileUrl) {
          // Try to extract from URL
          const urlParts = record.fileUrl.split('.');
          if (urlParts.length > 1) {
            extension = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params
          }
        }

        // Create download link using direct URL (avoids CORS issues)
        const a = document.createElement('a');
        a.href = record.fileUrl;
        a.download = `${record.title.replace(/[^a-z0-9]/gi, '_')}_${record.date}.${extension}`;
        a.target = '_blank'; // Fallback to open in new tab if download attribute doesn't work
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file. Please try again.');
      }
    } else {
      // If no file, create a text summary as fallback
      const recordText = `
                              HEALTH RECORD
=============

Title: ${record.title}
Type: ${record.type}
Date: ${new Date(record.date).toLocaleDateString()}
Doctor: ${record.doctorName}

Summary:
${record.summary}

---
Generated by CareConnect Health Portal
Downloaded on: ${new Date().toLocaleString()}
      `.trim();

      const blob = new Blob([recordText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.title.replace(/[^a-z0-9]/gi, '_')}_${record.date}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadAll = () => {
    const allRecordsText = `
HEALTH RECORDS EXPORT
=====================

Total Records: ${filteredRecords.length}
Export Date: ${new Date().toLocaleString()}
Filter: ${filter === 'ALL' ? 'All Types' : filter}

${filteredRecords.map((record, index) => `
-----------------------------------
RECORD ${index + 1}
-----------------------------------

Title: ${record.title}
Type: ${record.type}
Date: ${new Date(record.date).toLocaleDateString()}
Doctor: ${record.doctorName}

Summary:
${record.summary}

`).join('\n')}

---
Generated by CareConnect Health Portal
    `.trim();

    const blob = new Blob([allRecordsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health_records_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    console.log('=== UPLOAD BUTTON CLICKED ===');
    console.log('Title:', uploadData.title);
    console.log('File:', uploadData.file?.name);

    if (!uploadData.title.trim()) {
      alert('Please enter a record title');
      return;
    }
    if (!uploadData.file) {
      alert('Please select a file to upload');
      return;
    }

    console.log('Validation passed, starting upload...');
    setUploading(true);

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate meaningful summary based on record type
      const getSummary = (type: string, title: string) => {
        switch (type) {
          case 'LAB':
            return `Lab test results for ${title}. Review attached report for detailed findings.`;
          case 'SCAN':
            return `Medical imaging scan: ${title}. View attached image for full details.`;
          case 'VISIT_NOTE':
            return `Visit documentation for ${title}. Contains examination notes and observations.`;
          default:
            return `Medical record: ${title}`;
        }
      };

      const newRecord = {
        title: uploadData.title,
        type: uploadData.type as any,
        date: new Date().toISOString().split('T')[0],
        doctorName: 'Self-Uploaded',
        summary: getSummary(uploadData.type, uploadData.title)
      };

      console.log('Calling addRecord...');
      await addRecord(newRecord, uploadData.file);
      console.log('Upload completed');

      alert('✓ Record uploaded successfully!');
      setUploadData({ title: '', type: 'LAB', file: null });
      setShowUploadModal(false);
      await fetchData();

    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Failed to upload: ' + (err?.message || 'Check console for details'));
    } finally {
      setUploading(false);
    }
  };

  const filteredRecords = filter === 'ALL' ? records : records.filter(r => r.type === filter);

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Health Records</h1>
          <p className="text-neutral-500">Access and manage your medical history</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            icon={Download}
            onClick={handleDownloadAll}
            disabled={filteredRecords.length === 0}
          >
            Download All ({filteredRecords.length})
          </Button>
          <Button icon={Upload} onClick={() => setShowUploadModal(true)}>Upload Record</Button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            // Only close if clicking on the overlay itself, not the modal
            if (e.target === e.currentTarget) {
              setShowUploadModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Upload Health Record</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Record Title</label>
                <Input
                  placeholder="e.g., Blood Test Report"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Record Type</label>
                <select
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={uploadData.type}
                  onChange={(e) => setUploadData({ ...uploadData, type: e.target.value as any })}
                >
                  <option value="LAB">Lab Report</option>
                  <option value="SCAN">Medical Scan / X-Ray</option>
                  <option value="VISIT_NOTE">Visit Note / Document</option>
                </select>
                <p className="text-xs text-neutral-500 mt-1">💡 Prescriptions are added by your doctor</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Select File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full"
                />
                {uploadData.file && <p className="text-xs text-green-600 mt-1">✓ {uploadData.file.name}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">Cancel</Button>
                <Button
                  onClick={handleUpload}
                  isLoading={uploading}
                  disabled={!uploadData.title.trim() || !uploadData.file}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['ALL', 'LAB', 'PRESCRIPTION', 'SCAN', 'VISIT_NOTE'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === type ? 'bg-primary text-white' : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'}`}
          >
            {type === 'ALL' ? 'All Records' : type.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map(record => (
            <div
              key={record.id}
              className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
              onClick={() => setPreviewRecord(record)}
            >
              <div className="flex justify-between items-start mb-4">
                {/* Fixed: Only show image preview if file type is actually an image */}
                {(record as any).file_url && (record as any).file_type?.startsWith('image/') ? (
                  <div className="w-full h-48 rounded-lg overflow-hidden bg-neutral-100">
                    <img
                      src={(record as any).file_url}
                      alt={record.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg ${record.type === 'LAB' ? 'bg-blue-100 text-blue-600' :
                    record.type === 'PRESCRIPTION' ? 'bg-green-100 text-green-600' :
                      record.type === 'SCAN' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    {record.type === 'LAB' ? <Activity className="h-6 w-6" /> :
                      record.type === 'PRESCRIPTION' ? <Pill className="h-6 w-6" /> :
                        record.type === 'SCAN' ? <FileText className="h-6 w-6" /> : <ClipboardList className="h-6 w-6" />}
                  </div>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadRecord(record);
                    }}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewRecord(record);
                    }}
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-bold text-neutral-900 mb-1">{record.title}</h3>


              <p className="text-sm text-neutral-500 mb-3">{record.summary}</p>
              <div className="flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3">
                <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" /> {record.date}</span>
                <span className="flex items-center"><User className="h-3 w-3 mr-1" /> {record.doctorName}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">No Records Found</h3>
            <p className="text-neutral-500">Start uploading your health records to see them here</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setPreviewRecord(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary to-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${previewRecord.type === 'LAB' ? 'bg-blue-500' :
                      previewRecord.type === 'PRESCRIPTION' ? 'bg-green-500' :
                        previewRecord.type === 'SCAN' ? 'bg-purple-500' : 'bg-orange-500'
                      }`}>
                      {previewRecord.type === 'LAB' ? <Activity className="h-5 w-5" /> :
                        previewRecord.type === 'PRESCRIPTION' ? <Pill className="h-5 w-5" /> :
                          previewRecord.type === 'SCAN' ? <FileText className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{previewRecord.title}</h2>
                      <p className="text-blue-100 text-sm">{previewRecord.type}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setPreviewRecord(null)} className="text-white/80 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-600 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase">Date</span>
                  </div>
                  <p className="text-neutral-900 font-semibold">{new Date(previewRecord.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-neutral-600 mb-1">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase">Doctor</span>
                  </div>
                  <p className="text-neutral-900 font-semibold">{previewRecord.doctorName}</p>
                </div>
              </div>

              {/* Medical Document Image Preview */}
              {(previewRecord.type === 'SCAN' || previewRecord.type === 'LAB') && (previewRecord as any).file_url && (previewRecord as any).file_type?.startsWith('image/') && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Medical Document
                  </h3>
                  <div className="rounded-lg overflow-hidden border border-neutral-200 bg-white">
                    <img
                      src={(previewRecord as any).file_url}
                      alt={previewRecord.title}
                      className="w-full h-auto object-contain max-h-96"
                      onError={(e) => {
                        console.error('Image failed to load in modal:', previewRecord.fileUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Summary
                </h3>
                <div className="bg-neutral-50 p-4 rounded-lg">
                  <p className="text-neutral-700 leading-relaxed">{previewRecord.summary}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Medical Record</p>
                  <p className="text-blue-700">This is an official medical record. Keep it secure and share only with authorized healthcare providers.</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-neutral-50 border-t border-neutral-200 p-6 rounded-b-2xl flex gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewRecord(null)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={() => {
                  handleDownloadRecord(previewRecord);
                }}
                className="flex-1"
              >
                Download
              </Button>
              <Button
                icon={Share2}
                onClick={() => alert('Share functionality - would open share options')}
                className="flex-1"
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Patient Prediction ---
export const PatientPrediction: React.FC = () => {
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
      // Pass inputs to Gemini service
      const data = await predictDiseaseRisk(inputs);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">AI Health Prediction</h1>
        <p className="text-neutral-500">Advanced risk assessment using Gemini models</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card title="Health Metrics">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Age" type="number" value={inputs.age} onChange={e => setInputs({ ...inputs, age: e.target.value })} />
              <div className="w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                <select className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" value={inputs.gender} onChange={e => setInputs({ ...inputs, gender: e.target.value })}>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <Input label="Height (cm)" type="number" value={inputs.height} onChange={e => setInputs({ ...inputs, height: e.target.value })} />
              <Input label="Weight (kg)" type="number" value={inputs.weight} onChange={e => setInputs({ ...inputs, weight: e.target.value })} />
              <Input label="Systolic BP" type="number" value={inputs.systolicBP} onChange={e => setInputs({ ...inputs, systolicBP: e.target.value })} />
              <Input label="Diastolic BP" type="number" value={inputs.diastolicBP} onChange={e => setInputs({ ...inputs, diastolicBP: e.target.value })} />
              <Input label="Total Cholesterol" type="number" value={inputs.cholesterol} onChange={e => setInputs({ ...inputs, cholesterol: e.target.value })} />
              <Input label="Activity Level" value={inputs.activityLevel} onChange={e => setInputs({ ...inputs, activityLevel: e.target.value })} />
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={handlePredict} isLoading={loading} icon={Activity}>Generate Prediction</Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {results.length > 0 ? (
            <div className="space-y-4 animate-slide-in">
              {results.map((res, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                  <div className={`p-4 flex justify-between items-center ${res.riskLevel === 'HIGH' ? 'bg-red-50 border-b border-red-100' :
                    res.riskLevel === 'MODERATE' ? 'bg-yellow-50 border-b border-yellow-100' : 'bg-green-50 border-b border-green-100'
                    }`}>
                    <h3 className="font-bold text-neutral-900">{res.condition} Risk Assessment</h3>
                    <Badge variant={res.riskLevel === 'HIGH' ? 'error' : res.riskLevel === 'MODERATE' ? 'warning' : 'success'}>
                      {res.riskLevel} RISK ({res.riskScore}%)
                    </Badge>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-neutral-600 mb-4 leading-relaxed">{res.explanation}</p>
                    <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Recommended Actions</h4>
                    <ul className="space-y-2">
                      {res.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-neutral-700">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full bg-white rounded-xl border border-neutral-200 border-dashed flex flex-col items-center justify-center p-12 text-center text-neutral-400">
              <Activity className="h-16 w-16 mb-4 opacity-20" />
              <h3 className="font-semibold text-neutral-900 mb-1">No Predictions Yet</h3>
              <p className="max-w-sm">Enter your health metrics on the left and click "Generate Prediction" to see AI-powered risk assessments.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Patient Appointments ---
export const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const { appointments, records: healthRecords, fetchData, subscribeToAppointments, unsubscribeFromAppointments } = useDataStore();
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; appointment: any; currentFeedback: any }>({
    isOpen: false,
    appointment: null,
    currentFeedback: null
  });
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; appointment: any }>({
    isOpen: false,
    appointment: null
  });
  const [expandedAptId, setExpandedAptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

  useEffect(() => {
    fetchData();
    subscribeToAppointments();
    return () => unsubscribeFromAppointments();
  }, []);

  const handleReschedule = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowBookModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      console.log('Cancelling appointment:', appointmentId, 'Reason:', cancelReason);

      // Soft delete: Update status to CANCELLED
      await useDataStore.getState().updateAppointment(appointmentId, {
        status: 'CANCELLED'
      });

      alert(`✓ Appointment cancelled successfully. Reason: ${cancelReason}`);
      setCancelModal({ isOpen: false, appointment: null });
      setCancelReason('');

      // Refresh data to show updated list
      await fetchData();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  const handleCloseModal = () => {
    setShowBookModal(false);
    setEditingAppointment(null);
  };

  const handleOpenFeedback = (appointment: any) => {
    setFeedbackModal({
      isOpen: true,
      appointment,
      currentFeedback: null
    });
  };

  const handleRebook = (apt: any) => {
    // Open book modal but pre-fill doctor info (without ID, so it treats as New)
    setEditingAppointment({
      doctorName: apt.doctorName,
      type: apt.type,
      specialty: apt.specialty // Ensure this is available or fetched
    });
    setShowBookModal(true);
  };

  const handleMessage = (doctorName: string) => {
    // Navigate to messages with the doctor's name pre-filled
    navigate('/patient/messages', { state: { searchTerm: doctorName } });
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in pb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Appointments</h1>
            <p className="text-neutral-500">Manage your visits and consultations</p>
          </div>
          <Button icon={Plus} onClick={() => setShowBookModal(true)}>Book New</Button>
        </div>

        {/* Tabs for Filtering */}
        <div className="flex gap-8 border-b border-neutral-200 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'upcoming' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Upcoming
            {activeTab === 'upcoming' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'past' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Past Visits
            {activeTab === 'past' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'cancelled' ? 'text-primary' : 'text-neutral-500 hover:text-neutral-700'}`}
          >
            Cancelled
            {activeTab === 'cancelled' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px]">
          {/* UPCOMING APPOINTMENTS */}
          {activeTab === 'upcoming' && (
            <div className="space-y-4 animate-fade-in">
              {appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED').length > 0 ? (
                appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'RESCHEDULED').map(apt => (
                  <div key={apt.id} className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 w-16 rounded-lg shrink-0">
                      <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900">{apt.doctorName}</h4>
                      <p className="text-sm text-neutral-500 mb-2">{apt.type === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit'}</p>
                      <div className="flex items-center text-xs text-neutral-500 gap-3">
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {apt.time}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${apt.status === 'RESCHEDULED'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                          {apt.status === 'RESCHEDULED' ? 'RESCHEDULED' : 'SCHEDULED'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-2">
                      <Button size="sm" className="w-full" icon={MessageSquare} onClick={() => handleMessage(apt.doctorName)}>Message</Button>
                      {apt.type === 'VIDEO' && <Button size="sm" icon={VideoIcon} className="w-full">Join</Button>}
                      <Button size="sm" variant="outline" icon={Edit2} className="w-full" onClick={() => handleReschedule(apt)}>Reschedule</Button>
                      <Button size="sm" variant="outline" icon={Trash2} className="w-full text-red-600 hover:bg-red-50 hover:border-red-300" onClick={(e) => { e.stopPropagation(); setCancelModal({ isOpen: true, appointment: apt }); }}>Cancel</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-neutral-50 p-12 rounded-xl border border-dashed border-neutral-300 text-center">
                  <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-neutral-500">No upcoming appointments</p>
                  <Button className="mt-4" size="sm" onClick={() => setShowBookModal(true)}>Book Your First Appointment</Button>
                </div>
              )}
            </div>
          )}

          {/* PAST APPOINTMENTS */}
          {activeTab === 'past' && (
            <div className="space-y-4 animate-fade-in">
              {appointments.filter(a => new Date(a.date) < new Date() && a.status !== 'CANCELLED').length > 0 ? (
                appointments
                  .filter(a => new Date(a.date) < new Date() && a.status !== 'CANCELLED')
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(apt => (
                    <div key={apt.id} className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <div className="p-5 flex gap-4">
                        <div className="flex flex-col items-center justify-center bg-green-50 text-green-700 w-16 h-16 rounded-lg shrink-0">
                          <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-neutral-900">{apt.doctorName}</h4>
                            <div className="flex gap-2">
                              {apt.rating && (
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full text-xs font-medium text-yellow-700">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {apt.rating}/5
                                </div>
                              )}
                              <Badge variant="success">COMPLETED</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500 mb-2">{apt.type === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit'}</p>

                          {/* Quick Links Badge */}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {healthRecords.filter(r => r.date === apt.date).map(rec => (
                              <span key={rec.id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                                {rec.type === 'PRESCRIPTION' ? <Pill className="h-3 w-3" /> : rec.type === 'LAB' ? <Microscope className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                                {rec.title}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center gap-2">
                          <Button size="sm" variant="outline" icon={RefreshCw} className="w-full" onClick={() => handleRebook(apt)}>Book Again</Button>
                          <Button size="sm" variant="outline" className="w-full" onClick={() => handleOpenFeedback(apt)}>
                            {apt.rating ? 'Edit Review' : 'Rate Visit'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-neutral-500"
                            onClick={() => setExpandedAptId(expandedAptId === apt.id ? null : apt.id)}
                          >
                            {expandedAptId === apt.id ? 'Less Details' : 'View Details'}
                            {expandedAptId === apt.id ? <ChevronDown className="h-4 w-4 ml-1 rotate-180 transition-transform" /> : <ChevronDown className="h-4 w-4 ml-1 transition-transform" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedAptId === apt.id && (
                        <div className="bg-neutral-50 px-5 py-4 border-t border-neutral-200 text-sm animate-slide-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h5 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-neutral-500" /> Clinical Notes
                              </h5>
                              <p className="text-neutral-600 bg-white p-3 rounded border border-neutral-200">
                                {apt.notes || 'No clinical notes available.'}
                              </p>
                            </div>
                            <div>
                              <h5 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
                                <Star className="h-4 w-4 text-neutral-500" /> Your Review
                              </h5>
                              {apt.rating ? (
                                <div className="bg-white p-3 rounded border border-neutral-200">
                                  <div className="flex items-center gap-1 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`h-3 w-3 ${i < apt.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-200'}`} />
                                    ))}
                                  </div>
                                  <p className="text-neutral-600 italic">"{apt.feedback || 'No written feedback'}"</p>
                                </div>
                              ) : (
                                <div className="text-neutral-500 italic p-2">
                                  You haven't rated this visit yet.
                                  <button onClick={() => handleOpenFeedback(apt)} className="text-primary hover:underline ml-1">Rate now</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 bg-neutral-50 rounded-xl border border-dashed border-neutral-300">
                  <p className="text-neutral-500">No past appointments found.</p>
                </div>
              )}
            </div>
          )}

          {/* CANCELLED APPOINTMENTS */}
          {activeTab === 'cancelled' && (
            <div className="space-y-4 animate-fade-in">
              {appointments.filter(a => a.status === 'CANCELLED').length > 0 ? (
                appointments.filter(a => a.status === 'CANCELLED').map(apt => (
                  <div key={apt.id} className="bg-neutral-50 p-5 rounded-xl border border-neutral-200 flex gap-4 opacity-75 grayscale hover:grayscale-0 transition-all">
                    <div className="flex flex-col items-center justify-center bg-neutral-200 text-neutral-500 w-16 rounded-lg shrink-0">
                      <span className="text-xs font-bold uppercase">{new Date(apt.date).toLocaleString('default', { month: 'short' })}</span>
                      <span className="text-xl font-bold">{new Date(apt.date).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-700 line-through decoration-red-500 decoration-2">{apt.doctorName}</h4>
                        <Badge variant="error" className="text-[10px] px-1.5 py-0 h-5">CANCELLED</Badge>
                      </div>
                      <p className="text-sm text-neutral-500 mb-2">{apt.type === 'VIDEO' ? 'Video Consultation' : 'In-Person Visit'}</p>
                      <div className="flex items-center text-xs text-neutral-500 gap-3">
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {apt.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button size="sm" variant="ghost" className="text-neutral-400" disabled>Inactivie</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-500">No cancelled appointments.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Book/Reschedule Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={handleCloseModal}
        onBook={useDataStore.getState().addAppointment}
        initialData={editingAppointment}
      />

      {/* Feedback Modal */}
      <DoctorFeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, appointment: null, currentFeedback: null })}
        appointment={feedbackModal.appointment}
        onUpdate={fetchData}
      />
      <CancelModal isOpen={cancelModal.isOpen} appointment={cancelModal.appointment} reason={cancelReason} onReasonChange={setCancelReason} onClose={() => { setCancelModal({ isOpen: false, appointment: null }); setCancelReason(''); }} onConfirm={() => handleCancelAppointment(cancelModal.appointment?.id)} />
    </>
  );
};

// --- Patient Nutrition ---
export const PatientNutrition: React.FC = () => {
  const data = [
    { name: 'Mon', calories: 2100 },
    { name: 'Tue', calories: 1850 },
    { name: 'Wed', calories: 2300 },
    { name: 'Thu', calories: 1950 },
    { name: 'Fri', calories: 2000 },
    { name: 'Sat', calories: 2400 },
    { name: 'Sun', calories: 2200 },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-neutral-900">Nutrition Tracker</h1>
        <p className="text-neutral-500">Monitor your daily intake and macros</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Calorie Intake (Last 7 Days)">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="calories" stroke="#10B981" fillOpacity={1} fill="url(#colorCal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Carbs</p>
                <p className="text-2xl font-bold text-neutral-900">245g</p>
                <p className="text-xs text-neutral-500">Goal: 275g</p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-500 flex items-center justify-center text-xs font-bold text-orange-700">89%</div>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Protein</p>
                <p className="text-2xl font-bold text-neutral-900">128g</p>
                <p className="text-xs text-neutral-500">Goal: 140g</p>
              </div>
              <div className="h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-500 flex items-center justify-center text-xs font-bold text-blue-700">91%</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Today's Meals">
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-3 border-b border-neutral-100">
                <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Coffee className="h-4 w-4" /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-neutral-900">Breakfast</h4>
                  <p className="text-xs text-neutral-500">Oatmeal with berries, Coffee</p>
                </div>
                <span className="text-xs font-medium text-neutral-600">450 kcal</span>
              </div>
              <div className="flex items-start gap-3 pb-3 border-b border-neutral-100">
                <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Utensils className="h-4 w-4" /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-neutral-900">Lunch</h4>
                  <p className="text-xs text-neutral-500">Grilled Chicken Salad</p>
                </div>
                <span className="text-xs font-medium text-neutral-600">620 kcal</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Utensils className="h-4 w-4" /></div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-neutral-900">Snack</h4>
                  <p className="text-xs text-neutral-500">Greek Yogurt, Almonds</p>
                </div>
                <span className="text-xs font-medium text-neutral-600">210 kcal</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm" icon={Plus}>Log Meal</Button>
          </Card>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1">AI Meal Planner</h3>
              <p className="text-green-100 text-sm mb-3">Get personalized recipes based on your health goals.</p>
              <Button size="sm" className="bg-white text-green-700 hover:bg-green-50 border-none w-full">Generate Plan</Button>
            </div>
            <Utensils className="absolute -bottom-4 -right-4 h-24 w-24 text-white opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Patient Access Control ---
export const PatientAccessControl: React.FC = () => {
  const { accessGrants, fetchAccessGrants, grantAccess, revokeAccess, subscribeToAccessGrants, unsubscribeFromAccessGrants } = useDataStore();
  const [showGrantModal, setShowGrantModal] = useState(false);

  useEffect(() => {
    fetchAccessGrants();
    subscribeToAccessGrants();
    return () => unsubscribeFromAccessGrants();
  }, [fetchAccessGrants, subscribeToAccessGrants, unsubscribeFromAccessGrants]);

  const handleGrant = async (providerId: string) => {
    try {
      await grantAccess(providerId);
      // Toast handled by UI update or we could add local toast here
    } catch (error) {
      console.error("Values failed to update", error);
      alert("Failed to grant access");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Data Privacy & Access</h1>
            <p className="text-neutral-500">Control who can view your medical records</p>
          </div>
          <Button size="sm" icon={Plus} onClick={() => setShowGrantModal(true)}>Grant Access</Button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-neutral-100">
          {accessGrants.length === 0 ? (
            <div className="py-8 text-center text-neutral-500">
              <Shield className="h-12 w-12 mx-auto text-neutral-200 mb-2" />
              <p>No active access grants.</p>
              <p className="text-xs">Grant access to a doctor to let them view your records.</p>
            </div>
          ) : (
            accessGrants.map(grant => (
              <div key={grant.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center">
                    {grant.provider?.role === 'Emergency Dept' ? <Shield className="h-5 w-5 text-neutral-500" /> : <Stethoscope className="h-5 w-5 text-neutral-500" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{grant.provider?.name || 'Unknown Provider'}</h4>
                    <p className="text-xs text-neutral-500">{grant.provider?.specialization || grant.provider?.role || 'Healthcare Provider'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-medium text-neutral-400">Status</p>
                    <p className={`text-sm font-bold ${grant.status === 'GRANTED' ? 'text-green-600' : 'text-red-500'}`}>{grant.status}</p>
                  </div>
                  <button
                    onClick={() => revokeAccess(grant.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${grant.status === 'GRANTED' ? 'bg-primary' : 'bg-neutral-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${grant.status === 'GRANTED' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <button onClick={() => {
                    if (confirm('Are you sure you want to permanently remove this grant?')) {
                      // We don't have delete in store yet, maybe just revoke?
                      // For now treating "Revoke" button as the main toggle.
                      revokeAccess(grant.id);
                    }
                  }} className="text-neutral-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-blue-800">HIPAA Compliant Sharing</h4>
          <p className="text-xs text-blue-600 mt-1">All data sharing is logged and encrypted. You can revoke access at any time. Emergency access is granted for 24 hours during critical situations.</p>
        </div>
      </div>

      <GrantAccessModal
        isOpen={showGrantModal}
        onClose={() => setShowGrantModal(false)}
        onGrant={handleGrant}
      />
    </div>
  );
};

// --- Patient Medications ---
// --- Patient Medications ---
export const PatientMedications: React.FC = () => {
  const { medications, medicationLogs, subscribeToMedications, unsubscribeFromMedications, addMedication, deleteMedication, fetchData, logMedication, fetchMedicationLogs } = useDataStore();
  const [showModal, setShowModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'info' } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Real-time subscription & Initial Fetch
  useEffect(() => {
    fetchData(); // Fetch initial data
    fetchMedicationLogs(); // Fetch initial medication logs
    subscribeToMedications();
    return () => {
      unsubscribeFromMedications();
    };
  }, [fetchData, fetchMedicationLogs, subscribeToMedications, unsubscribeFromMedications]);

  // Request notification permission and set up timer
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const alertedReminders = useRef(new Set<string>()); // Track alerted keys to prevent spam

  // Check for due medications every 10 seconds
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      // Ensure strict format "08:00 AM"
      const currentTimeFormatted = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      const normalizeTime = (t: string) => {
        if (!t) return '';
        let [timePart, period] = t.trim().split(' ');
        if (!timePart || !period) return t; // fallback
        let [h, m] = timePart.split(':');
        if (h.length === 1) h = '0' + h;
        return `${h}:${m} ${period}`;
      };

      const currentNormalized = normalizeTime(currentTimeFormatted);

      medications.forEach(med => {
        if (!med.time) return;
        const times = med.time.split(',').map((t: string) => normalizeTime(t));

        if (times.includes(currentNormalized)) {
          // Check if already taken TODAY
          const today = now.toISOString().split('T')[0];
          const logKey = `${med.id}-${currentNormalized}-${today}`;

          const isTaken = medicationLogs.some((log: any) =>
            log.medication_id === med.id &&
            log.schedule_time === currentNormalized && // checking exact slot might be tricky if user logged early, but for reminder purposes, we check strict slot
            log.log_date === today
          );

          // If not taken AND not yet alerted for this specific slot
          if (!isTaken && !alertedReminders.current.has(logKey)) {
            console.log(`Triggering alert for ${med.name} at ${currentNormalized}`);

            // 1. Browser Notification
            if (Notification.permission === 'granted') {
              new Notification(`Medication Reminder: ${med.name}`, {
                body: `It's time to take your ${med.dosage} of ${med.name}.`,
                icon: '/vite.svg'
              });
            }

            // 2. In-App Toast
            setToast({ msg: `⏰ Time to take ${med.name} (${med.dosage})`, type: 'info' });

            // Mark as alerted
            alertedReminders.current.add(logKey);
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 10000); // Check every 10 seconds
    return () => clearInterval(intervalId);
  }, [medications, medicationLogs]);

  const requestPermission = () => {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification("Notifications Enabled", { body: "You will now receive medication reminders." });
      }
    });
  };

  const testNotification = async () => {
    try {
      if (!('Notification' in window)) {
        alert('This browser does not support desktop notifications');
        return;
      }

      if (Notification.permission === 'granted') {
        new Notification("Test Notification", { body: "This is a test reminder from CareConnect." });
      } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification("Test Notification", { body: "Notifications enabled!" });
        } else {
          alert("Permission denied.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error testing notification.");
    }
  };

  // Calculate adherence rate
  const calculateAdherence = () => {
    // Simplistic calculation based on logs vs total possible doses today
    // For now keeping simple
    if (medications.length === 0) return 100;
    const totalDosesToday = schedule.length;
    const takenDoses = medicationLogs.filter(log => log.log_date === new Date().toISOString().split('T')[0]).length; // Filter logs for today
    return totalDosesToday > 0 ? Math.round((takenDoses / totalDosesToday) * 100) : 100;
  };

  // Get today's schedule
  const getTodaySchedule = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const todayStr = now.toISOString().split('T')[0];

    const normalizeTime = (t: string) => {
      if (!t) return '';
      let [timePart, period] = t.trim().split(' ');
      if (!timePart || !period) return t;
      let [h, m] = timePart.split(':');
      if (h.length === 1) h = '0' + h;
      return `${h}:${m} ${period}`;
    };

    return medications.map(med => {
      if (!med.time) return []; // Skip medications with no time set
      const times = med.time.split(',').map((t: string) => t.trim());
      return times.map((time: string) => {
        const [timeStr, period] = time.split(' ');
        const [hours] = timeStr.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;

        const normalizedTimeSlot = normalizeTime(time);

        // Check log from store
        const taken = medicationLogs.some((log: any) =>
          log.medication_id === med.id &&
          log.schedule_time === normalizedTimeSlot &&
          log.log_date === todayStr
        );

        const isPast = hour < currentHour;
        const isCurrent = hour === currentHour;

        return {
          medication: med,
          time,
          normalizedTimeSlot,
          hour,
          taken,
          isPast,
          isCurrent
        };
      });
    }).flat().sort((a, b) => a.hour - b.hour);
  };

  const handleLogClick = (med: any) => {
    setSelectedMed(med);
    setShowModal(true);
  };

  const handleConfirm = (reminder: boolean) => {
    // Legacy modal handler, keeping for now or simplifying
    setShowModal(false);
  };

  const handleQuickLog = async (medId: string, timeSlot: string) => {
    try {
      await logMedication(medId, timeSlot);
      setToast({ msg: 'Dose logged successfully!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      alert('Failed to log dose. Please try again.');
    }
  };

  const handleAddMedication = async (data: any) => {
    try {
      await addMedication(data);
      setToast({ msg: 'Medication added successfully!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error('Failed to add medication:', error);
      alert('Failed to add medication. Please try again.');
    }
  };

  const handleDeleteMedication = async (id: string) => {
    if (!confirm('Are you sure you want to remove this medication?')) return;
    try {
      await deleteMedication(id);
      setToast({ msg: 'Medication removed.', type: 'info' });
      setTimeout(() => setToast(null), 2000);
    } catch (e) {
      alert('Failed to delete.');
    }
  };

  const schedule = getTodaySchedule();

  // Calculate daily stats
  const takenCount = schedule.filter((s: any) => s.taken).length;
  const missedCount = schedule.filter((s: any) => !s.taken && s.isPast).length;
  const toTakeCount = schedule.filter((s: any) => !s.taken && !s.isPast).length;

  const upcomingRefills = medications.filter((med: any) => {
    const refillDate = new Date(med.refill);
    const daysUntilRefill = Math.ceil((refillDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilRefill <= 7 && daysUntilRefill > 0;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-8 relative">
      {/* Feedback Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg text-white font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}>
            <CheckCircle className="h-5 w-5" />
            {toast.msg}
          </div>
        </div>
      )}

      {/* Log Confirmation Modal */}
      {showModal && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slide-in p-6 text-center">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mb-2">Dose Logged!</h3>
            <p className="text-neutral-500 mb-6">You've successfully logged your dose of <span className="font-semibold text-neutral-900">{selectedMed.name}</span>.</p>

            <div className="bg-blue-50 p-4 rounded-xl mb-6 text-left">
              <p className="text-sm font-bold text-blue-800 mb-1 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Next Dose Reminder
              </p>
              <p className="text-xs text-blue-600">Would you like to be reminded for your next dose?</p>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => handleConfirm(false)}>No Thanks</Button>
              <Button className="flex-1" onClick={() => handleConfirm(true)}>Set Reminder</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Medications</h1>
          <p className="text-neutral-500">Track your medications and stay on schedule</p>
        </div>
        <div className="flex gap-2">
          {Notification.permission !== 'granted' && (
            <Button variant="outline" icon={Bell} onClick={requestPermission}>Enable Alerts</Button>
          )}
          <Button variant="ghost" size="sm" onClick={testNotification}>Test Alert</Button>
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Medication</Button>
        </div>
      </div>

      {/* Daily Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Taken Today */}
        <div className="bg-white border border-green-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg"><CheckCircle className="h-5 w-5" /></div>
              <span className="text-sm font-bold text-green-700 uppercase tracking-wide">Taken Today</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-900">{takenCount}</span>
              <span className="text-sm text-neutral-500">doses</span>
            </div>
          </div>
        </div>

        {/* To Take */}
        <div className="bg-white border border-blue-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="h-16 w-16 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Pill className="h-5 w-5" /></div>
              <span className="text-sm font-bold text-blue-700 uppercase tracking-wide">To Take</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-900">{toTakeCount}</span>
              <span className="text-sm text-neutral-500">remaining</span>
            </div>
          </div>
        </div>

        {/* Missed */}
        <div className="bg-white border border-red-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertCircle className="h-16 w-16 text-red-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
              <span className="text-sm font-bold text-red-700 uppercase tracking-wide">Missed</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-900">{missedCount}</span>
              <span className="text-sm text-neutral-500">doses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Refill Alerts */}
      {upcomingRefills.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">Refills Needed Soon</h3>
              <div className="space-y-2">
                {upcomingRefills.map((med: any) => {
                  const refillDate = new Date(med.refill);
                  const daysUntilRefill = Math.ceil((refillDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={med.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div>
                        <p className="font-semibold text-neutral-900">{med.name}</p>
                        <p className="text-sm text-neutral-600">{med.stock} pills remaining</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-orange-600">{daysUntilRefill} days</p>
                        <Button size="sm" className="mt-1">Request Refill</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Today's Schedule
          </h2>
          <p className="text-sm text-neutral-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="space-y-3">
          {schedule.length > 0 ? schedule.map((item: any, idx: number) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${item.taken
                ? 'bg-green-50 border-green-200'
                : item.isCurrent
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : item.isPast
                    ? 'bg-red-50 border-red-200 opacity-75'
                    : 'bg-neutral-50 border-neutral-200'
                }`}
            >
              <div className={`p-3 rounded-lg ${item.taken ? 'bg-green-500' : item.isCurrent ? 'bg-blue-500' : item.isPast ? 'bg-red-500' : 'bg-neutral-400'
                }`}>
                <Pill className="h-5 w-5 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-neutral-900">{item.medication.name}</h3>
                  {item.medication.prescribed_by ? (
                    <Badge variant="info" className="text-xs py-0 h-5">Rx: {item.medication.prescribed_by_profile?.name || 'Doctor'}</Badge>
                  ) : (
                    <Badge variant="neutral" className="text-xs py-0 h-5">Self-Added</Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-600">{item.medication.dosage} • {item.medication.freq}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-neutral-900">{item.time}</p>
                {item.taken ? (
                  <Badge variant="success" className="mt-1">Taken ✓</Badge>
                ) : item.isPast ? (
                  <Badge variant="danger" className="mt-1">Missed</Badge>
                ) : item.isCurrent ? (
                  <Badge variant="info" className="mt-1">Now</Badge>
                ) : (
                  <Badge variant="neutral" className="mt-1">Upcoming</Badge>
                )}
              </div>

              <div className="flex gap-2 min-w-[100px] justify-end">
                {!item.taken && !item.isPast && (
                  <Button
                    size="sm"
                    onClick={() => handleQuickLog(item.medication.id, item.normalizedTimeSlot)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mark Taken
                  </Button>
                )}
                {item.isPast && !item.taken && (
                  <span className="text-xs font-bold text-red-500 py-2">
                    MISSED
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-neutral-500">
              <Pill className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No medications scheduled for today</p>
            </div>
          )}
        </div>
      </div>

      {/* All Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medications.map((med: any) => (
          <div key={med.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Pill className="h-24 w-24 rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg inline-flex"><Pill className="h-5 w-5" /></div>
                <div className="flex gap-2">
                  {med.stock < 7 && <Badge variant="warning">Low Stock</Badge>}
                  {med.prescribed_by ? (
                    <div title={`Prescribed by ${med.prescribed_by_profile?.name || 'Doctor'}`} className="cursor-help">
                      <Badge variant="info">Rx</Badge>
                    </div>
                  ) : (
                    <Badge variant="neutral">Self</Badge>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-neutral-900">{med.name}</h3>
              <p className="text-sm text-neutral-500 font-medium mb-1">{med.dosage} • {med.freq}</p>
              {med.prescribed_by && (
                <p className="text-xs text-blue-600 mb-3">
                  Prescribed by {med.prescribed_by_profile?.name || 'Doctor'}
                </p>
              )}

              <div className="space-y-2 text-sm text-neutral-600 mb-4 mt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  Next: {med.time ? med.time.split(',')[0] : 'Not Set'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  Refill by: {med.refill}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white hover:bg-neutral-50"
                  onClick={() => handleLogClick(med)}
                >
                  Log Dose
                </Button>

                {!med.prescribed_by && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2"
                    onClick={() => handleDeleteMedication(med.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div
          className="bg-neutral-50 rounded-xl border border-dashed border-neutral-300 flex flex-col items-center justify-center p-6 text-neutral-400 cursor-pointer hover:bg-neutral-100 transition-colors hover:border-neutral-400"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-10 w-10 mb-2 opacity-50" />
          <span className="font-medium text-sm">Add New Prescription</span>
        </div>
      </div>

      {/* Add Medication Modal */}
      <AddMedicationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddMedication}
      />
    </div>
  );
};

export const PatientMessages: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello, your lab results look good. Keep up the healthy diet!', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now().toString(), role: 'user', text: input, timestamp: new Date() }]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden animate-fade-in">
      <div className="w-80 border-r border-neutral-100 p-0 hidden md:flex flex-col">
        <div className="p-4 border-b border-neutral-100">
          <h2 className="font-bold text-lg text-neutral-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 hover:bg-blue-50 cursor-pointer border-l-4 border-primary bg-blue-50/30 transition-colors">
            <div className="flex justify-between mb-1">
              <h4 className="font-bold text-sm text-neutral-900">Dr. Sarah Chen</h4>
              <span className="text-[10px] text-neutral-400">10:30 AM</span>
            </div>
            <p className="text-xs text-neutral-500 truncate">Hello, your lab results look good...</p>
          </div>
          <div className="p-4 hover:bg-neutral-50 cursor-pointer border-l-4 border-transparent transition-colors">
            <div className="flex justify-between mb-1">
              <h4 className="font-medium text-sm text-neutral-700">Dr. Michael Park</h4>
              <span className="text-[10px] text-neutral-400">Yesterday</span>
            </div>
            <p className="text-xs text-neutral-500 truncate">Please schedule a follow-up.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">SC</div>
            <div>
              <h3 className="font-bold text-neutral-900">Dr. Sarah Chen</h3>
              <p className="text-xs text-neutral-500">Cardiologist • Online</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" icon={PhoneCall}></Button>
            <Button size="sm" variant="ghost" icon={VideoIcon}></Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50/30">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'model' && <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-primary mr-2 mt-1">SC</div>}
              <div className={`px-5 py-3 rounded-2xl max-w-[75%] shadow-sm ${m.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-neutral-800 border border-neutral-100 rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white border-t border-neutral-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <Button type="button" variant="ghost" icon={Paperclip}></Button>
            <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message to Dr. Chen..." className="flex-1" />
            <Button type="submit" icon={Send}></Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main Patient Records Shell ---
export const PatientRecords: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Doctor View param
  const isDoctorView = !!id;
  const {
    fetchData,
    fetchAccessGrants, subscribeToAccessGrants, unsubscribeFromAccessGrants,
    subscribeToAppointments, unsubscribeFromAppointments,
    subscribeToHealthRecords, unsubscribeFromHealthRecords,
    subscribeToMedications, unsubscribeFromMedications
  } = useDataStore();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('records');

  useEffect(() => {
    fetchData(id); // Handles both doctor and patient view via store logic

    if (!isDoctorView) {
      // Subscribe to real-time updates only for own data
      subscribeToAppointments();
      subscribeToHealthRecords();
      subscribeToMedications();
      fetchAccessGrants();
      subscribeToAccessGrants();
    }
    return () => {
      if (!isDoctorView) {
        unsubscribeFromAppointments();
        unsubscribeFromHealthRecords();
        unsubscribeFromMedications();
        unsubscribeFromAccessGrants();
      }
    };
  }, [id, fetchData, subscribeToAppointments, subscribeToHealthRecords, subscribeToMedications, fetchAccessGrants, subscribeToAccessGrants]);

  // Tab definitions
  const tabs = [
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  ];

  // Add patient-only tabs (not visible to doctors)
  if (!isDoctorView) {
    tabs.push(
      { id: 'prediction', label: 'AI Prediction', icon: Activity },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'access', label: 'Access Control', icon: Shield }
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isDoctorView && (
        <div className="bg-indigo-600 text-white px-4 py-3 rounded-xl shadow-md flex items-center justify-between animate-slide-in">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <p className="font-bold">Read-Only Mode</p>
          </div>
          <p className="text-sm opacity-90">Viewing Patient Record</p>
        </div>
      )}


      {/* Tabs - Only show for doctor view, patients use sidebar navigation */}
      {isDoctorView && (
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide border-b border-neutral-200 sticky top-0 bg-neutral-50/95 backdrop-blur z-40 pt-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100'
                }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'records' && <PatientHealthRecords />}
        {activeTab === 'appointments' && <PatientAppointments />}
        {activeTab === 'medications' && <PatientMedications />}
        {activeTab === 'nutrition' && <PatientNutrition />}
        {activeTab === 'prediction' && <PatientPrediction />}
        {activeTab === 'messages' && <PatientMessages />}
        {activeTab === 'access' && !isDoctorView && <PatientAccessControl />}
      </div>
    </div>
  );
};
