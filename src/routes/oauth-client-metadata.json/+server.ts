import { json } from '@sveltejs/kit';

import { oauth } from '$lib/server/oauth';

export const GET = () => {
	return json(oauth.metadata, {
		headers: {
			'cache-control': 'public, max-age=60',
		},
	});
};
