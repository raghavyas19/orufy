# Orufy Backend

Express + MongoDB backend for the Orufy frontend. Production-ready with JWT OTP auth via Resend, Cloudinary uploads, and REST APIs for dynamic frontend content.

Quick start

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run in development:

```bash
npm run dev
```

4. Seed sample data:

```bash
npm run seed
```

Environment variables

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `CLOUDINARY_*` (optional)

Deployment

The project uses environment variables and port detection and is ready for Render or Railway.
For local development, the example setup uses `PORT=3000` and the frontend defaults to `http://localhost:3000`.

APIs

- `POST /api/auth/send-otp` — { email }
- `POST /api/auth/verify-otp` — { email, otp }
- `GET /api/products` — list
- `GET /api/products/:id` — single
- `POST /api/products` — create (auth)
- `PUT /api/products/:id` — update (auth)
- `DELETE /api/products/:id` — delete (auth)

Image uploads: `POST /api/uploads` supports `multipart/form-data` with `images` field. Uses Cloudinary when configured, otherwise saves to `uploads/`.
