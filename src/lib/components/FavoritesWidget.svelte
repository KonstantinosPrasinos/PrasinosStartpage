<script context="module" lang="ts">
	export type Favorite = {
		title: string;
		url: string;
		faviconUrl: string;
	};
</script>

<script lang="ts">
	import { Trash, Plus } from 'phosphor-svelte';
	import AddFavoriteModal from './AddFavoriteModal.svelte';
	import { onMount } from 'svelte';

	let { isEditMode = $bindable(false) } = $props();

	let favorites: Favorite[] = $state([]);
	let modal: AddFavoriteModal;

	onMount(() => {
		// Load favorites from localStorage if available
		const storedFavorites = localStorage.getItem('favorites');
		if (storedFavorites) {
			favorites = JSON.parse(storedFavorites);
		}
	});

	const addFavorite = (favorite: Favorite) => {
		favorites = [...favorites, favorite];

		localStorage.setItem('favorites', JSON.stringify(favorites));
	};

	export async function handleAddFavorite() {
		// 2. Wait for the user to click a button
		const favorite = await modal.open();

		if (favorite) {
			addFavorite(favorite);
		}
	}

	export const toggleEditMode = () => {
		isEditMode = !isEditMode;
	};

	const deleteFavorite = (favorite: Favorite) => {
		favorites = favorites.filter((f) => f !== favorite);
		localStorage.setItem('favorites', JSON.stringify(favorites));
	};
</script>

<div class="favorites-widget glass widget">
	{#if favorites.length === 0}
		<div class="empty-favorites">
			<button class="add-favorite-empty-button icon-button" on:click={handleAddFavorite}>
				<Plus size={32} />
				<span>Add Favorite</span>
			</button>
		</div>
	{:else}
		<div class="favorites-list">
			{#each favorites as favorite}
				<div class="favorite-item-container">
					{#if isEditMode}
						<button
							title="Delete favorite"
							class="edit-item-button icon-button"
							on:click={() => deleteFavorite(favorite)}
						>
							<Trash size={28} />
						</button>
					{/if}
					<a href={favorite.url} class="favorite-item" target="_blank" rel="noopener noreferrer">
						<img
							src={favorite.faviconUrl}
							alt="Favicon of {favorite.title}"
							class="favorite-favicon"
						/>
						<span class="favorite-title">{favorite.title}</span>
					</a>
				</div>
			{/each}
		</div>
	{/if}
</div>

<AddFavoriteModal bind:this={modal} />

<style>
	.favorites-widget {
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		overflow: visible;
	}

	.empty-favorites {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		min-height: 120px;
	}

	.add-favorite-empty-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		color: var(--on-surface-color);
		background: transparent;
		border: none;
		cursor: pointer;
		opacity: 0.7;
		transition:
			opacity 0.2s ease,
			transform 0.2s ease;
	}

	.add-favorite-empty-button:hover {
		opacity: 1;
		transform: scale(1.05);
	}

	.favorites-list {
		height: 100%;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 12px;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.favorite-item {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		flex-direction: column;
		color: var(--on-surface-color);
		text-decoration: none;
		overflow: hidden;
		border-radius: 10px;
		padding: 2px;

		animation: fadeIn 0.1s ease-in-out;
		order: 1px solid transparent;
		transition:
			border-color 0.05s ease-in-out,
			background-color 0.05s ease-in-out;
		cursor: pointer;
		width: 100%;
		height: 100%;
	}

	.favorite-item:hover {
		border-color: var(--outline-color);
		background-color: var(--opaque-surface-color);
	}

	.favorite-item img {
		transition: transform 0.1s ease-in-out;
	}

	.favorite-favicon {
		width: 36px;
		height: 36px;
	}

	.favorite-title {
		font-size: 0.8rem;
		text-align: center;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}

	.row {
		display: flex;
		gap: 8px;
	}

	.favorite-item-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.favorite-item-container:has(.edit-item-button) .favorite-item {
		pointer-events: none;
	}

	.favorite-item-container:has(.edit-item-button) .favorite-item img {
		transform: scale(0.8);
	}

	.edit-item-button {
		position: absolute;
		width: 36px;
		height: 36px;
		background-color: var(--opaque-surface-color);
		color: var(--on-surface-color);
		border-radius: 50%;
		top: 0;
		padding: 6px;
		display: flex;
		align-items: center;
		justify-content: center;

		animation: fadeIn 0.1s ease-in-out;
		z-index: 2;

		color: var(--on-surface-color);
	}
</style>
