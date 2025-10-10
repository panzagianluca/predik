import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

// Example schema - you can expand this based on your needs
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: text('address').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Add more tables as needed for your application
// For example: user preferences, cached market data, etc.
