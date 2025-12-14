import { redirect } from '@sveltejs/kit';

import { SESSION_COOKIE } from '$lib/server/auth';
import { setSignedCookie } from '$lib/server/auth/signed-cookie';
import { oauth } from '$lib/server/oauth';

export const GET = async ({ url, cookies }) => {
	const { session } = await oauth.callback(url.searchParams);

	const secure = url.protocol === 'https:';

	setSignedCookie(cookies, SESSION_COOKIE, session.did, {
		httpOnly: true,
		secure: secure,
		sameSite: 'lax' as const,
		path: '/',
		maxAge: 60 * 60 * 24 * 30,
	});

	redirect(303, '/');
};
