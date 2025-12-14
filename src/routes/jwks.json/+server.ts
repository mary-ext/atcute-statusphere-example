import { json } from '@sveltejs/kit';

import { oauth } from '$lib/server/oauth';

export const GET = () => {
	return json(oauth.jwks, {
		headers: {
			'cache-control': 'public, max-age=60',
		},
	});
};
