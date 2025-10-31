# Project Manager Application

Full-stack project management application with Node.js/Express backend and React/Vite frontend.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Supabase account (for database)

### 1. Clone the Repository
```bash
git clone https://github.com/Gabriel-Kelvin/project-manager-node.git
cd project-manager-node
```

### 2. Environment Setup
```bash
# Copy environment template
cp backend/ENV.sample backend/.env

# Edit backend/.env with your Supabase credentials
nano backend/.env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase service role or anon key
- `JWT_SECRET` - Secret key for JWT token generation
- `CORS_ORIGINS` - Comma-separated list of allowed origins (e.g., `http://3.85.144.221:3005`)

### 3. Build and Run
```bash
docker-compose up --build
```

Or run in background:
```bash
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://3.85.144.221:3005
- **Backend API**: http://3.85.144.221:8010
- **Health Check**: http://3.85.144.221:8010/health

## 📁 Project Structure

```
project-manager-node/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   └── shared/      # Shared utilities
│   ├── Dockerfile
│   └── ENV.sample
├── frontend/            # React/Vite frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── services/    # API services
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.production
└── docker-compose.yml   # Container orchestration
```

## 🛠 Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

## 🐳 Docker Commands

```bash
# Build and start
docker-compose up --build

# Start in background
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build --no-cache backend
docker-compose up -d backend
```

## 📝 Notes

- Frontend runs on port 3005 (mapped from container port 80)
- Backend runs on port 8010
- Nginx in frontend container proxies `/api/*` requests to backend:8010
- Ensure CORS_ORIGINS includes your frontend URL

