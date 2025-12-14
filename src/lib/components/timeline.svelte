<script lang="ts">
	import type { StatusView } from '$lib/status.remote';

	interface Props {
		statuses: StatusView[];
	}

	let { statuses }: Props = $props();

	const getBskyProfileUrl = (handle: string): string => {
		return `https://bsky.app/profile/${handle}`;
	};

	const formatTime = (isoString: string): string => {
		const date = new Date(isoString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);

		if (diffMins < 1) {
			return 'just now';
		}
		if (diffMins < 60) {
			return `${diffMins}m ago`;
		}
		if (diffHours < 24) {
			return `${diffHours}h ago`;
		}

		const isToday = date.toDateString() === now.toDateString();
		if (isToday) {
			return 'today';
		}

		const yesterday = new Date(now);
		yesterday.setDate(yesterday.getDate() - 1);
		if (date.toDateString() === yesterday.toDateString()) {
			return 'yesterday';
		}

		return date.toLocaleDateString();
	};
</script>

{#if statuses.length === 0}
	<div class="empty">
		<p class="empty-emoji">🦋</p>
		<p class="empty-text">no statuses yet</p>
	</div>
{:else}
	<div class="timeline">
		{#each statuses as item}
			<div class="item">
				<div class="emoji">{item.record.status}</div>
				<div class="content">
					<a
						href={getBskyProfileUrl(item.author.handle)}
						target="_blank"
						rel="noopener noreferrer"
						class="author"
					>
						{item.author.displayName ?? `@${item.author.handle}`}
					</a>
					<span class="meta"> · {formatTime(item.indexedAt)}</span>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.empty {
		padding: 3rem 1rem;
		color: var(--color-text-muted);
		text-align: center;
	}

	.empty-emoji {
		margin-bottom: 1rem;
		font-size: 3rem;
	}

	.empty-text {
		font-size: 1rem;
	}

	.timeline {
		position: relative;
	}

	.timeline::before {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 1.5rem;
		transform: translateX(-50%);
		background-color: var(--color-border);
		width: 2px;
		content: '';
	}

	.item {
		display: flex;
		position: relative;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 1.25rem;
	}

	.item:last-child {
		padding-bottom: 0;
	}

	.emoji {
		display: flex;
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		z-index: 1;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-full);
		background-color: var(--color-bg-elevated);
		width: 3rem;
		height: 3rem;
		font-size: 1.5rem;
	}

	.content {
		flex: 1;
		padding-top: 0.75rem;
	}

	.author {
		font-weight: 500;
	}

	.meta {
		color: var(--color-text-muted);
		font-size: 0.875rem;
	}
</style>
