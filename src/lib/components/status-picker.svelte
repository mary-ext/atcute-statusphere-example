<script lang="ts">
	import { statusOptions } from '$lib/status-options';
	import { getTimeline, postStatus, type CurrentUser } from '$lib/status.remote';

	interface Props {
		user: CurrentUser;
	}

	let { user }: Props = $props();
</script>

<section class="picker">
	<p class="label">what's your status?</p>

	<form
		class="grid"
		{...postStatus.enhance(async ({ data, submit }) => {
			await submit().updates(
				getTimeline({}).withOverride((current) => {
					return {
						...current,
						statuses: [
							{
								author: {
									did: user.did,
									handle: user.handle,
									displayName: user.displayName,
								},
								record: {
									$type: 'xyz.statusphere.status',
									status: data.status,
									createdAt: new Date().toISOString(),
								},
								indexedAt: new Date().toISOString(),
							},
							...current.statuses,
						],
					};
				}),
			);
		})}
	>
		{#each statusOptions as status}
			<button
				type="submit"
				name="status"
				value={status}
				class="status-btn"
				aria-label={`set status to ${status}`}
				disabled={!!postStatus.pending}
			>
				{status}
			</button>
		{/each}
	</form>
</section>

<style>
	.picker {
		margin-bottom: 1.5rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background-color: var(--color-bg-elevated);
		padding: 1rem;
	}

	.label {
		margin-bottom: 0.75rem;
		color: var(--color-text-muted);
		font-weight: 500;
		font-size: 0.875rem;
	}

	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.status-btn {
		display: flex;
		justify-content: center;
		align-items: center;
		transition:
			transform 0.1s,
			border-color 0.15s,
			background-color 0.15s;
		cursor: pointer;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		background-color: var(--color-bg);
		width: 3rem;
		height: 3rem;
		font-size: 1.5rem;
	}

	.status-btn:hover:not(:disabled) {
		transform: scale(1.1);
		border-color: var(--color-accent);
		background-color: var(--color-accent-bg);
	}

	.status-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.status-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.status-btn[aria-pressed='true'] {
		border-color: var(--color-accent);
		background-color: var(--color-accent-bg);
	}
</style>
