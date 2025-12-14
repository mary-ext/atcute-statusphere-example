import { error } from '@sveltejs/kit';

import { Client } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import { isDid } from '@atcute/lexicons/syntax';
import {
	AuthMethodUnsatisfiableError,
	TokenInvalidError,
	TokenRefreshError,
	TokenRevokedError,
} from '@atcute/oauth-node-client';

import { getRequestEvent } from '$app/server';

import { getSignedCookie } from '$lib/server/auth/signed-cookie';
import { oauth } from '$lib/server/oauth';

export const SESSION_COOKIE = 'statusphere_session';

export interface Session {
	did: Did;
}

export interface AuthContext {
	session: Session;
	client: Client;
}

const isSessionInvalidError = (err: unknown): boolean => {
	return (
		err instanceof TokenRefreshError ||
		err instanceof TokenInvalidError ||
		err instanceof TokenRevokedError ||
		err instanceof AuthMethodUnsatisfiableError
	);
};

/**
 * requires an authenticated session, throwing if not signed in or session is invalid.
 * caches the result in locals for successive calls within the same request.
 * @returns authenticated session and client
 * @throws if not signed in or OAuth session is invalid
 */
export const requireAuth = async (): Promise<AuthContext> => {
	const { locals, cookies } = getRequestEvent();

	// return cached result if available
	if (locals.auth) {
		return locals.auth;
	}

	const did = getSignedCookie(cookies, SESSION_COOKIE);
	if (!did) {
		error(401, `not signed in`);
	}

	if (!isDid(did)) {
		cookies.delete(SESSION_COOKIE, { path: '/' });
		error(401, `not signed in`);
	}

	try {
		const session = await oauth.restore(did);
		const client = new Client({ handler: session });

		const auth: AuthContext = {
			session: { did },
			client,
		};

		locals.auth = auth;
		return auth;
	} catch (err) {
		if (isSessionInvalidError(err)) {
			cookies.delete(SESSION_COOKIE, { path: '/' });

			error(401, `session expired`);
		}

		throw err;
	}
};
