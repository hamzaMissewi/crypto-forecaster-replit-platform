# Deployment Guide: Vercel + Render

## Option 1: Separate Deployment (Recommended)

### Deploy Frontend to Vercel
1. **Create Vite Build**
```bash
npm run build:client
```

2. **Deploy to Vercel**
```bash
cd client
vercel --prod
```

3. **Update API URLs in Frontend**
   - In `src/hooks/use-crypto.ts`, change API calls to your Render backend URL
   - Example: `fetch("https://your-app.onrender.com/api/crypto/market")`

### Deploy Backend to Render

1. **Create `render.yaml`**
```yaml
services:
  - type: web
    name: crypto-forecaster-api
    env: node
    plan: free
    buildCommand: npm run build:server
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: AI_INTEGRATIONS_OPENAI_API_KEY
        sync: false
      - key: AI_INTEGRATIONS_OPENAI_BASE_URL
        sync: false
      - key: OPENAI_API_KEY
        sync: false
      - key: OPENAI_API_BASE_URL
        sync: false
      - key: SESSION_SECRET
        generateValue: true
      - key: ISSUER_URL
        value: https://replit.com/oidc
      - key: REPL_ID
        sync: false
      - key: REPL_SECRET
        sync: false
```

2. **Push to GitHub**
```bash
git add .
git commit -m "Add render.yaml"
git push origin main
```

3. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml`

## Option 2: Full Stack on Vercel

### Update `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Update Package.json
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "start": "node dist/index.cjs"
  }
}
```

## Environment Variables Setup

### For Vercel (Frontend)
```env
VITE_API_URL=https://your-app.onrender.com
```

### For Render (Backend)
```env
DATABASE_URL=postgresql://postgres:password@host:5432/dbname
AI_INTEGRATIONS_OPENAI_API_KEY=your_openai_key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com
OPENAI_API_KEY=your_deepseek_key
OPENAI_API_BASE_URL=https://api.deepseek.com
SESSION_SECRET=your_random_secret
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id
REPL_SECRET=your_repl_secret
NODE_ENV=production
```

## CORS Configuration

Add CORS to your server:
```typescript
// In server/index.ts
import cors from 'cors';

app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

## Database Setup

1. **Supabase**: Create project and get connection string
2. **Render PostgreSQL**: Use managed database
3. **PlanetScale**: MySQL alternative

## Deployment Steps Summary

### Step 1: Prepare Code
```bash
npm install
npm run build
```

### Step 2: Deploy Backend (Render)
- Push to GitHub
- Connect repository to Render
- Set environment variables
- Deploy

### Step 3: Deploy Frontend (Vercel)
- Deploy client folder
- Set VITE_API_URL
- Deploy

### Step 4: Test
- Test API endpoints
- Test frontend connectivity
- Monitor logs

## Troubleshooting

- **CORS Issues**: Check origin configuration
- **Database Errors**: Verify connection string
- **API Timeouts**: Check Render free tier limits
- **Build Failures**: Check Node.js version (use 18.x)

## Free Tier Limits

- **Vercel**: 100GB bandwidth/month
- **Render**: 750 hours/month (free tier)
- **Supabase**: 500MB database, 2GB bandwidth
