# CRM Frontend

A modern React frontend for the CRM system built with Vite, Tailwind CSS, and modern UI components.

## Features

- ⚡ **Vite** - Lightning fast build tool and dev server
- ⚛️ **React 18** - Latest React with modern features
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎯 **Heroicons** - Beautiful SVG icons
- 📱 **Responsive Design** - Mobile-first approach
- 🎭 **Modern UI Components** - Clean and professional design
- 🚀 **TypeScript Ready** - Full TypeScript support

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Heroicons** - Icons
- **Axios** - HTTP client
- **React Router DOM** - Routing
- **Headless UI** - Accessible UI components
- **Lucide React** - Additional icons
- **Recharts** - Charts and data visualization

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout component
│   └── Dashboard.jsx   # Dashboard component
├── App.jsx             # Main app component
├── main.jsx           # App entry point
└── style.css          # Global styles and Tailwind imports
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Design System

### Colors

The project uses a comprehensive color palette:

- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for neutral elements
- **Success**: Green tones for positive actions
- **Warning**: Orange tones for caution
- **Danger**: Red tones for destructive actions

### Typography

- **Font Family**: Inter (primary), JetBrains Mono (monospace)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across devices

### Components

#### Buttons
- `.btn` - Base button styles
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-success` - Success action button
- `.btn-warning` - Warning action button
- `.btn-danger` - Danger action button

#### Cards
- `.card` - Base card container
- `.card-header` - Card header section
- `.card-body` - Card content section
- `.card-footer` - Card footer section

#### Form Elements
- `.input` - Styled input fields

### Layout

The layout includes:

- **Sidebar Navigation** - Collapsible on mobile
- **Top Navigation** - User profile and notifications
- **Main Content Area** - Responsive content container
- **Mobile Responsive** - Optimized for all screen sizes

## Customization

### Tailwind Configuration

The `tailwind.config.js` file includes:

- Custom color palette
- Extended spacing
- Custom animations
- Box shadows
- Font families

### Adding New Components

1. Create component in `src/components/`
2. Import and use in your pages
3. Follow the existing design patterns
4. Use Tailwind classes for styling

### Styling Guidelines

- Use Tailwind utility classes
- Follow the established color scheme
- Maintain consistent spacing (4px grid)
- Use semantic HTML elements
- Ensure accessibility compliance

## Integration with Backend

The frontend is designed to work with the FastAPI backend:

- **API Base URL**: `http://localhost:8000`
- **Authentication**: JWT tokens
- **CORS**: Configured for development
- **Error Handling**: Comprehensive error states

## Development

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use meaningful component names
- Keep components focused and reusable
- Use TypeScript for type safety

### Performance

- Lazy load components when appropriate
- Optimize images and assets
- Use React.memo for expensive components
- Minimize bundle size

## Deployment

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Environment Variables

Create a `.env` file for environment-specific configuration:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=CRM System
```

## Contributing

1. Follow the established code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the CRM system and follows the same license terms.
