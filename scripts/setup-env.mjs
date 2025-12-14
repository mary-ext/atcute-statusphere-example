import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { exportJwkKey, generatePrivateKey, importJwkKey } from '@atcute/oauth-node-client';

import { nanoid } from 'nanoid';

const ensureEnv = async () => {
	const cwd = process.cwd();

	const examplePath = resolve(cwd, '.env.example');
	const envPath = resolve(cwd, '.env');

	if (!existsSync(envPath)) {
		if (!existsSync(examplePath)) {
			throw new Error(`missing .env.example (expected at ${examplePath})`);
		}

		await copyFile(examplePath, envPath);
		console.log(`created ${envPath}`);
	}

	return envPath;
};

const normalizeCurrentValue = (value) => {
	const trimmed = value.trim();

	if (trimmed === '' || trimmed === `''` || trimmed === `""`) {
		return '';
	}

	return trimmed;
};

const upsertEnvVar = (input, key, value) => {
	const line = `${key}=${value}`;
	const re = new RegExp(`^${key}=.*$`, 'm');

	if (re.test(input)) {
		const match = input.match(re);
		const current = match ? match[0].slice(key.length + 1) : '';

		if (normalizeCurrentValue(current) === '') {
			return input.replace(re, line);
		}

		return input;
	}

	const suffix = input.endsWith('\n') || input.length === 0 ? '' : '\n';
	return `${input}${suffix}${line}\n`;
};

const envPath = await ensureEnv();
const env = await readFile(envPath, 'utf8');

let updated = env;

{
	const cookieSecret = nanoid(32);
	updated = upsertEnvVar(updated, 'COOKIE_SECRET', `'${cookieSecret}'`);
}

{
	const privateKey = await generatePrivateKey('main', 'ES256');
	const jwk = await exportJwkKey(privateKey);

	// sanity-check that the key parses before writing
	await importJwkKey(jwk);

	updated = upsertEnvVar(updated, 'OAUTH_PRIVATE_KEY_JWK', `'${JSON.stringify(jwk)}'`);
}

if (updated !== env) {
	await writeFile(envPath, updated);
	console.log(`updated ${envPath}`);
} else {
	console.log(`no changes to ${envPath}`);
}
