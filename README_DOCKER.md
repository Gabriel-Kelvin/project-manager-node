# Project Manager - Docker Setup

This project has been dockerized for easy deployment. Both frontend (React) and backend (Node.js/Express) are containerized and can be run with a single command.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Supabase account with project configured

### Steps to Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gabriel-Kelvin/project-manager-node.git
   cd project-manager-node
   ```

2. **Create environment files**
   
   Create `.env` in the root:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_supabase_anon_public_key_here
   REACT_APP_API_URL=http://3.85.144.221:8010
   ```

   Create `backend_node/.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=your_supabase_anon_public_key_here
   APP_HOST=0.0.0.0
   APP_PORT=8010
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3005 (or http://3.85.144.221:3005)
   - Backend: http://localhost:8010 (or http://3.85.144.221:8010)

## 📦 Ports

- **Backend:** 8010
- **Frontend:** 3005

## 📚 Detailed Documentation

For complete deployment instructions, see [DOCKER.md](DOCKER.md)

