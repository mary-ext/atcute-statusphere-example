<script lang="ts">
	import { doLogout } from '$lib/auth.remote';
	import { getCurrentUser } from '$lib/status.remote';

	const user = await getCurrentUser();
</script>

<header class="header">
	<h1 class="title">statusphere</h1>

	<div class="actions">
		{#if user}
			<span class="handle">@{user.handle}</span>
			<form
				{...doLogout.enhance(async ({ submit }) => {
					await submit();
					window.location.reload();
				})}
			>
				<button type="submit" class="btn btn-ghost">sign out</button>
			</form>
		{:else}
			<a href="/login" class="btn btn-primary">sign in</a>
		{/if}
	</div>
</header>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		padding-bottom: 1.5rem;
	}

	.title {
		font-weight: 700;
		font-size: 1.5rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.handle {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.btn {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transition:
			background-color 0.15s,
			border-color 0.15s;
		cursor: pointer;
		border: 1px solid transparent;
		border-radius: var(--radius-md);
		padding: 0.5rem 1rem;
		font-weight: 500;
		font-size: 0.875rem;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background-color: var(--color-accent);
		color: white;
		text-decoration: none;
	}

	.btn-primary:hover {
		background-color: var(--color-accent-hover);
		text-decoration: none;
	}

	.btn-ghost {
		background-color: transparent;
		color: var(--color-text-muted);
	}

	.btn-ghost:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
		color: var(--color-text);
	}
</style>
