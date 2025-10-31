# Docker Deployment Guide

This guide explains how to deploy the Project Management Application using Docker.

## 📋 Prerequisites

- **Docker** 20.10+ installed
- **Docker Compose** 2.0+ installed
- **Supabase account** with project configured
- **Git** installed (for cloning)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Gabriel-Kelvin/project-manager-node.git
cd project-manager-node
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_public_key_here

# Frontend API URL
# For production: http://3.85.144.221:8010
# For local: http://localhost:8010
REACT_APP_API_URL=http://3.85.144.221:8010
```

**To get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`

### 3. Create Backend Environment File

Create a `.env` file in the `backend_node` directory:

```bash
cd backend_node
cp .env.example .env
```

Edit `backend_node/.env`:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_public_key_here
APP_HOST=0.0.0.0
APP_PORT=8010
```

### 4. Build and Run with Docker Compose

```bash
# From the root directory
docker-compose up --build
```

This will:
- Build both frontend and backend Docker images
- Start both containers
- Expose:
  - Backend on port **8010**
  - Frontend on port **3005**

### 5. Access the Application

- **Frontend:** http://localhost:3005 (or http://3.85.144.221:3005)
- **Backend API:** http://localhost:8010 (or http://3.85.144.221:8010)
- **Health Check:** http://localhost:8010/health

## 🐳 Docker Commands

### Start Services

```bash
docker-compose up
```

### Start in Background (Detached Mode)

```bash
docker-compose up -d
```

### Rebuild and Start

```bash
docker-compose up --build
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend

# Follow logs
docker-compose logs -f
```

### Restart Services

```bash
docker-compose restart
```

### Rebuild Specific Service

```bash
docker-compose build backend
docker-compose build frontend
```

## 🔧 Configuration

### Port Configuration

The application is configured to run on:
- **Backend:** Port 8010
- **Frontend:** Port 3005

To change ports, edit `docker-compose.yml`:

```yaml
services:
  backend:
    ports:
      - "YOUR_PORT:8010"  # Change YOUR_PORT to desired port
  
  frontend:
    ports:
      - "YOUR_PORT:3005"  # Change YOUR_PORT to desired port
```

### Environment Variables

#### Root `.env` (for docker-compose)
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `REACT_APP_API_URL` - API URL for frontend (used during build)

#### `backend_node/.env`
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon/public key
- `APP_HOST` - Server host (default: 0.0.0.0)
- `APP_PORT` - Server port (default: 8010)

## 📦 Production Deployment on VM

### Step 1: SSH into Your VM

```bash
ssh user@3.85.144.221
```

### Step 2: Install Docker (if not already installed)

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes
```

### Step 3: Clone Repository

```bash
git clone https://github.com/Gabriel-Kelvin/project-manager-node.git
cd project-manager-node
```

### Step 4: Configure Environment

```bash
# Create .env file
nano .env

# Add your configuration:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_public_key_here
REACT_APP_API_URL=http://3.85.144.221:8010

# Create backend .env
cd backend_node
nano .env

# Add:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_public_key_here
APP_HOST=0.0.0.0
APP_PORT=8010

cd ..
```

### Step 5: Configure Firewall

Ensure ports 8010 and 3005 are open:

```bash
# Ubuntu (UFW)
sudo ufw allow 8010/tcp
sudo ufw allow 3005/tcp
sudo ufw reload

# Or iptables
sudo iptables -A INPUT -p tcp --dport 8010 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3005 -j ACCEPT
```

### Step 6: Build and Start

```bash
docker-compose up --build -d
```

### Step 7: Verify Deployment

```bash
# Check containers are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test endpoints
curl http://localhost:8010/health
curl http://localhost:3005
```

### Step 8: Access Application

- **Frontend:** http://3.85.144.221:3005
- **Backend API:** http://3.85.144.221:8010

## 🔄 Updating Application

### Pull Latest Changes

```bash
git pull origin main
docker-compose up --build -d
```

### Update Specific Service

```bash
# Update backend
docker-compose build backend
docker-compose up -d backend

# Update frontend
docker-compose build frontend
docker-compose up -d frontend
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
sudo lsof -i :8010
sudo lsof -i :3005

# Kill the process or change ports in docker-compose.yml
```

### Container Won't Start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

# Restart containers
docker-compose restart
```

### Environment Variables Not Working

```bash
# Verify .env files exist
ls -la .env
ls -la backend_node/.env

# Check environment variables in container
docker-compose exec backend env
docker-compose exec frontend env
```

### Build Failures

```bash
# Clean build (removes cache)
docker-compose build --no-cache

# Remove old images and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

### Frontend Can't Connect to Backend

1. Verify `REACT_APP_API_URL` is set correctly in `.env`
2. Ensure backend is running: `curl http://localhost:8010/health`
3. Check CORS configuration in `backend_node/src/server.js`
4. Rebuild frontend after changing environment variables

### Database Connection Issues

1. Verify Supabase credentials in `.env`
2. Check Supabase project is active
3. Ensure database schema is set up correctly
4. Test connection:
   ```bash
   docker-compose exec backend node -e "console.log(process.env.SUPABASE_URL)"
   ```

## 📊 Health Checks

Both services include health checks:

- **Backend:** `GET http://localhost:8010/health`
- **Frontend:** `GET http://localhost:3005`

Check health:

```bash
curl http://localhost:8010/health
curl http://localhost:3005
```

## 🔒 Security Considerations

### Production Checklist

- [ ] Change default ports if needed
- [ ] Use HTTPS (setup reverse proxy with Nginx)
- [ ] Secure environment variables
- [ ] Enable firewall rules
- [ ] Use strong Supabase keys
- [ ] Regular security updates
- [ ] Monitor logs for suspicious activity

### Using Nginx as Reverse Proxy

For production, consider using Nginx:

```nginx
# /etc/nginx/sites-available/project-manager
server {
    listen 80;
    server_name 3.85.144.221;

    location /api {
        proxy_pass http://localhost:8010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📝 Notes

- Environment variables for React are baked into the build at build time
- If you change `REACT_APP_API_URL`, you need to rebuild the frontend
- Backend environment variables are read at runtime
- Both services restart automatically on failure (restart: unless-stopped)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check firewall settings
4. Ensure Docker and Docker Compose are up to date
5. Review this troubleshooting section

---

**Happy Deploying! 🚀**

