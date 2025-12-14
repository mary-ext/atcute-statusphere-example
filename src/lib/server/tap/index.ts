import type { TapClient } from '@atcute/tap';

import { ingestTapEvent } from './ingest';

/**
 * runs a tap subscription loop until the process exits.
 *
 * @param tap configured tap client
 */
export const runTapSubscription = async (tap: TapClient): Promise<void> => {
	for await (const { event, ack } of tap.subscribe()) {
		await ingestTapEvent(event);
		await ack();
	}
};
