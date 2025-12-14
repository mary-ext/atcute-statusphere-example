import { AppBskyActorProfile } from '@atcute/bluesky';
import { safeParse } from '@atcute/lexicons/validations';
import type { TapEvent } from '@atcute/tap';
import { eq } from 'drizzle-orm';

import { XyzStatusphereStatus } from '$lib/lexicons';
import { db } from '$lib/server/db';
import { identity, profile, status } from '$lib/server/db/schema';

const now = () => Date.now();

const toAtUri = (did: string, collection: string, rkey: string): string => {
	return `at://${did}/${collection}/${rkey}`;
};

/**
 * ingests a single tap event into the local database.
 *
 * @param event tap event
 */
export const ingestTapEvent = async (event: TapEvent): Promise<void> => {
	if (event.type === 'identity') {
		await db
			.insert(identity)
			.values({
				did: event.did,
				handle: event.handle,
				isActive: event.isActive,
				status: event.status,
				updatedAt: now(),
			})
			.onConflictDoUpdate({
				target: identity.did,
				set: {
					handle: event.handle,
					isActive: event.isActive,
					status: event.status,
					updatedAt: now(),
				},
			})
			.run();

		return;
	}

	if (event.collection === 'app.bsky.actor.profile') {
		if (event.rkey !== 'self') {
			return;
		}

		if (event.action === 'delete') {
			await db.delete(profile).where(eq(profile.did, event.did)).run();
			return;
		}

		const record = event.record;
		if (!record) {
			return;
		}

		const parsed = safeParse(AppBskyActorProfile.mainSchema, record);
		if (!parsed.ok) {
			return;
		}

		const indexedAt = now();
		const recordJson = JSON.stringify(parsed.value);

		await db
			.insert(profile)
			.values({
				did: event.did,
				displayName: parsed.value.displayName ?? null,
				recordJson,
				indexedAt,
			})
			.onConflictDoUpdate({
				target: profile.did,
				set: {
					displayName: parsed.value.displayName ?? null,
					recordJson,
					indexedAt,
				},
			})
			.run();

		return;
	}

	if (event.collection === 'xyz.statusphere.status') {
		const uri = toAtUri(event.did, event.collection, event.rkey);

		if (event.action === 'delete') {
			await db.delete(status).where(eq(status.uri, uri)).run();
			return;
		}

		const record = event.record;
		if (!record) {
			return;
		}

		const parsed = safeParse(XyzStatusphereStatus.mainSchema, record);
		if (!parsed.ok) {
			return;
		}

		const indexedAt = now();

		await db
			.insert(status)
			.values({
				uri,
				authorDid: event.did,
				rkey: event.rkey,
				status: parsed.value.status,
				createdAt: parsed.value.createdAt,
				indexedAt,
			})
			.onConflictDoUpdate({
				target: status.uri,
				set: {
					status: parsed.value.status,
					indexedAt,
				},
			})
			.run();
	}
};
