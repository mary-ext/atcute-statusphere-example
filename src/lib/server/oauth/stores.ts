import { eq, lte } from 'drizzle-orm';

import type { Did } from '@atcute/lexicons/syntax';
import type { OAuthClientStores, StoredSession, StoredState } from '@atcute/oauth-node-client';

import { db } from '$lib/server/db';
import { oauthSession, oauthState } from '$lib/server/db/schema';

export const stores: OAuthClientStores = {
	sessions: {
		async get(did: Did) {
			const row = await db.select().from(oauthSession).where(eq(oauthSession.did, did)).get();
			if (!row) {
				return;
			}

			return JSON.parse(row.sessionJson) as StoredSession;
		},
		async set(did: Did, value: StoredSession) {
			const sessionJson = JSON.stringify(value);
			const updatedAt = Date.now();

			await db
				.insert(oauthSession)
				.values({ did, sessionJson, updatedAt })
				.onConflictDoUpdate({
					target: oauthSession.did,
					set: { sessionJson, updatedAt },
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

			return JSON.parse(row.stateJson) as StoredState;
		},
		async set(key: string, value: StoredState) {
			const stateJson = JSON.stringify(value);
			const expiresAt = value.expiresAt;

			await db
				.insert(oauthState)
				.values({ key, stateJson, expiresAt })
				.onConflictDoUpdate({
					target: oauthState.key,
					set: { stateJson, expiresAt },
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
