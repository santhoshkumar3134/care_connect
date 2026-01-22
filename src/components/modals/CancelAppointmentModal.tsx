import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from '../ui';

interface CancelAppointmentModalProps {
    isOpen: boolean;
    appointment: any;
    cancelReason: string;
    onReasonChange: (reason: string) => void;
    onClose: () => void;
    onConfirm: () => void;
}

const CancelAppointmentModal: React.FC<CancelAppointmentModalProps> = ({
    isOpen,
    appointment,
    cancelReason,
    onReasonChange,
    onClose,
    onConfirm
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-neutral-900">Cancel Appointment</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-900">
                            <p><strong>Doctor:</strong> {appointment?.doctorName}</p>
                            <p><strong>Date:</strong> {appointment?.date} at {appointment?.time}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Reason for Cancellation *
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={4}
                            placeholder="E.g., Scheduling conflict, feeling better, etc..."
                            value={cancelReason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            autoFocus
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            💡 This helps your doctor understand your needs
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Keep Appointment
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            disabled={!cancelReason.trim()}
                        >
                            Confirm Cancel
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelAppointmentModal;
