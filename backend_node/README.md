# Project Management API - Node.js Backend

This is the Node.js/Express version of the Project Management API backend. It provides the same endpoints and functionality as the Python FastAPI backend.

## Prerequisites

- **Node.js** version 18 or higher (check with `node --version`)
- **npm** (comes with Node.js)
- A **Supabase** account and project with the database schema already set up

## Quick Start

### 1. Install Dependencies

```bash
cd backend_node
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend_node` directory:

```bash
# Copy from backend/.env or use these values:
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_public_key_here
APP_HOST=0.0.0.0
APP_PORT=8000
```

**To get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_KEY`

### 3. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:8000` (or your configured port).

## API Endpoints

All endpoints are identical to the Python FastAPI backend:

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `GET /auth/verify` - Verify token
- `GET /auth/me` - Get current user

### Projects
- `POST /projects` - Create project
- `GET /projects` - Get all user projects
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `GET /projects/:id/stats` - Get project statistics

### Tasks
- `POST /projects/:id/tasks` - Create task
- `GET /projects/:id/tasks` - Get all tasks
- `GET /projects/:id/tasks/:tid` - Get task details
- `PUT /projects/:id/tasks/:tid` - Update task
- `PATCH /projects/:id/tasks/:tid/status` - Update task status
- `DELETE /projects/:id/tasks/:tid` - Delete task

### Team Members
- `POST /projects/:id/members` - Add team member
- `GET /projects/:id/members` - Get all members
- `GET /projects/:id/members/:username` - Get member details
- `PUT /projects/:id/members/:username` - Update member role
- `DELETE /projects/:id/members/:username` - Remove member
- `GET /projects/:id/members/:username/permissions` - Get member permissions

### Analytics
- `GET /projects/:id/analytics` - Get project analytics
- `GET /projects/:id/analytics/timeline` - Get progress timeline
- `GET /projects/:id/analytics/member/:username` - Get member analytics

### Dashboard
- `GET /dashboard` - Get user dashboard
- `GET /dashboard/summary` - Get quick summary
- `GET /dashboard/recent-activity` - Get recent activity

## Health Check

- `GET /` - API information
- `GET /health` - Health check endpoint

## Switching from Python to Node.js Backend

1. **Stop the Python backend** (if running)
2. **Start the Node.js backend** following the steps above
3. **No frontend changes needed** - all API endpoints and responses are identical
4. **Database unchanged** - uses the same Supabase connection

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
- Change `APP_PORT` in `.env` to a different port
- Or stop the process using port 8000

### Missing Environment Variables
Make sure your `.env` file exists in `backend_node/` and contains:
- `SUPABASE_URL`
- `SUPABASE_KEY`

### Connection Errors
- Verify your Supabase credentials are correct
- Check that your Supabase project is active
- Ensure your database schema matches the expected structure

## Project Structure

```
backend_node/
├── src/
│   ├── server.js          # Main Express server
│   ├── routes/            # API route handlers
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── tasks.js
│   │   ├── roles.js
│   │   ├── analytics.js
│   │   └── dashboard.js
│   └── utils/             # Utility functions
│       ├── supabase.js    # Supabase client
│       ├── auth.js        # Auth helpers
│       ├── middleware.js # Auth middleware
│       └── permissions.js # RBAC system
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

