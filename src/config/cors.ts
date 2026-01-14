import cors from 'cors';

// CORS - Cross-Origin Resource Sharing
// Em Laravel seria: config/cors.php
export const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
