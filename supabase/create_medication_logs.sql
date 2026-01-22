-- Create medication_logs table for tracking adherence
CREATE TABLE IF NOT EXISTS public.medication_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    schedule_time TEXT NOT NULL, -- The time slot taken (e.g., "08:00 AM")
    log_date Date DEFAULT CURRENT_DATE, -- The date this log belongs to
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own medication logs"
    ON public.medication_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs"
    ON public.medication_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs"
    ON public.medication_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs"
    ON public.medication_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_medication_logs_user_date ON public.medication_logs(user_id, log_date);
