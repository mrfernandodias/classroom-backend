import express from 'express';

const app = express();
const PORT = 8000;

// Middleware para parsear JSON
// Em Laravel seria: $request->json() ou middleware de JSON automático
app.use(express.json());

// Rota raiz - equivalente a Route::get('/', ...) no Laravel
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Classroom API!' });
});

// Inicia o servidor - equivalente a php artisan serve
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
