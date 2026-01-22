# 🚀 CareConnect Deployment Guide

This guide will help you deploy CareConnect to production using **100% FREE** hosting platforms.

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Database Setup (Supabase)](#-database-setup-supabase)
3. [Frontend Deployment Options](#-frontend-deployment-options)
   - [Option 1: Vercel (Recommended)](#option-1-vercel-recommended)
   - [Option 2: Netlify](#option-2-netlify)
   - [Option 3: Render](#option-3-render)
4. [Environment Variables](#-environment-variables)
5. [Post-Deployment Steps](#-post-deployment-steps)
6. [Custom Domain Setup](#-custom-domain-setup)
7. [Troubleshooting](#-troubleshooting)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with your code pushed
- ✅ Supabase account (free tier)
- ✅ Google Gemini API key (free tier)
- ✅ All environment variables ready

---

## 🗄️ Database Setup (Supabase)

**Supabase is already FREE forever** for your database, authentication, and storage!

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** → Sign in with GitHub
3. Click **"New Project"**
4. Fill in:
   - **Name**: `careconnect-prod`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (includes 500MB database, 1GB file storage)
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the contents of `supabase/COMPLETE_SETUP.sql`
4. Click **"Run"**
5. (Optional) Run `supabase/ultimate_realistic_data.sql` for test data

### Step 3: Configure Storage

1. Go to **Storage** in Supabase dashboard
2. Click **"Create a new bucket"**
3. Name it: `health-docs`
4. Set **Public bucket**: `ON` (for file access)
5. Click **"Create bucket"**

### Step 4: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

---

## 🌐 Frontend Deployment Options

Choose ONE of the following platforms. **Vercel is recommended** for React/Vite apps.

---

## Option 1: Vercel (Recommended) ⭐

**Why Vercel?**
- ✅ **100% FREE** for personal projects
- ✅ Automatic HTTPS
- ✅ Global CDN (fast worldwide)
- ✅ Auto-deploy on every Git push
- ✅ Best for React/Vite apps

### Deployment Steps

#### 1. Sign Up for Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** → Choose **"Continue with GitHub"**
3. Authorize Vercel to access your repositories

#### 2. Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find `care_connect` repository
3. Click **"Import"**

#### 3. Configure Build Settings

Vercel should auto-detect Vite. Verify these settings:

- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### 4. Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_GEMINI_API_KEY` | Your Gemini API key |

#### 5. Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://care-connect-xxxxx.vercel.app`

#### 6. Enable Auto-Deploy

- ✅ Already enabled by default!
- Every `git push` to `main` branch will auto-deploy

### Vercel CLI (Optional - for advanced users)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Option 2: Netlify

**Why Netlify?**
- ✅ **100% FREE** for personal projects
- ✅ Easy drag-and-drop deployment
- ✅ Form handling (useful for contact forms)
- ✅ Serverless functions support

### Deployment Steps

#### 1. Sign Up for Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Click **"Sign up"** → **"GitHub"**
3. Authorize Netlify

#### 2. Deploy from GitHub

1. Click **"Add new site"** → **"Import an existing project"**
2. Choose **"Deploy with GitHub"**
3. Select `care_connect` repository

#### 3. Configure Build Settings

- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

#### 4. Add Environment Variables

Go to **Site settings** → **Environment variables** → **Add a variable**

Add the same 3 variables as Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

#### 5. Deploy!

1. Click **"Deploy site"**
2. Wait for build to complete
3. You'll get a URL like: `https://random-name-12345.netlify.app`

#### 6. Custom Netlify Subdomain

1. Go to **Site settings** → **Domain management**
2. Click **"Options"** → **"Edit site name"**
3. Change to: `careconnect-yourname.netlify.app`

---

## Option 3: Render

**Why Render?**
- ✅ **FREE** static site hosting
- ✅ Good for full-stack apps
- ✅ Automatic SSL

### Deployment Steps

#### 1. Sign Up for Render

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started"** → **"GitHub"**

#### 2. Create Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect your `care_connect` repository
3. Configure:
   - **Name**: `careconnect`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`

#### 3. Add Environment Variables

In **Environment** section, add:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

#### 4. Deploy!

Click **"Create Static Site"**

---

## 🔐 Environment Variables

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI
VITE_GEMINI_API_KEY=AIzaSy...
```

### How to Get Gemini API Key (FREE)

1. Go to [https://ai.google.dev](https://ai.google.dev)
2. Click **"Get API key in Google AI Studio"**
3. Sign in with Google account
4. Click **"Create API Key"**
5. Copy the key (starts with `AIzaSy...`)

**Free Tier Limits:**
- 60 requests per minute
- 1,500 requests per day
- Perfect for testing and small projects!

---

## ✅ Post-Deployment Steps

### 1. Test Your Deployment

Visit your deployed URL and test:
- ✅ Login/Registration works
- ✅ Dashboard loads
- ✅ Can create appointments
- ✅ File uploads work
- ✅ AI chatbot responds
- ✅ Real-time updates work

### 2. Update Supabase URL Allowlist

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your deployment URL to **Site URL**:
   - `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/**`

### 3. Configure CORS (if needed)

If you get CORS errors, add your domain to Supabase allowed origins.

### 4. Update README

Add your live demo link to README.md:

```markdown
## 🌐 Live Demo

**[View Live Demo](https://your-app.vercel.app)**

Test Credentials:
- Patient: `santhosh@example.com` / `password123`
- Doctor: `dr.sarah@example.com` / `password123`
```

---

## 🌍 Custom Domain Setup (Optional)

### Free Options

1. **Free Subdomain** (Included):
   - Vercel: `your-app.vercel.app`
   - Netlify: `your-app.netlify.app`
   - Render: `your-app.onrender.com`

2. **Free Domain Providers**:
   - [Freenom](https://www.freenom.com) - Free `.tk`, `.ml`, `.ga` domains
   - [InfinityFree](https://infinityfree.net) - Free subdomain

### Using Custom Domain on Vercel

1. Go to **Project Settings** → **Domains**
2. Enter your domain (e.g., `careconnect.com`)
3. Follow DNS configuration instructions
4. Vercel provides free SSL automatically!

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found`
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

### Environment Variables Not Working

**Error**: `undefined` for env variables

**Solution**: 
1. Ensure variables start with `VITE_`
2. Redeploy after adding variables
3. Clear browser cache

### Supabase Connection Error

**Error**: `Failed to fetch`

**Solution**:
1. Check Supabase project is not paused (free tier pauses after 7 days inactivity)
2. Verify API keys are correct
3. Check Supabase dashboard for service status

### File Upload Not Working

**Solution**:
1. Ensure `health-docs` bucket exists in Supabase Storage
2. Set bucket to **Public**
3. Check RLS policies allow uploads

---

## 💰 Cost Breakdown (FREE Forever!)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| **Vercel** | ✅ FREE | 100GB bandwidth/month, Unlimited sites |
| **Netlify** | ✅ FREE | 100GB bandwidth/month, 300 build minutes |
| **Render** | ✅ FREE | Static sites unlimited |
| **Supabase** | ✅ FREE | 500MB database, 1GB storage, 2GB bandwidth |
| **Gemini API** | ✅ FREE | 60 req/min, 1,500 req/day |

**Total Monthly Cost: $0.00** 🎉

---

## 🚀 Recommended Setup

For **best performance and reliability**:

1. **Frontend**: Vercel (fastest for React)
2. **Database**: Supabase (already set up)
3. **AI**: Gemini API (free tier)
4. **Domain**: Use Vercel's free subdomain or buy custom domain ($12/year)

---

## 📊 Monitoring & Analytics (Optional)

### Free Tools

1. **Vercel Analytics** (Built-in)
   - Enable in Vercel dashboard
   - Track page views, performance

2. **Google Analytics** (Free)
   ```bash
   npm install react-ga4
   ```

3. **Sentry** (Error Tracking - Free tier)
   - 5,000 errors/month free
   - [https://sentry.io](https://sentry.io)

---

## 🎓 Next Steps

After successful deployment:

1. ✅ Share your live URL with users
2. ✅ Add to your portfolio/resume
3. ✅ Monitor usage and performance
4. ✅ Collect user feedback
5. ✅ Iterate and improve!

---

## 📞 Need Help?

- **Vercel Docs**: [https://vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [https://docs.netlify.com](https://docs.netlify.com)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: [Create an issue](https://github.com/santhoshkumar3134/care_connect/issues)

---

<div align="center">

**🎉 Congratulations on deploying CareConnect!**

Made with ❤️ by the CareConnect Team

</div>
