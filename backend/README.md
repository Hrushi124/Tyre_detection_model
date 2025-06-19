# Tyre Detection Backend - Vercel Deployment

## 🚀 Backend Deployment on Vercel

Your backend is configured specifically for Vercel serverless deployment!

### Quick Deploy

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

For detailed instructions, see [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)

3. **Environment Variables** (Add in Railway dashboard):
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `FRONTEND_URL`: https://tyre-detection-model.vercel.app
   - `FLASK_API_URL`: Your ML model API URL
   - `EMAIL_SENDER`: Your email address
   - `EMAIL_PASSWORD`: Your app password
   - `EMAIL_SERVICE`: gmail

### Option 2: Render

1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub repository
3. Create a new "Web Service"
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node.js

### Option 3: Heroku

1. **Setup**:
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Deploy**:
   ```bash
   cd backend
   heroku create your-app-name
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name
   git push heroku main
   ```

## 📊 Database Setup

### MongoDB Atlas (Recommended for Production)

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Add it as `MONGODB_URI` environment variable

### Railway PostgreSQL (Alternative)
Railway also offers PostgreSQL if you prefer SQL databases.

## 🔧 Environment Variables

After deployment, set these environment variables:

```env
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://tyre-detection-model.vercel.app
FLASK_API_URL=your-ml-model-api-url
EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SERVICE=gmail
```

## 🔗 Update Frontend

After backend deployment, update your frontend environment variable:

1. Go to your Vercel dashboard
2. Go to Settings → Environment Variables
3. Update `VITE_API_URL` to your backend URL (e.g., `https://your-backend-app.railway.app`)
4. Redeploy your frontend

## 🧪 Test Your Deployment

1. Check health endpoint: `https://your-backend-url/health`
2. Test user registration/login
3. Test image upload (once ML model is deployed)

## 📁 Files Added for Deployment

- `railway.yml` - Railway configuration
- `Procfile` - Heroku configuration  
- `.env.example` - Environment variables template
- Updated CORS to allow your frontend domain
- Added Node.js version specification

## ⚡ Quick Start

1. Choose a platform (Railway recommended)
2. Set up MongoDB Atlas database
3. Configure environment variables
4. Deploy!
5. Update frontend `VITE_API_URL`
6. Your app is live! 🎉

## 🔍 Troubleshooting

- **CORS errors**: Check `FRONTEND_URL` environment variable
- **Database connection**: Verify `MONGODB_URI` format
- **Authentication issues**: Ensure `JWT_SECRET` is set
- **Email not working**: Check email credentials and app passwords
