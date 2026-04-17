<script lang="ts">
	import Background from '$lib/components/Background.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import FavoritesWidget from '$lib/components/FavoritesWidget.svelte';
	import QuickSettings from '$lib/components/QuickSettings.svelte';
	import SearchBar from '$lib/components/SearchBar.svelte';
	import WeeklyWeatherWidget from '$lib/components/WeeklyWeatherWidget.svelte';
	import { settings, visibleWidgets, isEditingWidgets, type WidgetType } from '$lib/store/stores';
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import TaskList from '$lib/components/TaskList.svelte';
	import { Plus, Trash, Pencil, Check, PencilSlash } from 'phosphor-svelte';

	type ThemeMode = 'light' | 'dark' | 'auto';

	const showSeconds: boolean = false;
	let modeSetting: ThemeMode = 'light';

	const allWidgets: { id: WidgetType; name: string; component: any }[] = [
		{ id: 'weather', name: 'Weather', component: WeeklyWeatherWidget },
		{ id: 'favorites', name: 'Favorites', component: FavoritesWidget },
		{ id: 'tasks', name: 'Tasks', component: TaskList }
	];

	let widgetInstances: Record<string, any> = {};
	let favoritesEditMode = $state(false);
	let tasksEditMode = $state(false);
	let tasksUser = $state(null);
	let ready = $state(false);

	const removeWidget = (id: WidgetType) => {
		visibleWidgets.update((w) => w.filter((i) => i !== id));
	};

	const addWidget = (id: WidgetType) => {
		visibleWidgets.update((w) => [...w, id]);
	};

	onMount(() => {
		ready = true;
		if (modeSetting === 'light') {
			document.documentElement.classList.remove('dark');
		} else if (modeSetting === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			// auto mode
			const mode: boolean =
				window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
			if (mode) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	});
</script>

<div class="homepage" class:dark={$settings.isLightMode}>
	<Background />
	<div class="widgets side-widgets">
		{#if ready}
			{#each allWidgets as widget, i (widget.id)}
				{@const isVisible = $visibleWidgets.includes(widget.id)}
				{@const isBeingEdited = (widget.id === 'favorites' && favoritesEditMode) || (widget.id === 'tasks' && tasksEditMode)}
				{#if isVisible}
					<div 
						class="widget-wrapper" 
						class:editing={$isEditingWidgets && !isBeingEdited}
						in:fly={{ y: 20, duration: 400, delay: i * 100 }}
					>
						<div class="widget-content">
							{#if widget.id === 'favorites'}
								<svelte:component 
									this={widget.component} 
									bind:this={widgetInstances[widget.id]} 
									bind:isEditMode={favoritesEditMode}
								/>
							{:else if widget.id === 'tasks'}
								<svelte:component 
									this={widget.component} 
									bind:this={widgetInstances[widget.id]} 
									bind:isEditMode={tasksEditMode}
									bind:user={tasksUser}
								/>
							{:else}
								<svelte:component this={widget.component} bind:this={widgetInstances[widget.id]} />
							{/if}
						</div>
						{#if isBeingEdited}
							<div class="edit-mode-controls-above" in:fade={{ duration: 200 }}>
								{#if widget.id === 'favorites'}
									<button
										class="done-button-above"
										on:click={() => widgetInstances[widget.id]?.handleAddFavorite()}
										title="Add new favorite"
									>
										<Plus size={18} />
										<span>Create</span>
									</button>
								{/if}
								<button 
									class="done-button-above" 
									on:click={() => {
										if (widget.id === 'favorites') favoritesEditMode = false;
										if (widget.id === 'tasks') tasksEditMode = false;
									}}
									title="Finish editing"
								>
									<Check size={18} />
									<span>Done</span>
								</button>
							</div>
						{/if}
						{#if $isEditingWidgets && !isBeingEdited}
							<div
								class="remove-overlay"
								on:click|self={() => removeWidget(widget.id)}
								role="button"
								tabindex="0"
								on:keydown={(e) => e.key === 'Enter' && removeWidget(widget.id)}
								in:fade={{ duration: 200 }}
							>
								<div class="overlay-buttons-stack">
									{#if widget.id === 'favorites'}
										<button
											class="remove-button"
											on:click={() => favoritesEditMode = !favoritesEditMode}
										>
											<Pencil size={18} />
											<span>Edit</span>
										</button>
									{/if}

									{#if widget.id === 'tasks' && tasksUser}
										<button 
											class="remove-button"
											on:click={() => tasksEditMode = !tasksEditMode}
										>
											<Pencil size={18} />
											<span>Edit</span>
										</button>
									{/if}

									<button
										class="remove-button"
										title="Remove widget"
										on:click={() => removeWidget(widget.id)}
									>
										<Trash size={18} />
										<span>Remove</span>
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else if $isEditingWidgets}
					<button
						class="widget-placeholder glass widget small"
						on:click={() => addWidget(widget.id)}
						in:fly={{ y: 10, duration: 300, delay: i * 50 }}
					>
						<Plus size={18} />
						<span>Add {widget.name}</span>
					</button>
				{/if}
			{/each}
		{/if}
	</div>
	<div class="widgets middle-widgets">
		<Clock {showSeconds} />
		<SearchBar />
	</div>
	<div class="widgets side-widgets">
		<QuickSettings />
	</div>
</div>

<style>
	.homepage {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;

		display: flex;
		justify-content: space-between;
	}

	.widgets {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 0 20px;
		box-sizing: border-box;
	}

	.side-widgets {
		justify-content: flex-start;
		padding: 20px;
		width: 396px;
		gap: 20px;
	}

	.middle-widgets {
		justify-content: center;
		gap: 40px;
		flex-grow: 1;
	}

	.widget-wrapper {
		position: relative;
		border-radius: 20px;
		overflow: visible;
	}

	.widget-content {
		transition: filter 0.2s ease;
	}

	.editing .widget-content {
		filter: blur(4px);
		pointer-events: none;
	}

	.remove-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
		animation: fadeIn 0.15s ease-in-out;
		width: 100%;
		height: 100%;
		cursor: pointer;
	}

	.overlay-buttons-stack {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: center;
	}

	.edit-mode-controls-above {
		position: absolute;
		top: -40px;
		right: 0;
		display: flex;
		gap: 8px;
		z-index: 25;
	}

	.remove-button,
	.done-button-above {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 6px;
		background-color: var(--opaque-surface-color);
		color: var(--on-surface-color);
		padding: 6px 14px;
		border-radius: 100px;
		font-weight: 500;
		font-size: 13px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: transform 0.2s ease, background-color 0.2s ease;
		border: 1px solid var(--outline-color);
		cursor: pointer;
	}

	.remove-button:hover,
	.done-button-above:hover {
		transform: scale(1.05);
		background-color: var(--surface-color);
	}

	.remove-button:active,
	.done-button-above:active {
		transform: scale(0.95);
	}

	/* Remove the old .remove-overlay:hover .remove-button selector if it exists */


	.widget-placeholder {
		position: relative;
		min-height: 60px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-weight: 500;
		font-size: 14px;
		transition: transform 0.2s ease, background-color 0.2s ease;
	}

	.widget-placeholder:hover {
		transform: scale(1.02);
		background-color: var(--surface-color);
	}

	.widget-placeholder:active {
		transform: scale(0.98);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: scale(0.95); }
		to { opacity: 1; transform: scale(1); }
	}
</style>
