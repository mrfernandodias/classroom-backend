import express from 'express';

import { corsConfig, PORT } from './config';
import subjectsRouter from './routes/subjects';

const app = express();

// Middlewares
app.use(corsConfig);
app.use(express.json());

// Routes
app.use('/api/subjects', subjectsRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Classroom API!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
