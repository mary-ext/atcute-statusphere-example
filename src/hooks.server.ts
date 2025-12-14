import { env } from '$env/dynamic/private';

import { TapClient } from '@atcute/tap';

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
