-- Add RLS Policies for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
    ON public.notifications FOR UPDATE 
    USING (auth.uid() = user_id);

-- Optional: Allow users to delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" 
    ON public.notifications FOR DELETE 
    USING (auth.uid() = user_id);

-- 1. Trigger for New Messages
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- unique logic: don't notify if user is messaging themselves (unlikely but safe)
    IF NEW.sender_id = NEW.receiver_id THEN
        RETURN NEW;
    END IF;

    -- Get sender name
    SELECT name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

    INSERT INTO public.notifications (user_id, from_user_id, type, title, content, is_read)
    VALUES (
        NEW.receiver_id,
        NEW.sender_id,
        'MESSAGE',
        'New Message',
        COALESCE(sender_name, 'Someone') || ' sent you a message.',
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created_notify ON public.messages;
CREATE TRIGGER on_message_created_notify
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_message_notification();


-- 2. Trigger for New Appointments (Notify Doctor)
CREATE OR REPLACE FUNCTION public.handle_new_appointment_notification()
RETURNS TRIGGER AS $$
DECLARE
    patient_name TEXT;
BEGIN
    -- Get patient name
    SELECT name INTO patient_name FROM public.profiles WHERE id = NEW.patient_id;

    -- Notify Doctor
    INSERT INTO public.notifications (user_id, from_user_id, type, title, content, is_read)
    VALUES (
        NEW.doctor_id,
        NEW.patient_id,
        'APPOINTMENT',
        'New Appointment Request',
        COALESCE(patient_name, 'A patient') || ' has requested an appointment.',
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_appointment_created_notify ON public.appointments;
CREATE TRIGGER on_appointment_created_notify
    AFTER INSERT ON public.appointments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_appointment_notification();


-- 3. Trigger for Appointment Status Change (Notify Patient)
CREATE OR REPLACE FUNCTION public.handle_appointment_update_notification()
RETURNS TRIGGER AS $$
DECLARE
    doctor_name TEXT;
BEGIN
    -- Only notify if status changed
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- Get doctor name
    SELECT name INTO doctor_name FROM public.profiles WHERE id = NEW.doctor_id;

    -- Notify Patient
    INSERT INTO public.notifications (user_id, from_user_id, type, title, content, is_read)
    VALUES (
        NEW.patient_id,
        NEW.doctor_id,
        'APPOINTMENT',
        'Appointment Update',
        'Your appointment with ' || COALESCE(doctor_name, 'Doctor') || ' is now ' || NEW.status,
        FALSE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_appointment_updated_notify ON public.appointments;
CREATE TRIGGER on_appointment_updated_notify
    AFTER UPDATE ON public.appointments
    FOR EACH ROW EXECUTE PROCEDURE public.handle_appointment_update_notification();
