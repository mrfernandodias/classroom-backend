import cors from 'cors';

// Configuração do CORS - Cross-Origin Resource Sharing
// Permite que o frontend acesse o backend de outro domínio/porta
// Em Laravel seria: config/cors.php

// Valida se a URL do frontend está configurada
if (!process.env.FRONTEND_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL não definida no .env');
  }
  console.warn('⚠️ FRONTEND_URL não definida, usando padrão: http://localhost:3000');
}

export const corsConfig = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
