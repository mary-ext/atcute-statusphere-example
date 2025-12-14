import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const oauthState = sqliteTable(
	'oauth_state',
	{
		key: text('key').primaryKey(),
		stateJson: text('state_json').notNull(),
		expiresAt: integer('expires_at').notNull(),
	},
	(table) => [index('oauth_state_expires_at_idx').on(table.expiresAt)],
);

export const oauthSession = sqliteTable(
	'oauth_session',
	{
		did: text('did').primaryKey(),
		sessionJson: text('session_json').notNull(),
		updatedAt: integer('updated_at').notNull(),
	},
	(table) => [index('oauth_session_updated_at_idx').on(table.updatedAt)],
);

export const identity = sqliteTable('identity', {
	did: text('did').primaryKey(),
	handle: text('handle').notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull(),
	status: text('status').notNull(),
	updatedAt: integer('updated_at').notNull(),
});

export const profile = sqliteTable('profile', {
	did: text('did').primaryKey(),
	displayName: text('display_name'),
	recordJson: text('record_json').notNull(),
	indexedAt: integer('indexed_at').notNull(),
});

export const status = sqliteTable(
	'status',
	{
		uri: text('uri').primaryKey(),
		authorDid: text('author_did').notNull(),
		rkey: text('rkey').notNull(),
		status: text('status').notNull(),
		createdAt: text('created_at').notNull(),
		indexedAt: integer('indexed_at').notNull(),
	},
	(table) => [index('status_indexed_at_idx').on(table.indexedAt)],
);
