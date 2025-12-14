import { AppBskyActorProfile } from '@atcute/bluesky';
import { safeParse } from '@atcute/lexicons/validations';
import type { TapEvent } from '@atcute/tap';
import { eq } from 'drizzle-orm';

import { XyzStatusphereStatus } from '$lib/lexicons';
import { db } from '$lib/server/db';
import { identity, profile, status } from '$lib/server/db/schema';

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
		const updatedAt = Date.now();

		await db
			.insert(identity)
			.values({
				did: event.did,
				handle: event.handle,
				isActive: event.isActive,
				status: event.status,
				updatedAt,
			})
			.onConflictDoUpdate({
				target: identity.did,
				set: {
					handle: event.handle,
					isActive: event.isActive,
					status: event.status,
					updatedAt,
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

		const parsed = safeParse(AppBskyActorProfile.mainSchema, event.record);
		if (!parsed.ok) {
			return;
		}

		const record = parsed.value;
		const indexedAt = Date.now();

		await db
			.insert(profile)
			.values({
				did: event.did,
				record,
				indexedAt,
			})
			.onConflictDoUpdate({
				target: profile.did,
				set: {
					record,
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

		const parsed = safeParse(XyzStatusphereStatus.mainSchema, event.record);
		if (!parsed.ok) {
			return;
		}

		const record = parsed.value;

		const createdAt = Date.parse(record.createdAt);
		const indexedAt = Date.now();
		const sortAt = Number.isNaN(createdAt) ? indexedAt : Math.min(createdAt, indexedAt);

		await db
			.insert(status)
			.values({
				uri,
				authorDid: event.did,
				rkey: event.rkey,
				record,
				sortAt,
				indexedAt,
			})
			.onConflictDoUpdate({
				target: status.uri,
				set: {
					record,
					indexedAt,
				},
			})
			.run();
	}
};
