// See https://svelte.dev/docs/kit/types#app.d.ts

import type { AppSession } from '$lib/server/auth/app-session';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session?: AppSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
