import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const commentStatusEnum = pgEnum("comment_status", [
  "pending",
  "approved",
  "rejected",
]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "broadcast",
  "user",
]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin", "mod"]);

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  wallet_address: varchar("wallet_address", { length: 255 }).notNull().unique(),
  display_name: varchar("display_name", { length: 100 }),
  role: userRoleEnum("role").default("user").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Market Metadata table
export const marketMetadata = pgTable("market_metadata", {
  id: uuid("id").primaryKey().defaultRandom(),
  myriad_id: varchar("myriad_id", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title_es: text("title_es"),
  category: varchar("category", { length: 100 }),
  image_url: text("image_url"),
  is_featured: boolean("is_featured").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  market_id: uuid("market_id")
    .notNull()
    .references(() => marketMetadata.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  status: commentStatusEnum("status").default("pending").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Comment votes table (likes/dislikes)
export const commentVotes = pgTable("comment_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  comment_id: uuid("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vote_type: integer("vote_type").notNull(), // 1 = upvote, -1 = downvote
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Market votes table (market-level reactions)
export const marketVotes = pgTable("market_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  market_id: uuid("market_id")
    .notNull()
    .references(() => marketMetadata.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vote_type: integer("vote_type").notNull(), // 1 = bullish, -1 = bearish
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: notificationTypeEnum("type").notNull(),
  target_user_id: uuid("target_user_id").references(() => users.id, {
    onDelete: "cascade",
  }), // Nullable for broadcast
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  link: text("link"),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  link: text("link"),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
});

// Admin users table (for defense-in-depth auth)
export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Admin actions log (audit trail)
export const adminActions = pgTable("admin_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  admin_id: uuid("admin_id")
    .notNull()
    .references(() => adminUsers.id),
  action_type: varchar("action_type", { length: 100 }).notNull(), // e.g., 'approve_comment', 'reject_comment', 'feature_market'
  resource_type: varchar("resource_type", { length: 100 }).notNull(), // e.g., 'comment', 'market', 'announcement'
  resource_id: uuid("resource_id"),
  details: text("details"), // JSON string for additional context
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  commentVotes: many(commentVotes),
  marketVotes: many(marketVotes),
  notifications: many(notifications),
}));

export const marketMetadataRelations = relations(
  marketMetadata,
  ({ many }) => ({
    comments: many(comments),
    marketVotes: many(marketVotes),
  }),
);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  market: one(marketMetadata, {
    fields: [comments.market_id],
    references: [marketMetadata.id],
  }),
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
  votes: many(commentVotes),
}));

export const commentVotesRelations = relations(commentVotes, ({ one }) => ({
  comment: one(comments, {
    fields: [commentVotes.comment_id],
    references: [comments.id],
  }),
  user: one(users, {
    fields: [commentVotes.user_id],
    references: [users.id],
  }),
}));

export const marketVotesRelations = relations(marketVotes, ({ one }) => ({
  market: one(marketMetadata, {
    fields: [marketVotes.market_id],
    references: [marketMetadata.id],
  }),
  user: one(users, {
    fields: [marketVotes.user_id],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.target_user_id],
    references: [users.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  actions: many(adminActions),
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [adminActions.admin_id],
    references: [adminUsers.id],
  }),
}));
