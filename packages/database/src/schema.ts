import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  numeric,
  index,
  integer,
  varchar,
  unique,
} from "drizzle-orm/pg-core";

// ============================================================================
// CORE TABLES
// ============================================================================

/**
 * Users - User profiles and authentication
 *
 * Stores user profile data linked to wallet addresses.
 * Dynamic handles wallet connection, this stores metadata.
 */
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    walletAddress: text("wallet_address").notNull().unique(),
    username: text("username").unique(),
    customAvatar: text("custom_avatar"), // URL to uploaded image in Vercel Blob
    twitterHandle: text("twitter_handle"),
    email: text("email"),
    emailVerified: boolean("email_verified").default(false),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    walletAddressIdx: index("wallet_address_idx").on(table.walletAddress),
    usernameIdx: index("username_idx").on(table.username),
  }),
);

/**
 * User Stats - Cached trading statistics for performance
 *
 * Computed/cached data to avoid expensive blockchain queries.
 */
export const userStats = pgTable(
  "user_stats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    totalVolume: numeric("total_volume", { precision: 20, scale: 2 }).default(
      "0",
    ),
    marketsTraded: numeric("markets_traded").default("0"),
    lastTradeAt: timestamp("last_trade_at"),
    activeDays: numeric("active_days").default("0"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_stats_user_id_idx").on(table.userId),
    totalVolumeIdx: index("total_volume_idx").on(table.totalVolume),
    lastTradeIdx: index("last_trade_idx").on(table.lastTradeAt),
  }),
);

/**
 * Email Verification Tokens - For email confirmation flow
 */
export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index("token_idx").on(table.token),
    userIdIdx: index("email_verification_user_id_idx").on(table.userId),
  }),
);

// ============================================================================
// MARKET METADATA (Predik's Curation Layer)
// ============================================================================

/**
 * Market Metadata - Predik's overrides on top of Myriad markets
 *
 * Stores Spanish translations, featured status, custom categories.
 * slug is the stable reference (matches Myriad URLs).
 * Does NOT store market state (open/closed) - that's Myriad's job.
 */
export const marketMetadata = pgTable(
  "market_metadata",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    myriadId: varchar("myriad_id", { length: 255 }).notNull().unique(), // Myriad's ID
    slug: varchar("slug", { length: 255 }).notNull().unique(), // "boca-vs-river" (stable)
    titleEs: text("title_es"), // Spanish translation
    descriptionEs: text("description_es"), // Spanish description
    category: varchar("category", { length: 100 }), // Sports, Economy, Politics, Crypto, Culture
    isFeatured: boolean("is_featured").default(false).notNull(), // Pin to homepage
    displayOrder: integer("display_order"), // Manual ranking (1 = top)
    imageUrl: text("image_url"), // Custom image override
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    featuredIdx: index("market_metadata_featured_idx").on(
      table.isFeatured,
      table.displayOrder,
    ),
    categoryIdx: index("market_metadata_category_idx").on(table.category),
    slugIdx: index("market_metadata_slug_idx").on(table.slug),
  }),
);

/**
 * Market Translations - Cache of Spanish translations from Myriad
 *
 * NOTE: This overlaps with market_metadata. Consider merging in future.
 * Kept for backward compatibility with existing translation workflow.
 */
export const marketTranslations = pgTable(
  "market_translations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    marketId: integer("market_id").notNull().unique(), // Myriad market numeric ID
    marketSlug: text("market_slug").notNull(),
    titleEs: text("title_es").notNull(),
    descriptionEs: text("description_es").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionEn: text("description_en").notNull(),
    translatedAt: timestamp("translated_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    marketSlugIdx: index("market_translations_slug_idx").on(table.marketSlug),
    translatedAtIdx: index("market_translations_translated_at_idx").on(
      table.translatedAt,
    ),
  }),
);

// ============================================================================
// COMMENTS & MODERATION
// ============================================================================

/**
 * Comments - User discussions on markets
 *
 * market_id is TEXT slug (not UUID FK) for loose coupling.
 * All comments visible by default (is_hidden = false).
 * Moderation happens via comment_reports (report-based, not pre-approval).
 */
export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    marketId: text("market_id").notNull(), // Slug like "boca-vs-river" (not UUID)
    userAddress: text("user_address").notNull(), // Wallet address
    content: text("content").notNull(), // Max 300 chars (enforced in API)
    gifUrl: text("gif_url"), // Optional Tenor GIF
    parentId: uuid("parent_id"), // Reply to another comment (1-level nesting)
    votes: integer("votes").default(0).notNull(), // Upvote count
    isHidden: boolean("is_hidden").default(false).notNull(), // Hidden if reported + reviewed
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    marketIdIdx: index("comments_market_id_idx").on(table.marketId),
    userAddressIdx: index("comments_user_address_idx").on(table.userAddress),
    parentIdIdx: index("comments_parent_id_idx").on(table.parentId),
    votesIdx: index("comments_votes_idx").on(table.votes),
    createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
    visibleIdx: index("comments_visible_idx").on(table.isHidden),
  }),
);

/**
 * Comment Votes - Upvote tracking
 *
 * One vote per user per comment (unique constraint).
 */
export const commentVotes = pgTable(
  "comment_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userAddress: varchar("user_address", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentUserUnique: unique(
      "comment_votes_comment_id_user_address_unique",
    ).on(table.commentId, table.userAddress),
    commentIdIdx: index("comment_votes_comment_id_idx").on(table.commentId),
    userAddressIdx: index("comment_votes_user_address_idx").on(
      table.userAddress,
    ),
  }),
);

/**
 * Comment Reports - User-flagged comments (moderation queue)
 *
 * Users report offensive/spam comments.
 * Admin reviews reports and can hide comments.
 * One report per user per comment (prevents spam reporting).
 */
export const commentReports = pgTable(
  "comment_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    reporterAddress: varchar("reporter_address", { length: 42 }).notNull(),
    reason: varchar("reason", { length: 100 }).notNull(), // 'spam', 'offensive', 'abuse', 'other'
    details: text("details"), // Optional explanation
    status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending', 'reviewed', 'dismissed'
    reviewedBy: varchar("reviewed_by", { length: 255 }), // Admin email (from Cloudflare header)
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    commentIdIdx: index("comment_reports_comment_id_idx").on(table.commentId),
    statusIdx: index("comment_reports_status_idx").on(table.status),
    createdAtIdx: index("comment_reports_created_at_idx").on(table.createdAt),
    uniqueReportIdx: unique("comment_reports_unique").on(
      table.commentId,
      table.reporterAddress,
    ),
  }),
);

// ============================================================================
// NOTIFICATIONS
// ============================================================================

/**
 * Notifications - User alerts (broadcast + targeted)
 *
 * Two types:
 * - broadcast: Platform announcements (user_address = NULL, no read tracking)
 * - user: Targeted notifications (user_address set, has read state)
 *
 * Expires after 30 days by default.
 * Read notifications auto-deleted after 7 days (cron job).
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 20 }).notNull(), // 'broadcast' | 'user'
    userAddress: varchar("user_address", { length: 42 }), // Recipient (NULL for broadcasts)
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"), // Deep link (e.g., "/markets/boca-vs-river#comment-123")
    marketSlug: varchar("market_slug", { length: 255 }), // Links to market
    commentId: uuid("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    fromUserAddress: varchar("from_user_address", { length: 42 }), // Who triggered it
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    expiresAt: timestamp("expires_at").defaultNow().notNull(), // Default: NOW() + 30 days
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userAddressIdx: index("notifications_user_address_idx").on(
      table.userAddress,
    ),
    typeIdx: index("notifications_type_idx").on(table.type),
    expiresAtIdx: index("notifications_expires_at_idx").on(table.expiresAt),
    isReadIdx: index("notifications_is_read_idx").on(table.isRead),
    createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
    userUnreadIdx: index("notifications_user_unread_idx").on(
      table.userAddress,
      table.isRead,
    ),
  }),
);

// ============================================================================
// MARKET PROPOSALS (User Feature Requests)
// ============================================================================

/**
 * Market Proposals - User-requested markets
 *
 * Users propose markets they want to see.
 * related_market_slug: Show proposal on related market pages (in-page display).
 * Admin can approve/reject, link to created Myriad market.
 */
export const marketProposals = pgTable(
  "market_proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(), // "¿Ganará Boca la Libertadores 2026?"
    category: text("category").notNull(), // Sports, Economy, Politics, Crypto, Culture
    endDate: timestamp("end_date").notNull(), // Estimated market close date
    source: text("source"), // Resolution source URL
    outcomes: text("outcomes").notNull(), // JSON array: ["Yes", "No"]
    createdBy: text("created_by").notNull(), // Wallet address
    upvotes: integer("upvotes").default(0).notNull(),
    status: text("status").default("pending").notNull(), // 'pending', 'approved', 'created', 'rejected'
    relatedMarketSlug: varchar("related_market_slug", { length: 255 }), // Show on this market's page
    myriadMarketId: varchar("myriad_market_id", { length: 255 }), // Link to created Myriad market
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    categoryIdx: index("proposals_category_idx").on(table.category),
    statusIdx: index("proposals_status_idx").on(table.status),
    upvotesIdx: index("proposals_upvotes_idx").on(table.upvotes),
    createdAtIdx: index("proposals_created_at_idx").on(table.createdAt),
    relatedIdx: index("proposals_related_idx").on(table.relatedMarketSlug),
  }),
);

/**
 * Proposal Votes - Track who voted for which proposals
 */
export const proposalVotes = pgTable(
  "proposal_votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => marketProposals.id, { onDelete: "cascade" }),
    voterAddress: text("voter_address").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    proposalVoterUnique: unique("proposal_votes_unique").on(
      table.proposalId,
      table.voterAddress,
    ),
    proposalIdIdx: index("proposal_votes_proposal_id_idx").on(table.proposalId),
    voterAddressIdx: index("proposal_votes_voter_address_idx").on(
      table.voterAddress,
    ),
  }),
);

// ============================================================================
// SAVED MARKETS (User Bookmarks)
// ============================================================================

/**
 * Saved Markets - User bookmarks
 */
export const savedMarkets = pgTable(
  "saved_markets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userAddress: varchar("user_address", { length: 42 }).notNull(),
    marketId: integer("market_id").notNull(), // Myriad market ID
    marketSlug: text("market_slug").notNull(),
    savedAt: timestamp("saved_at").defaultNow().notNull(),
  },
  (table) => ({
    userMarketUnique: unique("saved_markets_user_market_unique").on(
      table.userAddress,
      table.marketId,
    ),
    userAddressIdx: index("saved_markets_user_address_idx").on(
      table.userAddress,
    ),
    savedAtIdx: index("saved_markets_saved_at_idx").on(table.savedAt),
  }),
);

// ============================================================================
// ADMIN (Cloudflare Zero Trust handles auth, no admin_users table needed)
// ============================================================================

/**
 * Admin Actions - Audit trail of admin operations
 *
 * Logs admin actions for accountability.
 * admin_email comes from Cloudflare header (cf-access-authenticated-user-email).
 * No admin_users table needed - Cloudflare handles auth entirely.
 */
export const adminActions = pgTable(
  "admin_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    adminEmail: varchar("admin_email", { length: 255 }).notNull(), // From Cloudflare header
    actionType: varchar("action_type", { length: 100 }).notNull(), // 'hide_comment', 'feature_market', etc.
    resourceType: varchar("resource_type", { length: 100 }).notNull(), // 'comment', 'market_metadata', etc.
    resourceId: uuid("resource_id"), // ID of affected resource
    details: text("details"), // JSON string with additional context
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    adminEmailIdx: index("admin_actions_admin_email_idx").on(table.adminEmail),
    actionTypeIdx: index("admin_actions_action_type_idx").on(table.actionType),
    createdAtIdx: index("admin_actions_created_at_idx").on(table.createdAt),
  }),
);
