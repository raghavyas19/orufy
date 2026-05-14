# Productr - Product Management Platform

A modern, production-ready React + Vite + TypeScript application for managing products with a clean, scalable architecture.

## Tech Stack

- **React 19.2** - UI framework
- **React Router DOM 7.2** - Client-side routing
- **Vite 7.3** - Fast build tool
- **TypeScript 5.8** - Type safety
- **Tailwind CSS 4.2** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **React Query 5.83** - Server state management
- **React Hook Form 7.71** - Form handling
- **Zod 3.24** - Schema validation
- **ESLint & Prettier** - Code quality

## Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Radix UI component library
│   │   └── Logo.tsx      # App branding
│   ├── pages/            # Route components
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── layouts/          # Layout components
│   │   └── AppLayout.tsx # Main app layout with sidebar
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── services/         # API and external services
│   ├── assets/           # Images and static files
│   ├── App.tsx           # Root app component
│   ├── main.tsx          # Entry point
│   └── styles.css        # Global styles
└── index.html            # HTML template
```

## Getting Started

### Prerequisites

- Node.js 18+ (npm is the only package manager)
- No Bun required

### Installation

```bash
cd frontend
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

### Build

Create a production build:

```bash
npm run build
npm run preview  # Preview the build locally
```

### Code Quality

```bash
npm run lint      # Run ESLint
npm run format    # Format with Prettier
```

## Features

### 🔐 Authentication
- OTP-based login flow
- Email/phone number verification
- Hardcoded OTP for demo: `123456`

### 📦 Product Management
- View all products
- Filter by published/unpublished status
- Add new products
- Edit product details
- Delete products
- Toggle publish status
- Product details: name, type, stock, pricing, images, exchange eligibility

### 🎨 UI/UX
- Modern, responsive design
- Tailored color scheme with CSS variables
- Accessible components (Radix UI)
- Toast notifications
- Modal dialogs
- Smooth transitions

### 🚀 Performance
- Fast build and dev server (Vite)
- Optimized CSS (~10 KB gzipped)
- Code splitting
- Tree-shaking

## Environment

This is a **client-side only application**. All state is managed locally with React and React Query.

For backend integration:
1. Create services in `src/services/`
2. Use React Query hooks for data fetching
3. Environment variables can be added to `.env` files

## Customization

### Theme Colors

Edit `src/styles.css` to customize the color scheme. All colors use CSS custom properties and oklch format.

### Route Configuration

Modify `src/App.tsx` to add/remove routes.

### Components

Add new components to `src/components/` and organize by feature.

## Production Deployment

### Build Optimization

```bash
npm run build  # Creates optimized dist/ folder
```

### Hosting Options

- **Netlify**: Connect GitHub repo, set build command to `npm run build`
- **Vercel**: Similar setup to Netlify
- **Static hosting**: Deploy `dist/` folder to any static host

## Code Quality

- **Strict TypeScript**: Strict mode enabled
- **ESLint**: React and TypeScript rules
- **Prettier**: Consistent formatting
- **No unused imports**: Auto-cleanup recommended

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Learning

This project demonstrates:
- ✅ Clean React architecture
- ✅ Modern TypeScript patterns
- ✅ Vite as build tool
- ✅ React Router for SPA navigation
- ✅ Tailwind CSS for styling
- ✅ Component composition
- ✅ Custom hooks

## License

Private project © 2026

## Support

For issues or questions about the codebase, refer to the refactoring summary in the repository notes.
