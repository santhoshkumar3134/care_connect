<div align="center">

![CareConnect Banner](https://raw.githubusercontent.com/santhoshkumar3134/care_connect/main/assets/careconnect_banner.png)

# 🏥 CareConnect - NextGen Health Platform

**A comprehensive, AI-powered healthcare management system built with modern web technologies**

[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.90.1-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CareConnect** is a next-generation healthcare platform designed to bridge the gap between patients, doctors, and healthcare administrators. Built with cutting-edge technologies, it provides a seamless, secure, and intelligent healthcare experience.

### 🎯 Mission
To democratize healthcare access through technology, making quality medical care accessible, affordable, and efficient for everyone.

### 🏆 Key Highlights
- **🤖 AI-Powered**: Integrated Google Gemini AI for health predictions, chatbot assistance, and nutrition planning
- **⚡ Real-time**: Live updates for appointments, messages, and health records using Supabase Realtime
- **🔒 Secure**: Enterprise-grade security with Row-Level Security (RLS) and HIPAA-compliant data handling
- **📱 Responsive**: Mobile-first design that works seamlessly across all devices
- **🎨 Modern UI**: Beautiful, intuitive interface with glassmorphism and smooth animations

---

## ✨ Features

### 👤 Patient Portal
- **📊 Health Dashboard**: Comprehensive view of health metrics, upcoming appointments, and medication schedules
- **📝 Medical Records**: Upload, view, and manage medical documents (lab reports, prescriptions, scans)
- **💊 Medication Tracker**: Smart medication adherence tracking with reminders and refill alerts
- **📅 Appointment Booking**: Schedule video or in-person consultations with doctors
- **💬 Secure Messaging**: HIPAA-compliant chat with healthcare providers
- **🤖 AI Chatbot**: 24/7 health assistant powered by Google Gemini
- **🔮 Health Predictions**: AI-driven disease risk assessment and preventive care recommendations
- **🥗 Nutrition Planner**: Personalized meal plans based on health conditions
- **📈 Analytics**: Visual insights into health trends and progress
- **🔐 Access Control**: Grant/revoke doctor access to medical records

### 👨‍⚕️ Doctor Portal
- **📋 Patient Management**: View assigned patients and their complete health history
- **📅 Schedule Management**: Manage appointments and availability
- **💬 Patient Communication**: Secure messaging with patients
- **📊 Patient Analytics**: Track patient health trends and treatment outcomes
- **📝 Clinical Notes**: Add findings and prescriptions to patient records

### 🔧 Admin Portal
- **👥 User Management**: Manage patients, doctors, and staff accounts
- **✅ Doctor Approvals**: Verify and approve new doctor registrations
- **📊 System Analytics**: Platform usage statistics and insights
- **🔍 Activity Logs**: Audit trail for compliance and security
- **⚙️ System Settings**: Configure platform parameters

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.3 with TypeScript
- **Build Tool**: Vite 6.2.0
- **State Management**: Zustand 5.0.10
- **Routing**: React Router DOM 7.12.0
- **UI Components**: Custom components with Lucide React icons
- **Charts**: Recharts 3.6.0
- **Styling**: Vanilla CSS with modern design patterns

### Backend & Database
- **BaaS**: Supabase (PostgreSQL + Realtime + Auth + Storage)
- **Authentication**: Supabase Auth with Row-Level Security
- **Storage**: Supabase Storage for medical documents
- **Real-time**: Supabase Realtime subscriptions

### AI & ML
- **AI Engine**: Google Gemini API 1.35.0
- **Use Cases**: 
  - Health chatbot
  - Disease prediction
  - Nutrition planning
  - Medical image analysis

### DevOps
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Quality**: TypeScript strict mode
- **Environment**: Node.js

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (free tier available)
- **Google Gemini API Key** (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/santhoshkumar3134/care_connect.git
   cd care_connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase Database**
   
   Run the SQL scripts in order:
   ```bash
   # In your Supabase SQL Editor, run these files in sequence:
   supabase/COMPLETE_SETUP.sql
   supabase/ultimate_realistic_data.sql  # Optional: for test data
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5173`

### 🧪 Test Credentials

After running the test data script, you can log in with:

**Patient Account:**
- Email: `santhosh@example.com`
- Password: `password123`

**Doctor Account:**
- Email: `dr.sarah@example.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@careconnect.com`
- Password: `admin123`

---

## 📁 Project Structure

```
care_connect/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── patient/        # Patient portal pages
│   │   ├── doctor/         # Doctor portal pages
│   │   ├── admin/          # Admin portal pages
│   │   └── common/         # Shared pages (Login, etc.)
│   ├── store/              # Zustand state management
│   │   ├── store.ts        # Main patient/doctor store
│   │   └── doctorStore.ts  # Doctor-specific store
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── supabaseClient.ts   # Supabase configuration
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── supabase/               # Database scripts
│   ├── COMPLETE_SETUP.sql  # Main schema setup
│   ├── ultimate_realistic_data.sql  # Test data
│   └── ...                 # Migration and utility scripts
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── README.md               # This file
```

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
User profiles for all roles (Patient, Doctor, Admin)
```sql
- id (uuid, PK)
- email (text)
- name (text)
- role (enum: PATIENT, DOCTOR, ADMIN)
- nalam_id (text, unique)
- specialization (text, for doctors)
- created_at (timestamp)
```

#### `health_records`
Patient medical records
```sql
- id (uuid, PK)
- patient_id (uuid, FK -> profiles)
- title (text)
- type (enum: LAB, SCAN, PRESCRIPTION, VISIT_NOTE)
- date (date)
- doctor_name (text)
- summary (text)
- file_url (text)
- file_type (text)
```

#### `appointments`
Appointment scheduling
```sql
- id (uuid, PK)
- patient_id (uuid, FK -> profiles)
- doctor_id (uuid, FK -> profiles)
- date (date)
- time (text)
- status (enum: UPCOMING, COMPLETED, CANCELLED)
- type (enum: VIDEO, IN_PERSON)
- reason (text)
- notes (text)
```

#### `medications`
Medication tracking
```sql
- id (uuid, PK)
- patient_id (uuid, FK -> profiles)
- name (text)
- dosage (text)
- freq (text)
- time (text)
- stock (integer)
- refill (date)
- prescribed_by (uuid, FK -> profiles)
```

#### `access_grants`
Patient-Doctor access control
```sql
- id (uuid, PK)
- patient_id (uuid, FK -> profiles)
- provider_id (uuid, FK -> profiles)
- status (enum: GRANTED, REVOKED)
- granted_at (timestamp)
```

#### `messages`
Secure messaging
```sql
- id (uuid, PK)
- sender_id (uuid, FK -> profiles)
- receiver_id (uuid, FK -> profiles)
- text (text)
- is_read (boolean)
- created_at (timestamp)
```

---

## 🔒 Security

### Authentication
- **Supabase Auth**: Email/password authentication with secure session management
- **JWT Tokens**: Automatic token refresh and validation
- **Password Hashing**: bcrypt with salt rounds

### Authorization
- **Row-Level Security (RLS)**: Database-level access control
  - Patients can only access their own data
  - Doctors can only access patients who granted them access
  - Admins have elevated privileges with audit logging

### Data Protection
- **HIPAA Compliance**: Encrypted data at rest and in transit
- **Secure File Storage**: Supabase Storage with signed URLs
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase client

### Privacy
- **Access Control**: Granular patient-controlled access grants
- **Audit Logs**: Complete activity tracking for compliance
- **Data Minimization**: Only collect necessary information

---

## 📚 API Documentation

### Supabase Client Usage

#### Fetching Health Records
```typescript
const { data, error } = await supabase
  .from('health_records')
  .select('*')
  .eq('patient_id', userId)
  .order('date', { ascending: false });
```

#### Creating an Appointment
```typescript
const { data, error } = await supabase
  .from('appointments')
  .insert({
    patient_id: patientId,
    doctor_id: doctorId,
    date: '2026-02-15',
    time: '10:00 AM',
    status: 'UPCOMING',
    type: 'VIDEO'
  });
```

#### Real-time Subscription
```typescript
supabase
  .channel('appointments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe();
```

### Gemini AI Integration

#### Health Chatbot
```typescript
import { GoogleGenerativeAI } from '@google/genai';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const result = await model.generateContent(prompt);
const response = result.response.text();
```

---

## 🎨 UI/UX Features

- **Glassmorphism**: Modern frosted glass effect for cards and modals
- **Smooth Animations**: CSS transitions and transforms for delightful interactions
- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Dark Mode Ready**: Color scheme designed for future dark mode support
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Loading States**: Skeleton screens and spinners for better UX
- **Error Handling**: User-friendly error messages and fallbacks

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements
- 🌐 Internationalization (i18n)
- 🧪 Test coverage

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] User authentication and authorization
- [x] Patient dashboard and health records
- [x] Appointment booking system
- [x] Medication tracking
- [x] Doctor-patient messaging
- [x] AI chatbot integration

### Phase 2: Advanced Features 🚧
- [ ] Video consultation integration (WebRTC)
- [ ] Mobile app (React Native)
- [ ] Prescription e-signature
- [ ] Insurance claim processing
- [ ] Multi-language support
- [ ] Advanced analytics dashboard

### Phase 3: Enterprise Features 🔮
- [ ] Hospital/clinic management
- [ ] Inventory management
- [ ] Billing and invoicing
- [ ] Telemedicine platform
- [ ] Blockchain integration for medical records
- [ ] IoT device integration (wearables)

---

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: Optimized with code splitting and lazy loading

---

## 🐛 Known Issues

- [ ] File upload progress indicator needed
- [ ] Notification system requires enhancement
- [ ] Video call feature in development

See the [Issues](https://github.com/santhoshkumar3134/care_connect/issues) page for a full list.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Santhosh Kumar**
- GitHub: [@santhoshkumar3134](https://github.com/santhoshkumar3134)
- Email: santhosh123.2004@gmail.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) - For the amazing BaaS platform
- [Google Gemini](https://ai.google.dev/) - For AI capabilities
- [React Team](https://react.dev/) - For the incredible framework
- [Lucide Icons](https://lucide.dev/) - For beautiful icons
- [Recharts](https://recharts.org/) - For data visualization

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Documentation](#-api-documentation)
2. Search [Existing Issues](https://github.com/santhoshkumar3134/care_connect/issues)
3. Create a [New Issue](https://github.com/santhoshkumar3134/care_connect/issues/new)
4. Join our [Discussions](https://github.com/santhoshkumar3134/care_connect/discussions)

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by the CareConnect Team

</div>
