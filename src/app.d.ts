// See https://svelte.dev/docs/kit/types#app.d.ts

import type { AuthContext } from '$lib/server/auth';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			auth?: AuthContext;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
