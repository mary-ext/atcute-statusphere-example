import { invalid } from '@sveltejs/kit';

import * as v from 'valibot';

import { ComAtprotoRepoCreateRecord } from '@atcute/atproto';
import { ok } from '@atcute/client';
import type { CanonicalResourceUri, Did, Handle } from '@atcute/lexicons';
import * as TID from '@atcute/tid';
import { and, desc, eq, inArray, lt, or } from 'drizzle-orm';

import { form, query } from '$app/server';

import type { XyzStatusphereStatus } from '$lib/lexicons';
import { requireAuth } from '$lib/server/auth';
import { db, schema } from '$lib/server/db';
import { statusOptions } from '$lib/status-options';

export interface CurrentUser {
	did: Did;
	handle: Handle;
	displayName?: string;
}

/** returns the current user's profile, or null if not signed in */
export const getCurrentUser = query(async (): Promise<CurrentUser | null> => {
	let did: Did;
	try {
		const auth = await requireAuth();
		did = auth.session.did;
	} catch {
		return null;
	}

	const [identity, profile] = await Promise.all([
		db.select().from(schema.identity).where(eq(schema.identity.did, did)).get(),
		db.select().from(schema.profile).where(eq(schema.profile.did, did)).get(),
	]);

	return {
		did,
		handle: (identity?.handle ?? 'handle.invalid') as Handle,
		displayName: profile?.record.displayName ?? undefined,
	};
});

const encodeCursor = (sortAt: number, uri: string): string => {
	return `${sortAt}:${uri}`;
};

const cursorSchema = v.pipe(
	v.string(),
	v.rawTransform(({ dataset, addIssue, NEVER }) => {
		const input = dataset.value;

		const idx = input.indexOf(':');
		if (idx === -1) {
			addIssue({ message: 'invalid cursor format' });
			return NEVER;
		}

		const sortAt = parseInt(input.slice(0, idx), 10);
		const uri = input.slice(idx + 1);

		if (Number.isNaN(sortAt) || !uri) {
			addIssue({ message: 'invalid cursor format' });
			return NEVER;
		}

		return { sortAt, uri };
	}),
);

export const postStatus = form(
	v.object({
		status: v.pipe(v.string(), v.minLength(1), v.maxLength(32), v.maxGraphemes(1)),
	}),
	async ({ status }, issue) => {
		const { session, client } = await requireAuth();

		if (!statusOptions.includes(status)) {
			invalid(issue.status(`invalid status`));
		}

		const rkey = TID.now();
		const createdAt = new Date().toISOString();

		const record: XyzStatusphereStatus.Main = {
			$type: 'xyz.statusphere.status',
			createdAt: createdAt,
			status: status,
		};

		try {
			await ok(
				client.call(ComAtprotoRepoCreateRecord, {
					input: {
						repo: session.did,
						collection: 'xyz.statusphere.status',
						rkey: rkey,
						record,
					},
				}),
			);
		} catch (err) {
			console.error(`failed to post status:`, err);

			invalid(`could not post status - please try again`);
		}

		// insert locally so we don't have to wait for ingester
		{
			const uri: CanonicalResourceUri = `at://${session.did}/xyz.statusphere.status/${rkey}`;
			const indexedAt = Date.now();
			const sortAt = Math.min(Date.parse(createdAt), indexedAt);

			await db
				.insert(schema.status)
				.values({
					uri,
					authorDid: session.did,
					rkey,
					record,
					sortAt,
					indexedAt,
				})
				.onConflictDoNothing()
				.run();
		}
	},
);

export interface AuthorView {
	did: Did;
	handle: Handle;
	displayName?: string;
	avatar?: string;
}

export interface StatusView {
	author: AuthorView;
	record: XyzStatusphereStatus.Main;
	indexedAt: string;
}

export interface TimelineResponse {
	cursor: string | undefined;
	statuses: StatusView[];
}

export const getTimeline = query(
	v.object({
		cursor: v.optional(cursorSchema),
	}),
	async ({ cursor }): Promise<TimelineResponse> => {
		const limit = 20;

		const statusRows = await db
			.select()
			.from(schema.status)
			.where(
				cursor
					? or(
							lt(schema.status.sortAt, cursor.sortAt),
							and(eq(schema.status.sortAt, cursor.sortAt), lt(schema.status.uri, cursor.uri)),
						)
					: undefined,
			)
			.orderBy(desc(schema.status.sortAt), desc(schema.status.uri))
			.limit(limit + 1)
			.all();

		const hasMore = statusRows.length > limit;
		const items = hasMore ? statusRows.slice(0, limit) : statusRows;

		const dids = [...new Set(items.map((s) => s.authorDid))];

		const [identities, profiles] = await Promise.all([
			db.select().from(schema.identity).where(inArray(schema.identity.did, dids)).all(),
			db.select().from(schema.profile).where(inArray(schema.profile.did, dids)).all(),
		]);

		const identityMap = new Map(identities.map((i) => [i.did, i]));
		const profileMap = new Map(profiles.map((p) => [p.did, p]));

		const statuses = items.map((s): StatusView => {
			const identity = identityMap.get(s.authorDid);
			const profile = profileMap.get(s.authorDid);

			return {
				author: {
					did: s.authorDid as Did,
					handle: (identity?.handle ?? 'handle.invalid') as Handle,
					displayName: profile?.record.displayName ?? undefined,
				},
				record: s.record,
				indexedAt: new Date(s.sortAt).toISOString(),
			};
		});

		const last = items[items.length - 1];

		return {
			cursor: hasMore && last ? encodeCursor(last.sortAt, last.uri) : undefined,
			statuses,
		};
	},
);
