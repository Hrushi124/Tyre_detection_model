# Vercel Deployment Guide for Backend

## 🚀 Deploy to Vercel

### Prerequisites
1. Have a Vercel account
2. Install Vercel CLI: `npm i -g vercel`

### Environment Variables Required on Vercel

Go to your Vercel dashboard → Project Settings → Environment Variables and add:

```
MONGODB_URI=mongodb+srv://hrushipothireddy:r9O15VhunBMeAYs0@tyre-detection.lfntwdg.mongodb.net/tyredetect?retryWrites=true&w=majority&appName=tyre-detection

JWT_SECRET=tyredetect-super-secret-jwt-key-32chars-long-2025

EMAIL_SENDER=hrushipothireddy@gmail.com
EMAIL_PASSWORD=gtjcmdhfagfnsxnb
EMAIL_SERVICE=gmail

FRONTEND_URL=https://tyre-detection-model.vercel.app

NODE_ENV=production

FLASK_API_URL=http://localhost:5000
```

### Deployment Steps

1. **Navigate to backend directory:**
   ```bash
   cd /Users/hrushireddy/Documents/project/tyre-detection-reactjs/backend
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Frontend Configuration

After backend deployment, update your frontend's `VITE_API_URL` environment variable in Vercel to point to your new backend URL.

### Testing Deployment

Test these endpoints after deployment:
- `https://your-backend.vercel.app/health` - Should return `{"status":"OK"}`
- `https://your-backend.vercel.app/` - Should return API information

### Common Issues & Solutions

1. **Function Timeout**: Increase timeout in vercel.json (already set to 30s)
2. **MongoDB Connection**: Ensure connection string is correct and IP whitelisted
3. **CORS Issues**: Check allowed origins in server.js
4. **Environment Variables**: Ensure all required vars are set in Vercel dashboard

### Debug Mode

To see logs in Vercel:
```bash
vercel logs [deployment-url]
```
