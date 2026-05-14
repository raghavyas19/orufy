# Orufy

Full stack e-commerce platform. Built as a complete assignment covering frontend, backend, database, and deployment. Implements email-based authentication without passwords, product management with image handling, and protected API endpoints with JWT tokens.

## What I Built

- **Passwordless Auth with OTP**: Users sign in via email. Backend generates 6-digit OTP, sends via Resend, user verifies and receives JWT token.
- **Product CRUD**: Full create, read, update, delete with authorization. Public users can browse, only authenticated users can manage.
- **Image Upload System**: Up to 6 images per product. Integrates with Cloudinary for CDN + optimization, local fallback for development.
- **MongoDB Integration**: Product, User, Category schemas with proper relationships and timestamps.
- **Protected Routes**: JWT middleware validates requests. Admin operations require valid token.
- **Responsive Frontend**: Built with React + TypeScript + TailwindCSS. Works on mobile and desktop.

## Tech Stack

**Frontend**: React 19, Vite, TypeScript, TailwindCSS, React Hook Form, React Query

**Backend**: Node.js, Express, MongoDB + Mongoose, JWT, Resend, Multer, Cloudinary

## Project Structure

**Frontend** (`React + Vite`)
- `components/` — UI components  
- `pages/` — Login, Products, 404
- `context/` — Auth state
- `lib/` — API client
- `hooks/` — Custom React hooks

**Backend** (`Express + MongoDB`)
- `routes/` — API endpoints
- `controllers/` — Business logic
- `models/` — Mongoose schemas
- `middleware/` — Auth, uploads, error handling
- `services/` — Email, OTP helpers
- `config/` — DB, Cloudinary, Resend
- `utils/` — Image upload logic

## Getting Started

**Prerequisites**: Node.js 18+, MongoDB, Resend API key (optional: Cloudinary)

**Install**:
```bash
# Backend
cd backend && npm install

# Frontend  
cd ../frontend && npm install
```

**Environment Setup**:

Backend `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/orufy
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
RESEND_API_KEY=your_key
EMAIL_FROM=noreply@yourdomain.com
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:5000
```

**Run**:

Terminal 1 (Backend):
```bash
cd backend && npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:3000`

## API Endpoints

**Authentication**
- `POST /api/auth/send-otp` — Send OTP to email
- `POST /api/auth/verify-otp` — Verify OTP, return JWT token
- `GET /api/auth/me` — Get current user (requires token)

**Products**
- `GET /api/products` — List all products (public)
- `GET /api/products/:id` — Get product (public)
- `POST /api/products` — Create product (auth required)
- `PUT /api/products/:id` — Update product (auth required)
- `DELETE /api/products/:id` — Delete product (auth required)

**Categories**
- `GET /api/categories` — List categories (public)
- `POST /api/categories` — Create category (auth required)

**Uploads**
- `POST /api/uploads` — Upload images (returns URLs)

See [backend routes](./backend/src/routes/) for detailed parameters.

## How It Works

**Login Flow**: Email → OTP sent → OTP verified → JWT token → Token stored in localStorage → Used in Authorization header for protected endpoints.

**Product Management**: Authenticated users can create/update/delete products. Public can view.

**Images**: Upload to Cloudinary (with local fallback). Cloudinary optimizes and serves via CDN.

## Why These Choices

**OTP instead of passwords**: Simpler implementation, no password reset complexity, better UX for MVP.

**Cloudinary**: Image optimization, CDN delivery, scalable. Local fallback works for dev without credentials.

**JWT**: Stateless auth. No session storage needed. Token validated on every request.

**Modular backend**: Controllers → business logic, Services → email/OTP, Middleware → auth/uploads. Easier to test and extend.

**React Query**: Handles API state caching, refetch, loading states automatically. Less boilerplate.

**TypeScript**: Catches type errors early. Better IDE support and prevents runtime bugs.

## Deployment

**Backend**: Use Render, Railway, or similar. Supports GitHub auto-deploy.

**Frontend**: Vercel or Netlify. Set `VITE_API_URL` to deployed backend URL.

**Database**: MongoDB Atlas (cloud) or local MongoDB.

**Before deploying**: Set `NODE_ENV=production`, strong `JWT_SECRET`, production credentials.

## Troubleshooting

**OTP not arriving?** Verify `RESEND_API_KEY` in `.env`. Check spam folder.

**Images not uploading?** Check Cloudinary credentials or `backend/uploads/` folder permissions.

**Backend won't start?** Check `MONGO_URI` and ensure MongoDB is running.

**Frontend can't reach backend?** Verify `VITE_API_URL` and backend CORS settings.

