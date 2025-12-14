import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import type { Did } from '@atcute/lexicons/syntax';

import { db } from '$lib/server/db';
import { appSession } from '$lib/server/db/schema';

export const APP_SESSION_COOKIE = 'statusphere_session';

export type AppSession = {
	id: string;
	did: Did;
};

export const createAppSession = async (did: Did): Promise<AppSession> => {
	const id = nanoid(32);
	const ts = Date.now();

	await db
		.insert(appSession)
		.values({
			id,
			did,
			createdAt: ts,
			lastSeenAt: ts,
		})
		.run();

	return { id, did };
};

export const deleteAppSession = async (id: string): Promise<void> => {
	await db.delete(appSession).where(eq(appSession.id, id)).run();
};

export const getAppSession = async (id: string): Promise<AppSession | null> => {
	const row = await db.select().from(appSession).where(eq(appSession.id, id)).get();
	if (!row) {
		return null;
	}

	const now = Date.now();
	if (row.lastSeenAt && now - row.lastSeenAt > 15 * 60 * 1000) {
		touchAppSession(id);
	}

	return { id: row.id, did: row.did as Did };
};

const touchAppSession = async (id: string): Promise<void> => {
	await db.update(appSession).set({ lastSeenAt: Date.now() }).where(eq(appSession.id, id)).run();
};
