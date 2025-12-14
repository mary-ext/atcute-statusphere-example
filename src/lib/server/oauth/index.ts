import { env } from '$env/dynamic/private';
import {
	CompositeDidDocumentResolver,
	CompositeHandleResolver,
	LocalActorResolver,
	PlcDidDocumentResolver,
	WebDidDocumentResolver,
	WellKnownHandleResolver,
} from '@atcute/identity-resolver';
import { NodeDnsHandleResolver } from '@atcute/identity-resolver-node';
import { OAuthClient, importJwkKey } from '@atcute/oauth-node-client';

import { stores } from './stores';

if (!env.OAUTH_PUBLIC_URL) {
	throw new Error(`OAUTH_PUBLIC_URL is not set`);
}

if (!env.OAUTH_PRIVATE_KEY_JWK) {
	throw new Error(`OAUTH_PRIVATE_KEY_JWK is not set`);
}

const publicUrl = new URL(env.OAUTH_PUBLIC_URL);

export const oauth = new OAuthClient({
	metadata: {
		client_id: new URL('/oauth-client-metadata.json', publicUrl).href,
		client_name: 'statusphere',
		redirect_uris: [new URL('/oauth/callback', publicUrl).href],
		scope: 'atproto repo:xyz.statusphere.status',
		jwks_uri: new URL('/jwks.json', publicUrl).href,
	},

	keyset: await Promise.all([importJwkKey(env.OAUTH_PRIVATE_KEY_JWK)]),

	actorResolver: new LocalActorResolver({
		handleResolver: new CompositeHandleResolver({
			methods: {
				dns: new NodeDnsHandleResolver(),
				http: new WellKnownHandleResolver(),
			},
		}),
		didDocumentResolver: new CompositeDidDocumentResolver({
			methods: {
				plc: new PlcDidDocumentResolver(),
				web: new WebDidDocumentResolver(),
			},
		}),
	}),

	stores,
});
