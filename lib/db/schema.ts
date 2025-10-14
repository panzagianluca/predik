import { pgTable, text, timestamp, uuid, boolean, numeric, index } from 'drizzle-orm/pg-core'

// User profiles table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  walletAddress: text('wallet_address').notNull().unique(),
  username: text('username').unique(),
  customAvatar: text('custom_avatar'), // URL to uploaded image in Vercel Blob
  twitterHandle: text('twitter_handle'),
  email: text('email'),
  emailVerified: boolean('email_verified').default(false),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Index for fast wallet address lookups
  walletAddressIdx: index('wallet_address_idx').on(table.walletAddress),
  // Index for username lookups
  usernameIdx: index('username_idx').on(table.username),
}))

// Email verification tokens table
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  // Index for fast token lookups
  tokenIdx: index('token_idx').on(table.token),
  // Index for user verification lookups
  userIdIdx: index('email_verification_user_id_idx').on(table.userId),
}))

// User trading stats table (for caching/performance)
export const userStats = pgTable('user_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  totalVolume: numeric('total_volume', { precision: 20, scale: 2 }).default('0'),
  marketsTraded: numeric('markets_traded').default('0'),
  lastTradeAt: timestamp('last_trade_at'),
  activeDays: numeric('active_days').default('0'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  // Index for fast user stats lookups
  userIdIdx: index('user_stats_user_id_idx').on(table.userId),
  // Index for sorting by volume (leaderboards)
  totalVolumeIdx: index('total_volume_idx').on(table.totalVolume),
  // Index for recent activity sorting
  lastTradeIdx: index('last_trade_idx').on(table.lastTradeAt),
}))
