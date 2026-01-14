import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { db } from './index';

config();

async function reset() {
  console.log('🗑️  Dropping all tables...');

  // Desabilita verificação de FK temporariamente
  await db.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);

  // Remove tipos enum
  await db.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
      END LOOP;
    END $$;
  `);

  console.log('✅ All tables and enums dropped!');
  process.exit(0);
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});
