import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { AppBskyActorProfile } from '@atcute/bluesky';
import type { StoredSession, StoredState } from '@atcute/oauth-node-client';

import type { XyzStatusphereStatus } from '$lib/lexicons';

export const oauthState = sqliteTable(
	'oauth_state',
	{
		key: text('key').primaryKey(),
		state: text('state', { mode: 'json' }).$type<StoredState>().notNull(),
		expiresAt: integer('expires_at').notNull(),
	},
	(table) => [index('oauth_state_expires_at_idx').on(table.expiresAt)],
);

export const oauthSession = sqliteTable(
	'oauth_session',
	{
		did: text('did').primaryKey(),
		session: text('session', { mode: 'json' }).$type<StoredSession>().notNull(),
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
	record: text('record', { mode: 'json' }).$type<AppBskyActorProfile.Main>().notNull(),
	indexedAt: integer('indexed_at').notNull(),
});

export const status = sqliteTable(
	'status',
	{
		uri: text('uri').primaryKey(),
		authorDid: text('author_did').notNull(),
		rkey: text('rkey').notNull(),
		record: text('record', { mode: 'json' }).$type<XyzStatusphereStatus.Main>().notNull(),
		sortAt: integer('sort_at').notNull(),
		indexedAt: integer('indexed_at').notNull(),
	},
	(table) => [index('status_sort_at_idx').on(table.sortAt)],
);
