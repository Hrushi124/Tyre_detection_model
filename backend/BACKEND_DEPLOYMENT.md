# Backend Deployment Guide - Vercel Only

## 🚀 Deploy Backend to Vercel

Your Node.js backend is configured specifically for Vercel deployment!

### 📁 Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── vercel.json        # Vercel configuration
├── .env.example       # Environment variables template
└── .env               # Your actual environment variables (local only)
```

### 🔧 Prerequisites

1. **MongoDB Atlas Account** (Required for production)

   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free cluster
   - Get your connection string

2. **Email Configuration** (For password reset)
   - Gmail App Password (recommended)
   - Or other email service credentials

### 🚀 Deployment Steps

#### Method 1: Vercel CLI (Recommended)

1. **Navigate to backend directory:**

   ```bash
   cd /Users/hrushireddy/Documents/project/tyre-detection-reactjs/backend
   ```

2. **Install Vercel CLI** (if not already installed):

   ```bash
   npm i -g vercel
   ```

3. **Login to Vercel:**

   ```bash
   vercel login
   ```

4. **Deploy:**

   ```bash
   vercel --prod
   ```

5. **Follow the prompts:**
   - Link to existing project? **N**
   - Project name: **tyre-detection-backend** (or your choice)
   - Directory: **./** (current directory)
   - Want to override settings? **N**

#### Method 2: Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Upload the `backend` folder
4. Vercel will auto-detect it as a Node.js project
5. Click "Deploy"

### 🌍 Environment Variables Setup

**CRITICAL:** Add these environment variables in your Vercel project:

1. Go to your backend project dashboard on Vercel
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

| Variable         | Value                                 | Example                                                  |
| ---------------- | ------------------------------------- | -------------------------------------------------------- |
| `MONGODB_URI`    | Your MongoDB Atlas connection string  | `mongodb+srv://user:pass@cluster.mongodb.net/tyredetect` |
| `JWT_SECRET`     | Strong random string (32+ characters) | `your-super-secret-jwt-key-here-32chars`                 |
| `EMAIL_SENDER`   | Your email address                    | `your-email@gmail.com`                                   |
| `EMAIL_PASSWORD` | Your email app password               | `your-app-password`                                      |
| `EMAIL_SERVICE`  | Email service                         | `gmail`                                                  |
| `FRONTEND_URL`   | Your deployed frontend URL            | `https://tyre-detection-model.vercel.app`                |
| `FLASK_API_URL`  | Your ML model API URL                 | `https://your-ml-model.vercel.app`                       |
| `NODE_ENV`       | Environment                           | `production`                                             |

### 📧 Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

### 🗄️ MongoDB Atlas Setup

1. **Create cluster:**

   - Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free M0 cluster
   - Choose a cloud provider and region

2. **Database Access:**

   - Create a database user
   - Set username and password
   - Grant read/write access

3. **Network Access:**

   - Add IP address: `0.0.0.0/0` (allow from anywhere)
   - Or add Vercel's IP ranges for better security

4. **Get connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 🔗 Connect Frontend to Backend

After deploying your backend:

1. **Get your backend URL** from Vercel (e.g., `https://your-backend.vercel.app`)

2. **Update your frontend environment variable:**
   - Go to your frontend project on Vercel
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your backend URL
   - Redeploy your frontend

### 🧪 Testing Your Deployment

1. **Health Check:**

   ```bash
   curl https://your-backend.vercel.app/health
   ```

2. **Test CORS:**
   - Open your frontend: `https://tyre-detection-model.vercel.app`
   - Try logging in or signing up
   - Check browser console for errors

### 📋 Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] All environment variables set
- [ ] MongoDB Atlas connected
- [ ] Email service configured
- [ ] Frontend `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Authentication working
- [ ] CORS configured correctly

### 🎯 Next Steps

1. **Deploy ML Model:** Your Flask/Python model needs to be deployed separately
2. **Update FLASK_API_URL:** Point to your deployed ML model
3. **Test image analysis:** Once ML model is deployed

### 🔧 Troubleshooting

**Common Issues:**

1. **CORS Errors:**

   - Check `FRONTEND_URL` environment variable
   - Ensure no trailing slashes in URLs

2. **Database Connection:**

   - Verify MongoDB connection string
   - Check network access settings in Atlas

3. **Authentication Issues:**

   - Verify `JWT_SECRET` is set
   - Check email configuration

4. **404 Errors:**
   - Ensure `vercel.json` is properly configured
   - Check route definitions in `server.js`

### 📱 Current Status After Backend Deployment

- ✅ **Frontend**: Deployed and running
- ✅ **Backend**: Ready for deployment
- ⏳ **ML Model**: Still needs deployment
- ⏳ **Full Integration**: After ML model deployment

Your backend is now ready for Vercel! 🚀
