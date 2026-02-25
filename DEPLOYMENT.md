# Deployment Guide

## Quick Deploy (Recommended)

### Backend - Deploy to Render

1. **Create account** at https://render.com
2. **New Web Service** → Connect your GitHub repo
3. **Settings:**
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Environment Variables:**
   ```
   PORT=5000
   JWT_SECRET=your_super_secret_key_here
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.netlify.app
   ```
5. **Deploy** - Copy your backend URL (e.g., `https://your-app.onrender.com`)

### Frontend - Deploy to Netlify

1. **Create account** at https://netlify.com
2. **Drag and drop** the `frontend` folder
3. **Update `script.js`:**
   - Replace `REPLACE_WITH_YOUR_BACKEND_URL` with your Render URL
4. **Redeploy** if needed

---

## Alternative: Deploy to Railway

1. **Create account** at https://railway.app
2. **New Project** → Deploy from GitHub
3. **Add services:**
   - Backend service (auto-detected)
   - PostgreSQL database (optional upgrade from SQLite)
4. **Set environment variables**
5. **Deploy**

---

## Alternative: Deploy to Vercel

### Backend
- Not recommended (Vercel is for frontend/serverless)
- Use Render or Railway instead

### Frontend
1. **Create account** at https://vercel.com
2. **Import project** from GitHub
3. **Root Directory:** `frontend`
4. **Deploy**

---

## Post-Deployment Checklist

- [ ] Backend is accessible (test: `https://your-backend.com/api/cars`)
- [ ] Frontend loads correctly
- [ ] Update API URL in `frontend/script.js`
- [ ] Test user registration
- [ ] Test login
- [ ] Test adding favorites
- [ ] Check CORS is working

---

## Environment Variables Needed

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
```

### Frontend
Update in `script.js`:
```javascript
const API_URL = 'https://your-backend-url.onrender.com/api';
```

---

## Troubleshooting

**CORS Error:**
- Add your frontend URL to `FRONTEND_URL` env variable in backend

**Database Error:**
- SQLite works on Render
- For Railway, consider upgrading to PostgreSQL

**API Not Found:**
- Check backend URL is correct in frontend
- Ensure backend is deployed and running

---

## Free Tier Limits

**Render:**
- Free tier available
- Sleeps after 15 min inactivity
- 750 hours/month

**Netlify:**
- 100GB bandwidth/month
- Unlimited sites

**Railway:**
- $5 free credit/month
- Pay as you go after

---

## Need Help?

Check deployment logs on your hosting platform for errors.
