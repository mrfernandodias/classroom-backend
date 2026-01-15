import { corsConfig, PORT } from './config';
import { sanitizeBody, sanitizeQuery } from './middlewares';
import subjectsRouter from './routes/subjects';
import express from 'express';

const app = express();

// Middlewares globais
app.use(corsConfig);
app.use(express.json());
app.use(sanitizeQuery); // Sanitiza query params automaticamente
app.use(sanitizeBody); // Sanitiza body automaticamente

// Routes
app.use('/api/subjects', subjectsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Classroom API!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
