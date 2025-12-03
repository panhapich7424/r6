# Deployment Guide

## Deploy to Render.com

### Option 1: Using render.yaml (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/tactical-shooter-5v5.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml` and configure everything
   - Click "Apply" to deploy

3. **Done!** Your game will be live at `https://tactical-shooter-5v5.onrender.com`

### Option 2: Manual Setup

1. **Push to GitHub** (same as above)

2. **Create Web Service on Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** tactical-shooter-5v5
     - **Environment:** Node
     - **Build Command:** `npm run render-build`
     - **Start Command:** `npm start`
     - **Plan:** Free

3. **Environment Variables:**
   - Add in Render dashboard:
     - `NODE_ENV` = `production`
     - `PORT` = `10000` (Render sets this automatically)

4. **Deploy!** Click "Create Web Service"

## Important Notes

### Free Tier Limitations
- Render's free tier spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- 750 hours/month free (enough for continuous running)

### WebSocket Support
- Render fully supports WebSockets (Socket.io works perfectly)
- No additional configuration needed

### Custom Domain (Optional)
- Go to Settings → Custom Domain in Render dashboard
- Add your domain and configure DNS

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Access at `http://localhost:3000`

## Production Build Locally

```bash
# Build the client
npm run build

# Start production server
NODE_ENV=production npm start
```

## Troubleshooting

### Build Fails
- Check Node version (requires >=18.0.0)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### WebSocket Connection Issues
- Check browser console for errors
- Verify CORS settings in `server/server.js`
- Ensure Render service is running (check logs)

### Game Not Loading
- Check Render logs for errors
- Verify build completed successfully
- Clear browser cache and reload

## Monitoring

- **Render Dashboard:** View logs, metrics, and deployment status
- **Browser Console:** Check for client-side errors
- **Network Tab:** Monitor WebSocket connections

## Scaling (Paid Plans)

For production with many players:
- Upgrade to Render's paid plan for always-on service
- Consider Redis for session management
- Add load balancing for multiple game servers
- Implement proper matchmaking with room management

## Alternative Deployment Options

### Heroku
```bash
# Add Procfile
echo "web: npm start" > Procfile

# Deploy
heroku create tactical-shooter-5v5
git push heroku main
```

### Railway
- Connect GitHub repo
- Railway auto-detects Node.js
- Set build command: `npm run render-build`
- Set start command: `npm start`

### Vercel (Client Only)
- Deploy client separately with Vercel
- Deploy server on Render/Railway
- Update `VITE_SERVER_URL` to point to server

## Security Recommendations

Before going live:
1. Add rate limiting for API endpoints
2. Implement player authentication
3. Add anti-cheat measures
4. Sanitize all user inputs
5. Use environment variables for sensitive data
6. Enable HTTPS (Render provides this automatically)
