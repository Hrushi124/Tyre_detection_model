# Tyre Detection React App - Deployment Guide

## ✅ Vercel Deployment Ready

Your React frontend is now ready for Vercel deployment! Here's what I've prepared:

### 🔧 Changes Made for Deployment

1. **Fixed API URLs**: Updated all hardcoded localhost URLs to use environment variables
2. **Added axios dependency**: Added missing `axios` package to package.json
3. **Environment configuration**: Created `.env.example` with proper setup
4. **Vercel configuration**: Added `vercel.json` for proper routing
5. **Build optimization**: Cleaned up package.json scripts

### 🚀 Deploy to Vercel

#### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy from your project directory:

   ```bash
   cd /Users/hrushireddy/Documents/project/tyre-detection-reactjs
   vercel
   ```

4. Follow the prompts:
   - Link to existing project? **N**
   - Project name: **tyre-detection-app** (or your choice)
   - Directory: **./** (current directory)
   - Want to override settings? **N**

#### Method 2: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository or upload the project folder
4. Vercel will auto-detect it's a React/Vite project
5. Click "Deploy"

### 🌍 Environment Variables Setup

After deployment, add these environment variables in Vercel:

1. Go to your project dashboard on Vercel
2. Go to Settings → Environment Variables
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-api-url.com` (when you deploy your backend)
   - **Environment**: Production

### 📝 Important Notes

#### Frontend Only Deployment

- ✅ Your React frontend will work perfectly on Vercel
- ❌ Authentication features will show errors until backend is deployed
- ❌ Image analysis won't work until backend + ML model are deployed

#### What Works Without Backend:

- Landing page and UI navigation
- Login/signup forms (UI only)
- App layout and design
- Responsive design on all devices

#### What Needs Backend:

- User authentication
- Image upload and analysis
- History and analytics data
- All API-dependent features

### 🔄 When You Deploy Your Backend

1. Deploy your Node.js backend to Vercel (see backend/BACKEND_DEPLOYMENT.md)
2. Deploy your Python ML model to Vercel or Hugging Face Spaces
3. Update the `VITE_API_URL` environment variable in Vercel
4. Your app will be fully functional!

### 🛠 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📱 Current Status

- ✅ **Frontend**: Deployed at https://tyre-detection-model.vercel.app
- ✅ **Backend**: Ready for Vercel deployment (see backend/BACKEND_DEPLOYMENT.md)
- ⏳ **ML Model**: Not deployed yet

### 🔄 Next Steps - Deploy Backend

Your frontend is deployed! Now deploy your backend:

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Deploy to Vercel:**

   ```bash
   vercel --prod
   ```

3. **Set up environment variables** (see backend/BACKEND_DEPLOYMENT.md for details)

4. **Update frontend API URL:**
   - Get your backend URL from Vercel
   - Update `VITE_API_URL` in your frontend project settings
   - Redeploy frontend

After backend deployment, your authentication and data features will work!
