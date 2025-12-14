import { createHmac, timingSafeEqual } from 'node:crypto';

import type { Cookies } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';

import { fromBase64Url, toBase64Url } from '@atcute/multibase';

if (!env.COOKIE_SECRET) {
	throw new Error(`COOKIE_SECRET is not set`);
}

const SEPARATOR = '.';

const hmacSha256 = (data: string): Uint8Array => {
	return createHmac('sha256', env.COOKIE_SECRET).update(data).digest();
};

export const getSignedCookie = (cookies: Cookies, name: string): string | null => {
	const signed = cookies.get(name);
	if (!signed) {
		return null;
	}

	const idx = signed.lastIndexOf(SEPARATOR);
	if (idx === -1) {
		return null;
	}

	const value = signed.slice(0, idx);
	const sig = signed.slice(idx + 1);

	let expected: Uint8Array;
	let got: Uint8Array;
	try {
		expected = hmacSha256(value);
		got = fromBase64Url(sig);
	} catch {
		return null;
	}

	if (!timingSafeEqual(got, expected)) {
		return null;
	}

	return value;
};

export const setSignedCookie = (
	cookies: Cookies,
	name: string,
	value: string,
	options: Parameters<Cookies['set']>[2],
): void => {
	const sig = toBase64Url(hmacSha256(value));
	const signed = `${value}${SEPARATOR}${sig}`;

	cookies.set(name, signed, options);
};
