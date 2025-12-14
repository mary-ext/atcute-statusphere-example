<script lang="ts">
	import { doLogin } from '$lib/auth.remote';

	const formId = $props.id();

	const formIssue = $derived(doLogin.fields.issues()?.at(0));
	const identifierIssue = $derived(doLogin.fields.identifier.issues()?.at(0));
</script>

<div class="page">
	<h1 class="title">sign in to statusphere</h1>
	<p class="subtitle">enter your Bluesky handle or DID</p>

	<form class="form" {...doLogin}>
		<div class="field">
			<label for="identifier" class="label">handle</label>
			<input
				{...doLogin.fields.identifier.as('text')}
				class="input"
				placeholder="alice.bsky.social"
				required
				aria-describedby={`${formId}-identifier-validation-message`}
			/>

			{#if identifierIssue}
				<p id={`${formId}-identifier-validation-message`} class="error">{identifierIssue.message}</p>
			{/if}
		</div>

		{#if formIssue}
			<div class="form-error">
				<p>{formIssue.message}</p>
			</div>
		{/if}

		<button type="submit" class="btn" disabled={!!doLogin.pending}>
			{doLogin.pending ? 'signing in...' : 'sign in'}
		</button>
	</form>

	<p class="back">
		<a href="/">← back to home</a>
	</p>
</div>

<style>
	.page {
		margin: 0 auto;
		padding: 3rem 1rem;
		max-width: 400px;
	}

	.title {
		margin-bottom: 0.5rem;
		font-weight: 700;
		font-size: 1.5rem;
		text-align: center;
	}

	.subtitle {
		margin-bottom: 2rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.form {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background-color: var(--color-bg-elevated);
		padding: 1.5rem;
	}

	.field {
		margin-bottom: 1rem;
	}

	.label {
		display: block;
		margin-bottom: 0.375rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.input {
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg);
		padding: 0.625rem 0.75rem;
		width: 100%;
		color: var(--color-text);
		font-size: 1rem;
	}

	.input::placeholder {
		color: var(--color-text-muted);
	}

	.input:focus {
		outline: none;
		box-shadow: 0 0 0 3px var(--color-accent-bg);
		border-color: var(--color-accent);
	}

	.input[aria-invalid='true'] {
		border-color: var(--color-error);
	}

	.error {
		margin-top: 0.375rem;
		color: var(--color-error);
		font-size: 0.875rem;
	}

	.form-error {
		margin-bottom: 1rem;
		border-radius: var(--radius-md);
		background-color: var(--color-error-bg);
		padding: 0.75rem 1rem;
		color: var(--color-error);
		font-size: 0.875rem;
	}

	.btn {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.15s;
		cursor: pointer;
		border: none;
		border-radius: var(--radius-md);
		background-color: var(--color-accent);
		padding: 0.625rem 1rem;
		width: 100%;
		color: white;
		font-weight: 500;
		font-size: 1rem;
	}

	.btn:hover:not(:disabled) {
		background-color: var(--color-accent-hover);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.back {
		margin-top: 1.5rem;
		font-size: 0.875rem;
		text-align: center;
	}
</style>
