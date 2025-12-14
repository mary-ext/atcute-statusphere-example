import { Client } from '@atcute/client';
import {
	AuthMethodUnsatisfiableError,
	TokenInvalidError,
	TokenRefreshError,
	TokenRevokedError,
} from '@atcute/oauth-node-client';

import { getRequestEvent } from '$app/server';

import { APP_SESSION_COOKIE, deleteAppSession } from '$lib/server/auth/app-session';
import { oauth } from '$lib/server/oauth';

const isSessionInvalidError = (err: unknown): boolean => {
	return (
		err instanceof TokenRefreshError ||
		err instanceof TokenInvalidError ||
		err instanceof TokenRevokedError ||
		err instanceof AuthMethodUnsatisfiableError
	);
};

export const getAuthedClient = async (): Promise<Client> => {
	const {
		locals: { session: sessionInfo },
		cookies,
	} = getRequestEvent();

	if (!sessionInfo) {
		throw new Error(`not signed in`);
	}

	try {
		const session = await oauth.restore(sessionInfo.did);
		const client = new Client({ handler: session });

		return client;
	} catch (err) {
		if (isSessionInvalidError(err)) {
			await deleteAppSession(sessionInfo.id);
			cookies.delete(APP_SESSION_COOKIE, { path: '/' });
		}

		throw err;
	}
};
