import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

export const loggings = sqliteTable('loggings', {
	id: integer('id').primaryKey(),
	message: text('message'),
})


export type Logging = typeof loggings.$inferSelect 
export type InsertLogging = typeof loggings.$inferInsert 

export const db = drizzle(new Database('loggings.db'))
