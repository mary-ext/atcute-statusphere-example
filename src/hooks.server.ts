import { env } from '$env/dynamic/private';

import { TapClient } from '@atcute/tap';

import { runTapSubscription } from '$lib/server/tap';

if (!env.TAP_URL) {
	throw new Error(`TAP_URL is not set`);
}

// for production deployments, consider running the firehose ingestion in a
// separate sidecar process. the throughput from Tap (especially during
// backfilling of existing repos) can overwhelm the server and block HTTP
// request processing.
{
	const tap = new TapClient({
		url: env.TAP_URL,
		adminPassword: env.TAP_ADMIN_PASSWORD || undefined,
	});

	void runTapSubscription(tap).catch((err) => {
		console.error(err);
	});
}
