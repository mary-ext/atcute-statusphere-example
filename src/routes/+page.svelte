<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import StatusPicker from '$lib/components/status-picker.svelte';
	import Timeline from '$lib/components/timeline.svelte';

	import { getCurrentUser, getTimeline } from '$lib/status.remote';

	const user = await getCurrentUser();
</script>

<div class="container">
	<Header />

	{#if user}
		<StatusPicker {user} />
	{:else}
		<div class="card">
			<p class="card-title">welcome to statusphere</p>
			<p class="card-text">sign in to share your status with the world</p>
		</div>
	{/if}

	<svelte:boundary>
		<Timeline statuses={(await getTimeline({})).statuses} />

		{#snippet pending()}
			<div class="loading">
				<div class="spinner"></div>
			</div>
		{/snippet}

		{#snippet failed(_error)}
			<div class="error">
				<p>failed to load timeline</p>
			</div>
		{/snippet}
	</svelte:boundary>
</div>

<style>
	.container {
		margin: 0 auto;
		padding: 1.5rem 1rem;
		max-width: 600px;
	}

	.card {
		margin-bottom: 1.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background-color: var(--color-bg-elevated);
		padding: 1rem;
	}

	.card-title {
		margin-bottom: 0.5rem;
		font-weight: 500;
	}

	.card-text {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
	}

	.spinner {
		animation: spin 0.8s linear infinite;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-accent);
		border-radius: 50%;
		width: 1.5rem;
		height: 1.5rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.error {
		border-radius: var(--radius-md);
		background-color: var(--color-error-bg);
		padding: 0.75rem 1rem;
		color: var(--color-error);
		font-size: 0.875rem;
	}
</style>
