# Deployment Guide for Property Canvas

## Prerequisites
- GitHub account (push your code to GitHub)
- Vercel account (free tier available)
- Render.com or Railway.app account for backend (free tier available)

---

## Step 1: Prepare for Frontend Deployment (Vercel)

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 1.2 Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Select your repository
5. Set build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables (from your `.env`):
   ```
   VITE_SUPABASE_PROJECT_ID=gnsgtnunohgnyslxmerq
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_SUPABASE_URL=https://gnsgtnunohgnyslxmerq.supabase.co
   VITE_API_URL=https://your-backend-url.com (set this after backend deployment)
   ```
7. Click "Deploy"

---

## Step 2: Deploy Backend to Render.com (Recommended)

### 2.1 Create .env file for production
Create `server/.env.production`:
```
MONGODB_URI=mongodb+srv://psofficial7789:Shlok%408906@cluster0.kuyedk6.mongodb.net/?appName=Cluster0
PORT=3001
NODE_ENV=production
```

### 2.2 Update package.json
Add a `start` script in `package.json`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "start": "node server/index.js"
}
```

### 2.3 Deploy to Render
1. Go to [render.com](https://render.com)
2. Sign up/Log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: property-canvas-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server/index.js`
   - **Plan**: Free (or Paid)
6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://psofficial7789:Shlok%408906@cluster0.kuyedk6.mongodb.net/?appName=Cluster0
   NODE_ENV=production
   PORT=3001
   ```
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy the backend URL (e.g., `https://property-canvas-backend.onrender.com`)

### 2.4 Update Vercel with Backend URL
1. Go back to Vercel project settings
2. Add environment variable:
   ```
   VITE_API_URL=https://property-canvas-backend.onrender.com
   ```
3. Redeploy

---

## Step 3: Update Frontend API Calls

Update your API configuration in `src/lib/api.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});
```

---

## Step 4: Update CORS Configuration

In `server/index.js`, update CORS:
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'https://your-vercel-domain.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

---

## Alternative: Deploy Backend on Render (Free Tier)

If backend takes too long to wake up on free tier, consider:
1. Upgrading to Render's Starter plan ($7/month)
2. Or use Railway.app instead

---

## Monitoring & Logs

**Vercel Logs:**
- Go to project → Deployments → Click deployment → Logs

**Render Logs:**
- Dashboard → Click service → Logs tab

---

## Troubleshooting

### CORS Errors
- Check `VITE_API_URL` is set correctly in Vercel
- Update `allowedOrigins` in server/index.js

### 502 Bad Gateway
- Check Render backend is running
- Check MongoDB connection string
- Review Render logs

### Build Failures on Vercel
- Check `npm run build` works locally
- Verify all dependencies are in package.json
- Clear Vercel cache and redeploy

---

## Summary
✅ Frontend: Vercel (Free)
✅ Backend: Render.com (Free)
✅ Database: MongoDB Atlas (Free)
✅ Auth: Supabase (Free)

**Total Cost**: $0/month (free tier)

---

## Next Steps
1. Create GitHub repository
2. Follow Step 1 (Vercel Frontend)
3. Follow Step 2 (Render Backend)
4. Test API connections
5. Go live!
