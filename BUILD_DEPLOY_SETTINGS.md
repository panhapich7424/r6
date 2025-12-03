# Build & Deploy Settings for Render.com

## Quick Deploy (Recommended Method)

### Using Blueprint (render.yaml)

1. **Push to GitHub**
2. **On Render.com:**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repo
   - Click "Apply"
   - ✅ Done! Everything is configured automatically

---

## Manual Configuration (Alternative)

If you prefer manual setup or need to customize:

### Step 1: Create Web Service

Go to Render Dashboard → "New +" → "Web Service"

### Step 2: Connect Repository

- **Repository:** Select your GitHub repo
- **Branch:** `main`

### Step 3: Basic Settings

```
Name: tactical-shooter-5v5
Region: Oregon (US West) or closest to your users
Branch: main
Root Directory: (leave blank)
```

### Step 4: Build & Deploy Settings

#### Runtime
```
Environment: Node
```

#### Build Command
```
npm run render-build
```

This command does:
1. `npm install` - Installs all dependencies
2. `npm run build` - Builds the Vite client into `/dist` folder

#### Start Command
```
npm start
```

This runs: `node server/server.js`

### Step 5: Environment Variables

Add these in the "Environment" section:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `10000` | Auto-set by Render |

**Optional variables:**
| Key | Value | Notes |
|-----|-------|-------|
| `CLIENT_URL` | (auto) | For CORS, usually not needed |

### Step 6: Advanced Settings

#### Instance Type
```
Plan: Free (or Starter for production)
```

#### Auto-Deploy
```
✅ Enable Auto-Deploy
```
Automatically deploys when you push to GitHub

#### Health Check Path
```
/ (root)
```

---

## Build Process Explained

### What Happens During Build

1. **Install Dependencies**
   ```bash
   npm install
   ```
   Installs all packages from `package.json`

2. **Build Client (Vite)**
   ```bash
   npm run build
   ```
   - Bundles all client code
   - Optimizes assets
   - Outputs to `/dist` folder
   - Minifies JavaScript
   - Processes Babylon.js modules

3. **Server Preparation**
   - Server code stays in `/server` folder
   - No build needed (Node.js runs directly)

### What Happens During Start

```bash
npm start → node server/server.js
```

The server:
1. Starts Express server
2. Initializes Socket.io for WebSockets
3. Serves static files from `/dist` (built client)
4. Handles game logic and multiplayer sync
5. Listens on port 10000 (Render's default)

---

## Deployment Checklist

### Before First Deploy

- [ ] Code pushed to GitHub
- [ ] `package.json` has `"type": "module"`
- [ ] `render.yaml` exists in root
- [ ] `.gitignore` excludes `node_modules/` and `dist/`
- [ ] Node version ≥18.0.0 specified in `package.json`

### Render Configuration

- [ ] Web Service created
- [ ] Build command: `npm run render-build`
- [ ] Start command: `npm start`
- [ ] Environment: Node
- [ ] `NODE_ENV=production` set
- [ ] Auto-deploy enabled

### After Deploy

- [ ] Check build logs for errors
- [ ] Visit your URL: `https://tactical-shooter-5v5.onrender.com`
- [ ] Test game connection
- [ ] Check browser console for errors
- [ ] Test multiplayer with 2+ players

---

## Monitoring & Logs

### View Logs

**Render Dashboard → Your Service → Logs**

Look for:
```
Game server running on port 10000
Player connected: [socket-id]
```

### Common Log Messages

✅ **Success:**
```
Build succeeded
Server started
Game server running on port 10000
```

❌ **Errors:**
```
Module not found → Check imports
Port already in use → Render handles this
Connection refused → Check CORS settings
```

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
```bash
Solution: Check import paths use .js extensions
Example: import { GameServer } from './game/GameServer.js'
```

**Error: "Node version mismatch"**
```json
Solution: Add to package.json:
"engines": {
  "node": ">=18.0.0"
}
```

### Deploy Succeeds But Game Won't Load

**Check 1: Build Output**
- Logs should show "Build succeeded"
- `/dist` folder should be created

**Check 2: Server Logs**
- Should see "Game server running on port 10000"

**Check 3: Browser Console**
- Open DevTools → Console
- Look for WebSocket connection errors

**Check 4: Network Tab**
- Should see Socket.io connection established
- Look for 404 errors on assets

### WebSocket Connection Issues

**Error: "WebSocket connection failed"**

1. Check CORS in `server/server.js`:
   ```javascript
   cors: { 
     origin: '*',  // Or specific domain
     methods: ['GET', 'POST']
   }
   ```

2. Verify client connects to correct URL:
   ```javascript
   // Should auto-detect in production
   const serverUrl = window.location.origin;
   ```

3. Check Render logs for connection attempts

### Game Loads But Players Can't Connect

**Issue: Socket.io not connecting**

- Verify server logs show "Player connected"
- Check browser console for Socket.io errors
- Test with 2 different browsers/devices
- Ensure Render service is not sleeping (free tier)

---

## Performance Optimization

### For Production Use

1. **Upgrade Plan**
   - Free tier sleeps after 15 min
   - Starter plan ($7/mo) stays awake
   - Better for real players

2. **Enable Compression**
   ```javascript
   // Add to server/server.js
   import compression from 'compression';
   app.use(compression());
   ```

3. **Add CDN**
   - Use Cloudflare for static assets
   - Reduces load on Render

4. **Database for Persistence**
   - Add PostgreSQL for player stats
   - Use Redis for session management

---

## Updating Your Game

### Push Updates

```bash
git add .
git commit -m "Update: new feature"
git push origin main
```

Render auto-deploys if enabled ✅

### Manual Deploy

Render Dashboard → Your Service → "Manual Deploy" → "Deploy latest commit"

### Rollback

Render Dashboard → Your Service → "Rollback" → Select previous deploy

---

## Custom Domain (Optional)

### Add Your Domain

1. **Render Dashboard → Your Service → Settings**
2. **Custom Domain section**
3. **Add domain:** `yourgame.com`
4. **Configure DNS:**
   ```
   Type: CNAME
   Name: @ (or www)
   Value: tactical-shooter-5v5.onrender.com
   ```
5. **Wait for SSL:** Render auto-provisions HTTPS

---

## Cost Breakdown

### Free Tier
- ✅ 750 hours/month
- ✅ Automatic HTTPS
- ✅ WebSocket support
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 30s cold start

### Starter Plan ($7/month)
- ✅ Always on
- ✅ No cold starts
- ✅ Better for real players
- ✅ 512MB RAM

### Pro Plan ($25/month)
- ✅ 2GB RAM
- ✅ Better performance
- ✅ Priority support

---

## Alternative Platforms

### Railway.app
```
Build: npm run render-build
Start: npm start
Port: Auto-detected
```

### Heroku
```
Create Procfile:
web: npm start

Deploy:
heroku create
git push heroku main
```

### Fly.io
```
fly launch
fly deploy
```

---

## Security Checklist

Before going live with real players:

- [ ] Add rate limiting
- [ ] Implement authentication
- [ ] Validate all inputs
- [ ] Add anti-cheat measures
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (Render does this)
- [ ] Add CSP headers
- [ ] Sanitize user names
- [ ] Limit WebSocket message size
- [ ] Add timeout for inactive players

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Socket.io Docs:** https://socket.io/docs/
- **Babylon.js Docs:** https://doc.babylonjs.com/
- **Vite Docs:** https://vitejs.dev/

---

## Quick Reference

### Essential Commands

```bash
# Local development
npm install
npm run dev

# Build locally
npm run build

# Test production build
NODE_ENV=production npm start

# Deploy to Render
git push origin main
```

### Essential URLs

- **Render Dashboard:** https://dashboard.render.com
- **Your Game:** https://tactical-shooter-5v5.onrender.com
- **Logs:** Dashboard → Service → Logs
- **Settings:** Dashboard → Service → Settings

---

## Success Indicators

Your deployment is successful when:

✅ Build completes without errors
✅ Server starts and shows "Game server running"
✅ You can access the game URL
✅ Join screen appears
✅ Players can connect and see each other
✅ Operator selection works
✅ Game phases transition correctly
✅ Movement and shooting sync between players

---

**Need Help?**

1. Check Render logs first
2. Check browser console
3. Review this guide
4. Check DEPLOYMENT.md for troubleshooting
5. Render has great support docs

**Happy deploying! 🚀**
