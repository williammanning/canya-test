# Canya Deployment Guide

## Local Development

### Prerequisites
- Node.js (v12 or higher)
- npm (comes with Node.js)

### Setup
```bash
npm install
npm start
```

Access at `http://localhost:3000`

---

## Deploy to Heroku

### Prerequisites
- Heroku CLI installed
- Heroku account (free tier available)

### Steps

1. **Login to Heroku**
   ```bash
   heroku login
   ```

2. **Create a Heroku app**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variable** (IMPORTANT - change the secret!)
   ```bash
   heroku config:set SECRET_KEY=your_very_secure_random_string
   ```

4. **Deploy to Heroku**
   ```bash
   git push heroku main
   ```

5. **View your app**
   ```bash
   heroku open
   ```

### Notes
- Data is stored locally in `/data/` directory
- **Important**: Heroku's ephemeral filesystem means data will be lost when the dyno restarts
- For persistent data, migrate to MongoDB Atlas or PostgreSQL

---

## Deploy to Railway.app

### Steps

1. **Connect your GitHub repository**
   - Go to railway.app
   - Click "New Project"
   - Select your GitHub repo

2. **Set environment variables**
   - In Railway dashboard, go to Variables
   - Add: `SECRET_KEY=your_secure_key`

3. **Deploy**
   - Railway auto-detects Node.js
   - Click Deploy

---

## Deploy to Vercel (for serverless)

Canya is a traditional server app and works best with platform.sh or Railway, but can be adapted for Vercel using serverless functions (more complex setup required).

---

## Deploy to AWS (EC2)

### Prerequisites
- AWS account
- EC2 instance with Node.js installed

### Steps

1. **SSH into your instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

2. **Clone your repository**
   ```bash
   git clone https://github.com/yourusername/canya-test.git
   cd canya-test
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set environment variables**
   ```bash
   export SECRET_KEY=your_secure_key
   export NODE_ENV=production
   ```

5. **Use PM2 for process management** (recommended)
   ```bash
   npm install -g pm2
   pm2 start server.js --name "canya"
   pm2 startup
   pm2 save
   ```

6. **Setup Nginx as reverse proxy** (optional but recommended)
   - Configure Nginx to forward requests to localhost:3000
   - Use SSL with Let's Encrypt

---

## Data Persistence Strategies

### Option 1: Keep Local Files (Simple but risky)
- Data stored in `/data/` JSON files
- Works for development and small deployments
- **Drawback**: Lost on dyno restart (Heroku)

### Option 2: Migrate to MongoDB (Recommended)

1. **Get MongoDB Atlas connection string**
   - Create account at mongodb.com
   - Create free cluster
   - Get connection string

2. **Install MongoDB package**
   ```bash
   npm install mongodb
   ```

3. **Update database middleware** to use MongoDB instead of JSON files

4. **Set connection string as environment variable**
   ```bash
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/canya
   ```

### Option 3: Use PostgreSQL
- More robust for production
- Requires database schema setup
- Better for complex queries

---

## Setting Up HTTPS/SSL

### Using Let's Encrypt (Free)

For AWS/DigitalOcean:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

Update Nginx config with SSL certificates.

### Using Heroku Automatic SSL
- Heroku provides free SSL for `*.herokuapp.com`
- For custom domain, add SSL certificate in Heroku Dashboard

---

## Environment Variables for Production

Create `.env` file (never commit this):
```
PORT=3000
NODE_ENV=production
SECRET_KEY=your_super_secure_random_key_here
# Optional MongoDB
MONGODB_URI=mongodb+srv://...
```

Load in `server.js`:
```javascript
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const PORT = process.env.PORT || 3000;
```

---

## Production Checklist

- [ ] Change admin password
- [ ] Set strong `SECRET_KEY`
- [ ] Use HTTPS/SSL
- [ ] Set `NODE_ENV=production`
- [ ] Add rate limiting
- [ ] Setup error logging (Sentry, LogRocket)
- [ ] Enable CORS properly
- [ ] Add input validation
- [ ] Setup database backups
- [ ] Monitor server logs
- [ ] Test all functionality
- [ ] Setup domain DNS
- [ ] Configure backups strategy

---

## Monitoring

### Heroku Logs
```bash
heroku logs --tail
```

### PM2 Monitoring (Self-hosted)
```bash
pm2 monit
```

### Performance Monitoring
- Consider adding tools like New Relic, DataDog, or Scout

---

## Scaling Tips

1. **Database**: Migrate to MongoDB or PostgreSQL
2. **Caching**: Add Redis for session storage
3. **Load Balancing**: Use multiple instances with load balancer
4. **CDN**: Serve static assets via CloudFlare
5. **Containerization**: Use Docker for consistency

---

## Backup Strategy

### Backup `/data/` directory
```bash
# Daily backups
0 2 * * * tar -czf /backups/canya-$(date +\%Y\%m\%d).tar.gz /path/to/data/
```

### MongoDB Atlas Backups
- Automatic daily backups included
- Can restore to any point in time

---

## Troubleshooting Deployment

### App crashes on startup
```bash
heroku logs --tail
# Check for missing dependencies or environment variables
```

### Port already in use
```bash
kill -9 $(lsof -ti :3000)
```

### Permission denied errors
```bash
sudo chown -R $USER:$USER /path/to/canya
chmod -R 755 /path/to/canya
```

---

## Support

For deployment questions:
- Heroku Docs: https://devcenter.heroku.com/
- Railway Docs: https://docs.railway.app/
- AWS EC2 Guide: https://aws.amazon.com/ec2/getting-started/

