// Script to create users properly through Supabase API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ekcsjkkewlxemgwnutkj.supabase.co';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY_HERE'; // Get this from Supabase Dashboard → Settings → API

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const users = [
    { email: 'dr.sarah@careconnect.com', password: 'doctor123', name: 'Dr. Sarah Venkat', role: 'DOCTOR' },
    { email: 'santhosh@patient.com', password: 'patient123', name: 'Santhosh Kumar', role: 'PATIENT' },
    { email: 'dr.james@careconnect.com', password: 'doctor123', name: 'Dr. James Wilson', role: 'DOCTOR' },
];

async function createUsers() {
    for (const user of users) {
        console.log(`Creating user: ${user.email}`);

        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: {
                name: user.name,
                role: user.role
            }
        });

        if (error) {
            console.error(`Error creating ${user.email}:`, error.message);
        } else {
            console.log(`✅ Created ${user.email}`);
        }
    }
}

createUsers();
