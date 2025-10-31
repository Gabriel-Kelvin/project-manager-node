# Project Management App - Frontend

Modern React frontend for the Project Management application with authentication, dashboard, and project management features.

## 🚀 Features

- ✅ **Authentication** - Login & Signup with JWT
- ✅ **Protected Routes** - Role-based access control
- ✅ **Dashboard** - Overview of projects and tasks
- ✅ **Modern UI** - TailwindCSS with smooth animations
- ✅ **State Management** - Zustand for global state
- ✅ **API Integration** - Axios with interceptors
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Toast Notifications** - User feedback system
- ✅ **Error Boundary** - Graceful error handling

## 📦 Technologies

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the `frontend` directory:

```bash
REACT_APP_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm start
```

The app will run on **http://localhost:3000**

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/       # Reusable components
│   │   ├── ErrorBoundary.js
│   │   ├── Layout.js
│   │   ├── Loading.js
│   │   ├── ProtectedRoute.js
│   │   └── Toast.js
│   ├── pages/            # Page components
│   │   ├── Dashboard.js
│   │   ├── Login.js
│   │   ├── Signup.js
│   │   └── NotFound.js
│   ├── services/         # API services
│   │   └── api.js
│   ├── store/            # Zustand stores
│   │   └── authStore.js
│   ├── utils/            # Helper functions
│   │   └── helpers.js
│   ├── App.js            # Main app component
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Key Components

### Authentication
- **Login Page** - Username/password login
- **Signup Page** - User registration with validation
- **Auth Store** - Manages user state and tokens

### Layout
- **Header** - Logo, user info, logout button
- **Sidebar** - Navigation menu (Dashboard, Projects, Analytics, Settings)
- **Responsive** - Mobile-friendly with hamburger menu

### Dashboard
- **Statistics Cards** - Total projects, tasks, completed, in progress
- **Recent Projects** - List with progress bars
- **My Tasks** - Assigned tasks across projects

### Utilities
- **Toast** - Success/error notifications
- **Loading** - Spinner components
- **Error Boundary** - Catches and displays errors
- **Protected Route** - Requires authentication

## 🔐 Authentication Flow

1. **Login/Signup** - User provides credentials
2. **Token Storage** - JWT stored in localStorage
3. **Auto-Verify** - Token validated on app load
4. **Interceptor** - Token added to all API requests
5. **401 Handler** - Redirects to login on token expiry

## 🎯 API Integration

All API calls are centralized in `services/api.js`:

```javascript
// Auth
auth.signup(username, password, email)
auth.login(username, password)
auth.logout()

// Dashboard
dashboard.getSummary()

// Projects
projects.getAll()
projects.create(data)

// Tasks
tasks.getAll(projectId)
tasks.updateStatus(projectId, taskId, status)

// More...
```

## 🎨 Styling

### TailwindCSS Configuration
- **Custom colors** - Primary, success, warning, danger
- **Animations** - Fade-in, slide-up, slide-down
- **Status badges** - Todo, in-progress, completed
- **Priority badges** - Low, medium, high
- **Role badges** - Owner, manager, developer, viewer

### Custom CSS Classes
```css
.btn-primary      /* Primary button */
.btn-secondary    /* Secondary button */
.card             /* Card container */
.input            /* Form input */
.status-*         /* Status badges */
.priority-*       /* Priority badges */
.role-*           /* Role badges */
```

## 📝 Available Scripts

```bash
npm start         # Start development server
npm run build     # Build for production
npm test          # Run tests
npm run eject     # Eject from CRA (not recommended)
```

## 🔧 Configuration Files

### tailwind.config.js
- Custom theme configuration
- Extended colors
- Custom animations

### postcss.config.js
- TailwindCSS processing
- Autoprefixer for browser compatibility

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Deploy Options
- **Vercel** - Recommended for React apps
- **Netlify** - Great for static sites
- **AWS S3 + CloudFront** - Scalable solution
- **GitHub Pages** - Free hosting

## 🧪 Testing

### Manual Testing Checklist

1. **Signup**
   - [ ] Create new account
   - [ ] Validation works
   - [ ] Redirects to dashboard

2. **Login**
   - [ ] Login with credentials
   - [ ] Error handling
   - [ ] Token stored

3. **Dashboard**
   - [ ] Statistics display
   - [ ] Projects list loads
   - [ ] Tasks list loads

4. **Navigation**
   - [ ] Sidebar links work
   - [ ] Protected routes redirect
   - [ ] 404 page shows

5. **Logout**
   - [ ] Logout clears token
   - [ ] Redirects to login

## 🐛 Troubleshooting

### Common Issues

**Issue: "Cannot find module"**
```bash
npm install
```

**Issue: "Port 3000 already in use"**
```bash
# Change port in .env
PORT=3001
```

**Issue: "API connection failed"**
- Check backend is running on port 8000
- Verify REACT_APP_API_URL in .env

**Issue: "Token expired"**
- Logout and login again
- Token auto-refreshes on valid requests

## 📚 Resources

- [React Documentation](https://react.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [React Router Docs](https://reactrouter.com)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Axios Docs](https://axios-http.com)

## 🎉 Next Steps

After completing this setup:

1. **Run the backend** - Start FastAPI server on port 8000
2. **Run the frontend** - Start React app on port 3000
3. **Create an account** - Signup with username/email/password
4. **Explore dashboard** - View projects and tasks
5. **Build features** - Projects list, task management, etc.

## 📞 Support

For issues or questions, refer to:
- Backend README: `../backend/README.md`
- Complete Guide: `../COMPLETE_GUIDE.md`

---

**Happy Coding!** 🚀

