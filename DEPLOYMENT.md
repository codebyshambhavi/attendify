# Attendify Deployment Guide

## Option A — Render (recommended for beginners, free tier available)

### Backend on Render
1. Push your code to GitHub
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo, select the `backend` folder
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
5. Add environment variables (Environment tab):
   ```
   MONGODB_URI     = mongodb+srv://...  (from MongoDB Atlas)
   JWT_SECRET      = <generated 64-char string>
   JWT_EXPIRES_IN  = 7d
   CLIENT_URL      = https://your-frontend.vercel.app
   NODE_ENV        = production
   ```
6. Click **Deploy**. Your API URL will be `https://attendify-api.onrender.com`

### Frontend on Vercel
1. Go to https://vercel.com → New Project → Import from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   ```
   VITE_API_URL = https://attendify-api.onrender.com/api
   ```
4. Click **Deploy**

---

## Option B — Railway (easiest, includes MongoDB)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add MongoDB plugin in Railway dashboard (one click)

# Deploy backend
cd backend
railway up

# Set env vars
railway variables set JWT_SECRET=your_secret
railway variables set JWT_EXPIRES_IN=7d
railway variables set NODE_ENV=production
```

For the frontend, deploy to Vercel as described above.

---

## Option C — Docker on a VPS (DigitalOcean / Hetzner)

```bash
# On your server
git clone https://github.com/yourname/attendify.git
cd attendify

# Create production env file
cp backend/.env.example backend/.env
nano backend/.env   # Fill in your values

# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Update after code changes
git pull && docker compose up -d --build
```

Add an Nginx reverse proxy for HTTPS:
```nginx
server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate     /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Use Certbot for free HTTPS: `certbot --nginx -d api.yourdomain.com`

---

## MongoDB Atlas Setup (all options)

1. Go to https://cloud.mongodb.com → Create free cluster
2. Add a database user (Database Access → Add New User)
3. Whitelist all IPs (Network Access → 0.0.0.0/0) or add your server's IP
4. Get connection string: Clusters → Connect → Connect your application
5. Replace `<password>` with your user password in the URI

---

## Seed production data

```bash
# After deploying backend, SSH into your server or use Render Shell:
node src/utils/seed.js

# Creates:
# admin@attendify.com / Admin@123  (change this immediately!)
# alice@attendify.com / Student@123
```

---

## Post-deployment checklist

- [ ] Change default admin password immediately
- [ ] Set a strong `JWT_SECRET` (64+ random chars)
- [ ] Enable MongoDB Atlas IP whitelist for your server only
- [ ] Verify CORS `CLIENT_URL` matches your frontend domain exactly
- [ ] Test QR scan flow end-to-end
- [ ] Set up MongoDB Atlas backups (free tier supports manual snapshots)
