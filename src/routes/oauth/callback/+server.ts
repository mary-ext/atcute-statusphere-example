import { redirect } from '@sveltejs/kit';

import { APP_SESSION_COOKIE, createAppSession, deleteAppSession } from '$lib/server/auth/app-session';
import { getSignedCookie, setSignedCookie } from '$lib/server/auth/signed-cookie';
import { oauth } from '$lib/server/oauth';

export const GET = async ({ url, cookies }) => {
	{
		const existingSessionId = getSignedCookie(cookies, APP_SESSION_COOKIE);
		if (existingSessionId) {
			await deleteAppSession(existingSessionId);
		}
	}

	const { session } = await oauth.callback(url.searchParams);

	const appSession = await createAppSession(session.did);
	const secure = url.protocol === 'https:';

	setSignedCookie(cookies, APP_SESSION_COOKIE, appSession.id, {
		httpOnly: true,
		secure: secure,
		sameSite: 'lax' as const,
		path: '/',
		maxAge: 60 * 60 * 24 * 30,
	});

	redirect(303, '/');
};
