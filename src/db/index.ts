import * as schema from './schema';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';

// Carrega variáveis de ambiente - equivalente ao config() do Laravel
config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Cria conexão com Neon - equivalente ao DB::connection() do Laravel
const sql = neon(process.env.DATABASE_URL);

// Exporta instância do Drizzle com schema
// Em Laravel seria como ter o $db com todos os Models carregados
export const db = drizzle(sql, { schema });
