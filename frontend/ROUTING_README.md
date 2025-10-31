# React Router Setup Documentation

This document explains the React Router implementation for the CRM frontend application.

## Routes Overview

The application includes the following routes:

### Public Routes (No Authentication Required)
- `/login` - User login page
- `/signup` - User registration page

### Protected Routes (Authentication Required)
- `/dashboard` - Main dashboard with statistics and overview
- `/leads` - Lead management page
- `/deals` - Deal management page
- `/tasks` - Task management page
- `/users` - User management page

### Default Routes
- `/` - Redirects to dashboard (if authenticated) or login (if not authenticated)
- `*` - Catch-all route that redirects appropriately

## Route Structure

```jsx
<Router>
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    
    {/* Protected routes */}
    <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
    <Route path="/leads" element={<Layout><Leads /></Layout>} />
    <Route path="/deals" element={<Layout><Deals /></Layout>} />
    <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
    <Route path="/users" element={<Layout><Users /></Layout>} />
    
    {/* Default redirects */}
    <Route path="/" element={<Navigate to="/dashboard" />} />
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>
</Router>
```

## Authentication Flow

### Current Implementation
- Authentication state is controlled by `isAuthenticated` boolean in `App.jsx`
- Currently set to `false` for testing login/signup pages
- Set to `true` to test protected routes

### Future Implementation
The authentication should be implemented using:
- Context API or Redux for global state management
- JWT token validation
- Automatic token refresh
- Persistent login state

## Layout Components

### Shared Layout Structure
```
Layout
├── Sidebar (Navigation)
├── Navbar (Top navigation with search, notifications, profile)
└── Main Content (Page-specific content)
```

### Sidebar Navigation
- **Dashboard** - Overview and statistics
- **Leads** - Lead management
- **Deals** - Deal tracking
- **Tasks** - Task management
- **Analytics** - Reports and analytics (placeholder)
- **Users** - User management
- **Settings** - Application settings (placeholder)

### Navbar Features
- **Search Bar** - Global search functionality
- **Notifications** - Real-time notifications with unread count
- **Profile Dropdown** - User profile and account options

## Page Components

### Authentication Pages
- **Login** (`/login`)
  - Email/password form
  - Remember me checkbox
  - Forgot password link
  - Link to signup page

- **Signup** (`/signup`)
  - Full name, email, password fields
  - Password confirmation
  - Terms and conditions checkbox
  - Link to login page

### CRM Pages
- **Dashboard** (`/dashboard`)
  - Statistics cards with trends
  - Recent activity timeline
  - Quick action buttons
  - Recent leads table

- **Leads** (`/leads`)
  - Leads table with filtering
  - Search functionality
  - Status indicators
  - Add/edit/delete actions

- **Deals** (`/deals`)
  - Deals table with stage tracking
  - Value formatting
  - Close date tracking
  - Lead association

- **Tasks** (`/tasks`)
  - Task management table
  - Type and status indicators
  - Due date tracking
  - Overdue highlighting

- **Users** (`/users`)
  - User management table
  - Role-based access control
  - Status indicators
  - Last login tracking

## Navigation Features

### Active Route Highlighting
- Current route is highlighted in the sidebar
- Uses `useLocation` hook to determine active route
- Visual indicators with primary color and border

### Mobile Responsiveness
- Collapsible sidebar on mobile devices
- Hamburger menu for mobile navigation
- Touch-friendly interface
- Responsive table layouts

### Search Functionality
- Global search bar in the navbar
- Placeholder for future search implementation
- Consistent styling across all pages

## State Management

### Current State
- Local component state for UI interactions
- No global state management yet
- Authentication state in App component

### Future State Management
Consider implementing:
- **Context API** for authentication state
- **Redux Toolkit** for complex state management
- **React Query** for server state management
- **Zustand** for lightweight state management

## Testing Routes

### Manual Testing
1. **Test Login Flow**:
   - Set `isAuthenticated = false` in App.jsx
   - Navigate to `/` - should redirect to `/login`
   - Test login form validation

2. **Test Protected Routes**:
   - Set `isAuthenticated = true` in App.jsx
   - Navigate to `/` - should redirect to `/dashboard`
   - Test all navigation links in sidebar

3. **Test Navigation**:
   - Click sidebar navigation items
   - Verify active state highlighting
   - Test mobile sidebar toggle

### Automated Testing
Consider adding:
- **React Testing Library** tests for route components
- **Cypress** for end-to-end route testing
- **Jest** for unit tests of routing logic

## Future Enhancements

### Route Guards
- Implement proper authentication guards
- Role-based route protection
- Permission-based access control

### Lazy Loading
- Implement code splitting for better performance
- Lazy load page components
- Preload critical routes

### Route Parameters
- Add dynamic routes for individual records
- Implement nested routing for complex pages
- Add query parameters for filtering and pagination

### Breadcrumbs
- Add breadcrumb navigation
- Show current page hierarchy
- Enable quick navigation to parent pages

## Integration with Backend

### API Integration
- Connect routes to backend API endpoints
- Implement proper error handling
- Add loading states for async operations

### Authentication Integration
- Connect to FastAPI authentication endpoints
- Implement JWT token management
- Add automatic token refresh

### Real-time Updates
- WebSocket integration for real-time notifications
- Live updates for collaborative features
- Optimistic UI updates

This routing setup provides a solid foundation for the CRM application with proper separation of concerns, responsive design, and extensibility for future enhancements.
