# Project Management Application

A modern, full-stack project management application built with React, FastAPI, and Supabase. Features comprehensive project and task management, team collaboration, analytics, and real-time updates.

![Project Management App](https://via.placeholder.com/800x400/3B82F6/FFFFFF?text=Project+Management+App)

## 🚀 Features

### Core Functionality
- **Project Management** - Create, organize, and track projects
- **Task Management** - Assign, prioritize, and monitor tasks
- **Team Collaboration** - Role-based access control and team management
- **Real-time Analytics** - Comprehensive project and team performance insights
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Advanced Features
- **Global Search** - Search across projects, tasks, and team members
- **Notification System** - Real-time notifications and email alerts
- **File Attachments** - Upload and manage project files
- **Export Functionality** - Export data as PDF or CSV
- **Dark Mode** - Optional dark theme support
- **Keyboard Shortcuts** - Power user features

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icon library

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Python 3.9+** - Modern Python with type hints
- **Pydantic** - Data validation and settings management
- **JWT** - Secure authentication tokens

### Infrastructure
- **PostgreSQL** - Robust relational database
- **Redis** - Caching and session storage (optional)
- **Docker** - Containerization support
- **Nginx** - Reverse proxy and static file serving

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm
- **Python** 3.9+
- **Git**
- **Supabase account** (free tier available)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/project-management-app.git
cd project-management-app
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the backend
python run.py
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend URL

# Start the development server
npm start
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## 🗄️ Database Setup

### Supabase Setup (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API keys

2. **Run Database Migrations**
   ```sql
   -- Copy and run the SQL from backend/database/schema.sql
   -- This will create all necessary tables and indexes
   ```

3. **Configure Environment Variables**
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Local PostgreSQL Setup

1. **Install PostgreSQL**
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Windows
   # Download from postgresql.org
   ```

2. **Create Database**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE project_management;
   CREATE USER pm_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE project_management TO pm_user;
   \q
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
DEBUG=True

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

#### Frontend (.env)
```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development

# Optional: Analytics
REACT_APP_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## 📱 Usage

### Getting Started

1. **Sign Up** - Create a new account with username, email, and password
2. **Create Project** - Start by creating your first project
3. **Add Team Members** - Invite team members with appropriate roles
4. **Create Tasks** - Add tasks and assign them to team members
5. **Track Progress** - Monitor progress through the dashboard and analytics

### User Roles

- **Owner** - Full project control, can delete projects
- **Manager** - Can manage team and tasks, cannot delete projects
- **Developer** - Can manage assigned tasks
- **Viewer** - Read-only access to project information

### Key Features

#### Dashboard
- **Quick Stats** - Overview of your projects and tasks
- **Recent Projects** - Latest project activity
- **My Tasks** - Your assigned tasks with filtering
- **Activity Feed** - Real-time project updates

#### Project Management
- **Project Overview** - Detailed project information
- **Task Management** - Create, assign, and track tasks
- **Team Management** - Add/remove team members
- **Analytics** - Project performance insights

#### Task Management
- **Task Creation** - Rich task creation with priorities and due dates
- **Status Updates** - Easy task status management
- **Filtering & Search** - Find tasks quickly
- **Bulk Operations** - Manage multiple tasks at once

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testNamePattern="Auth"
```

### API Testing
```bash
# Test with curl
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'

# Test with Postman
# Import the provided Postman collection
```

## 🚀 Deployment

### Production Deployment

See the comprehensive [Deployment Guide](DEPLOYMENT.md) for detailed deployment instructions.

#### Quick Deploy Options

**Backend:**
- [Railway](https://railway.app) - One-click deployment
- [Render](https://render.com) - Free tier available
- [Heroku](https://heroku.com) - Easy deployment
- [DigitalOcean](https://digitalocean.com) - Full control

**Frontend:**
- [Vercel](https://vercel.com) - Optimized for React
- [Netlify](https://netlify.com) - Great for static sites
- [Cloudflare Pages](https://pages.cloudflare.com) - Fast global CDN

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or build individual containers
docker build -t pm-backend ./backend
docker build -t pm-frontend ./frontend
```

## 📚 Documentation

- [API Documentation](backend/API_DOCS.md) - Complete API reference
- [Features Documentation](frontend/FEATURES.md) - Detailed feature list
- [Deployment Guide](DEPLOYMENT.md) - Production deployment guide
- [Contributing Guide](CONTRIBUTING.md) - How to contribute

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Run the test suite: `npm test` and `pytest`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- **Python:** Follow PEP 8, use Black for formatting
- **JavaScript:** Follow ESLint rules, use Prettier for formatting
- **CSS:** Follow Tailwind CSS conventions
- **Commits:** Use conventional commit messages

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- **Description** - Clear description of the bug
- **Steps to Reproduce** - How to reproduce the issue
- **Expected Behavior** - What should happen
- **Actual Behavior** - What actually happens
- **Environment** - OS, browser, version information
- **Screenshots** - If applicable

## 💡 Feature Requests

Have an idea for a new feature? Please create an issue with:
- **Feature Description** - What you'd like to see
- **Use Case** - Why this feature would be useful
- **Acceptance Criteria** - How you'd know it's complete
- **Mockups** - If you have design ideas

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FastAPI** - For the excellent Python web framework
- **React** - For the powerful frontend library
- **Supabase** - For the amazing backend-as-a-service
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library

## 📞 Support

- **Documentation:** [docs.yourdomain.com](https://docs.yourdomain.com)
- **Issues:** [GitHub Issues](https://github.com/yourusername/project-management-app/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/project-management-app/discussions)
- **Email:** support@yourdomain.com

## 🗺️ Roadmap

### Version 2.0 (Planned)
- [ ] Real-time collaboration with WebSockets
- [ ] Advanced reporting and analytics
- [ ] Mobile app (React Native)
- [ ] Integration with external tools (Slack, GitHub, etc.)
- [ ] Advanced project templates
- [ ] Time tracking and billing
- [ ] Advanced permissions system
- [ ] API webhooks

### Version 1.1 (Next)
- [ ] File attachments
- [ ] Task comments and mentions
- [ ] Calendar view
- [ ] Gantt charts
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Project templates
- [ ] Bulk operations

## 📊 Project Status

![GitHub last commit](https://img.shields.io/github/last-commit/yourusername/project-management-app)
![GitHub issues](https://img.shields.io/github/issues/yourusername/project-management-app)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/project-management-app)
![GitHub stars](https://img.shields.io/github/stars/yourusername/project-management-app)
![GitHub forks](https://img.shields.io/github/forks/yourusername/project-management-app)

---

**Made with ❤️ by [Your Name](https://github.com/yourusername)**

*Last updated: January 19, 2025*
