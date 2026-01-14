import { relations } from 'drizzle-orm';
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

// ============================================================
// ENUMS
// ============================================================

// Enum para roles de usuário - equivalente ao enum no Laravel migrations
export const roleEnum = pgEnum('role', ['student', 'teacher', 'admin']);

// ============================================================
// TABLES
// ============================================================

/**
 * User table - Tabela de usuários do Better Auth
 * Em Laravel seria: Schema::create('users', function (Blueprint $table) {...})
 */
export const user = pgTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('email_verified', { mode: 'date' }),
    image: text('image'),

    // Custom fields - Campos extras além do Better Auth
    role: roleEnum('role').default('student').notNull(),
    imageCldPubId: text('image_cld_pub_id'), // Cloudinary public ID (nullable)

    // Timestamps - equivalente a $table->timestamps() no Laravel
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex('user_email_idx').on(table.email)]
);

/**
 * Session table - Sessões de autenticação
 * Em Laravel seria a tabela 'sessions' do Sanctum/Passport
 */
export const session = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),

    // Foreign key para user
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('session_user_id_idx').on(table.userId),
    uniqueIndex('session_token_idx').on(table.token),
  ]
);

/**
 * Account table - Contas OAuth (Google, GitHub, etc.)
 * Em Laravel seria equivalente às social accounts do Socialite
 */
export const account = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'date' }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { mode: 'date' }),
    scope: text('scope'),
    password: text('password'),

    // Foreign key para user
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('account_user_id_idx').on(table.userId),
    uniqueIndex('account_provider_account_idx').on(table.providerId, table.accountId),
  ]
);

/**
 * Verification table - Tokens de verificação (email, reset password, etc.)
 * Em Laravel seria equivalente à tabela 'password_reset_tokens'
 */
export const verification = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),

    // Timestamps
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('verification_identifier_idx').on(table.identifier),
    uniqueIndex('verification_value_idx').on(table.value),
  ]
);

// ============================================================
// RELATIONS
// ============================================================

/**
 * User relations - Relacionamentos do usuário
 * Em Laravel seria: public function sessions() { return $this->hasMany(Session::class); }
 */
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

/**
 * Session relations
 * Em Laravel seria: public function user() { return $this->belongsTo(User::class); }
 */
export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

/**
 * Account relations
 */
export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ============================================================
// TYPES
// ============================================================

// Tipos inferidos - equivalente aos Models tipados do Laravel
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type Role = 'student' | 'teacher' | 'admin';
