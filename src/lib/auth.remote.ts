import { invalid, redirect } from '@sveltejs/kit';

import * as v from 'valibot';

import { isActorIdentifier, type ActorIdentifier } from '@atcute/lexicons/syntax';
import { OAuthResolverError } from '@atcute/oauth-node-client';

import { form, getRequestEvent } from '$app/server';

import { APP_SESSION_COOKIE, deleteAppSession } from './server/auth/app-session';
import { oauth } from './server/oauth';

const actorIdentifierString = v.custom<ActorIdentifier>(
	(input) => isActorIdentifier(input),
	`please enter a valid handle (e.g. alice.bsky.social) or DID`,
);

export const doLogin = form(
	v.object({
		identifier: actorIdentifierString,
	}),
	async ({ identifier }) => {
		let url: URL;

		try {
			const result = await oauth.authorize({
				target: {
					type: 'account',
					identifier: identifier,
				},
			});

			url = result.url;
		} catch (err) {
			console.error(`failed to authenticate ${identifier}:`, err);

			invalid(`could not initiate login`);
		}

		redirect(303, url.href);
	},
);

export const doLogout = form(async () => {
	const {
		locals: { session },
		cookies,
	} = getRequestEvent();

	if (session) {
		await deleteAppSession(session.id);
	}

	cookies.delete(APP_SESSION_COOKIE, { path: '/' });
	redirect(303, '/');
});
