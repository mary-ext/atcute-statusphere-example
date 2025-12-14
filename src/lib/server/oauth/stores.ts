import { eq, lte } from 'drizzle-orm';

import type { Did } from '@atcute/lexicons/syntax';
import type { OAuthClientStores, StoredSession, StoredState } from '@atcute/oauth-node-client';

import { db } from '$lib/server/db';
import { oauthSession, oauthState } from '$lib/server/db/schema';

export const stores: OAuthClientStores = {
	sessions: {
		async get(did: Did) {
			const row = await db.select().from(oauthSession).where(eq(oauthSession.did, did)).get();
			return row?.session;
		},
		async set(did: Did, session: StoredSession) {
			const updatedAt = Date.now();

			await db
				.insert(oauthSession)
				.values({ did, session, updatedAt })
				.onConflictDoUpdate({
					target: oauthSession.did,
					set: { session, updatedAt },
				})
				.run();
		},
		async delete(did: Did) {
			await db.delete(oauthSession).where(eq(oauthSession.did, did)).run();
		},
		async clear() {
			await db.delete(oauthSession).run();
		},
	},

	states: {
		async get(key: string) {
			const row = await db.select().from(oauthState).where(eq(oauthState.key, key)).get();
			if (!row) {
				return;
			}

			if (row.expiresAt <= Date.now()) {
				await db.delete(oauthState).where(eq(oauthState.key, key)).run();
				return;
			}

			return row.state;
		},
		async set(key: string, state: StoredState) {
			const expiresAt = state.expiresAt;

			await db
				.insert(oauthState)
				.values({ key, state, expiresAt })
				.onConflictDoUpdate({
					target: oauthState.key,
					set: { state, expiresAt },
				})
				.run();
		},
		async delete(key: string) {
			await db.delete(oauthState).where(eq(oauthState.key, key)).run();
		},
		async clear() {
			await db.delete(oauthState).run();
		},
	},
};

export const pruneExpiredStates = async () => {
	await db.delete(oauthState).where(lte(oauthState.expiresAt, Date.now())).run();
};
