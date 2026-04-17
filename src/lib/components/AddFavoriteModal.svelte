<script lang="ts">
	import type { Favorite } from './FavoritesWidget.svelte';

	let visible = false;
	let url: string = '';
	let urlIsOk: boolean = false;
	let titleIsOk: boolean = false;
	let title: string = '';
	let buttonDisabled: boolean = true;
	let resolvePromise: (value: Favorite | null) => void;

	// 1. Export a function that returns a Promise
	export function open(): Promise<Favorite | null> {
		visible = true;
		return new Promise((resolve) => {
			resolvePromise = resolve;
		});
	}

	// 2. Resolve the promise with the chosen value
	function close() {
		visible = false;
        title = '';
		url = '';
		if (resolvePromise) resolvePromise(null);
	}

	const addFavorite = () => {
		visible = false;
		if (resolvePromise)
			resolvePromise({
				title: title,
				url: url,
				faviconUrl: `https://icons.duckduckgo.com/ip3/${new URL(url).hostname}.ico`
			});
		title = '';
		url = '';
	};

	const onUrlInput = (event: Event) => {
		url = (event.target as HTMLInputElement).value.trim();
		try {
			new URL(url);
			urlIsOk = true;
		} catch {
			urlIsOk = false;
		}
	};

	const onTitleInput = (event: Event) => {
		title = (event.target as HTMLInputElement).value.trim();

		titleIsOk = title.length > 0;
	};
</script>

{#if visible}
	<div class="overlay">
		<div class="modal">
			<h3 class="title">Add Favorite</h3>
			<div class="input-group">
				<label for="title-input">Enter the Title of the favorite:</label>
				<input
					id="title-input"
					type="text"
					bind:value={title}
					placeholder="Type your title..."
					on:input={onTitleInput}
				/>
			</div>
			<div class="input-group">
				<label for="url-input">Enter the URL of the favorite:</label>
				<input
					id="url-input"
					type="text"
					bind:value={url}
					placeholder="Type your URL..."
					on:input={onUrlInput}
				/>
			</div>
			<div class="actions">
				<button on:click={() => close()} class="normal-button">Cancel</button>
				<button
					on:click={() => addFavorite()}
					disabled={!urlIsOk || !titleIsOk}
					class="normal-button primary">Confirm</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	.title {
		margin: 0;
		margin-bottom: 20px;
		font-size: 1.25rem;
		font-weight: 600;
	}
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: grid;
		place-items: center;
		z-index: 100;
        backdrop-filter: blur(4px);
	}
	.modal {
		background: var(--opaque-surface-color);
        color: var(--on-surface-color);
		padding: 30px;
		border-radius: 24px;
		display: flex;
		flex-direction: column;
		gap: 10px;
        width: 400px;
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
        border: 1px solid var(--outline-color);
	}
	.actions {
		display: flex;
		gap: 12px;
		margin-top: 20px;
        justify-content: flex-end;
	}

    .primary {
        background-color: var(--on-background-color) !important;
        color: var(--background-color) !important;
        font-weight: 600;
        border: 1px solid transparent !important;
    }

    .primary:not(:disabled):hover {
        opacity: 0.9;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
    }

    .primary:not(:disabled):active {
        transform: translateY(0);
    }

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		margin-bottom: 12px;
	}

	label {
		font-size: 0.85rem;
		font-weight: 500;
		opacity: 0.8;
		margin-left: 2px;
	}

	input {
		font-family: inherit;
		font-size: 1rem;
		padding: 12px 16px;
		border-radius: 12px;
		border: 1px solid var(--outline-color);
		background-color: var(--surface-color);
		color: var(--on-surface-color);
		outline: none;
		transition: all 0.1s ease-in-out;
		width: 100%;
		box-sizing: border-box;
	}

	input::placeholder {
		color: var(--on-surface-color);
		opacity: 0.4;
	}

	input:hover {
		background-color: var(--opaque-surface-color);
	}

	input:focus {
		border-color: var(--on-background-color);
		background-color: var(--opaque-surface-color);
		box-shadow: 0 0 0 4px var(--outline-color);
	}
</style>
