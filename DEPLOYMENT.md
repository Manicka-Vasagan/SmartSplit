# 🚀 SmartSplit Deployment Guide

## Step 1 – MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster
2. Create a database user (username + password)
3. Allow all IP addresses `0.0.0.0/0` in Network Access
4. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartsplit?retryWrites=true&w=majority
   ```

---

## Step 2 – Deploy Backend to Render

1. Push your `server/` folder to a GitHub repository
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18+
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | Your Atlas connection string |
   | `JWT_SECRET` | A long random secret string |
   | `CLIENT_URL` | Your Vercel frontend URL (add after deploying frontend) |
   | `NODE_ENV` | `production` |
6. Deploy and copy your Render URL (e.g. `https://smartsplit-api.onrender.com`)

---

## Step 3 – Deploy Frontend to Vercel

1. Create a `client/.env.production` file:
   ```env
   VITE_API_URL=https://smartsplit-api.onrender.com/api
   ```
2. Push your `client/` folder to GitHub
3. Go to [vercel.com](https://vercel.com) → **New Project**
4. Import from GitHub
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-render-url.onrender.com/api` |
7. Deploy and copy your Vercel URL

---

## Step 4 – Update CORS

After deploying, go back to Render and update `CLIENT_URL` to your Vercel URL:
```
CLIENT_URL=https://your-app.vercel.app
```

Redeploy the backend.

---

## Local Development

```bash
# Terminal 1 – Backend
cd server
npm install
npm run dev   # runs on :5000

# Terminal 2 – Frontend
cd client
npm install
npm run dev   # runs on :5173
```
