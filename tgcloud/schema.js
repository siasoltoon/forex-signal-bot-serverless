import { table, integer, text, boolean, json, index, sql } from 'sdk/db';

export const users = table('users', {
  userId: integer('user_id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  lastSeenAt: integer('last_seen_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const userSettings = table('user_settings', {
  userId: integer('user_id').primaryKey(),
  symbols: json('symbols').notNull().default([]),
  notificationsEnabled: boolean('notifications_enabled').notNull().default(true),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

export const signalEvents = table('signal_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull(),
  signalType: text('signal_type').notNull(),
  summary: text('summary').notNull(),
  sourceEventId: text('source_event_id').unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
}, (t) => ({
  symbolIdx: index('idx_signal_events_symbol').on(t.symbol),
  createdIdx: index('idx_signal_events_created').on(t.createdAt),
}));
