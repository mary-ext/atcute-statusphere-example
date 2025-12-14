import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

import { TapClient } from '@atcute/tap';

import { APP_SESSION_COOKIE, getAppSession } from '$lib/server/auth/app-session';
import { getSignedCookie } from '$lib/server/auth/signed-cookie';
import { runTapSubscription } from '$lib/server/tap';

if (!env.TAP_URL) {
	throw new Error(`TAP_URL is not set`);
}

{
	const tap = new TapClient({
		url: env.TAP_URL,
		adminPassword: env.TAP_ADMIN_PASSWORD || undefined,
	});

	void runTapSubscription(tap).catch((err) => {
		console.error(err);
	});
}

export const handle: Handle = async ({ event, resolve }) => {
	const { locals, cookies } = event;

	const sessionId = getSignedCookie(cookies, APP_SESSION_COOKIE);
	if (sessionId) {
		const session = await getAppSession(sessionId);

		if (session) {
			locals.session = session;
		} else {
			cookies.delete(APP_SESSION_COOKIE, { path: '/' });
		}
	}

	return resolve(event);
};
