<script lang="ts">
	import { settings, isEditingWidgets } from '$lib/store/stores';
	import { Gear, Moon, Sun, X, Pencil, Check } from 'phosphor-svelte';

	let isExpanded: Boolean = false;

	const toggleQuickSettings = () => {
		isExpanded = !isExpanded;
	};

	const toggleDarkMode = () => {
		settings.update(s => ({ ...s, isLightMode: !s.isLightMode }));
	}

    const toggleTemperature = () => {
        settings.update(s => ({ ...s, isNormal: !s.isNormal }));
    }

	const toggleEditWidgets = () => {
		isEditingWidgets.update(v => !v);
	}
</script>

<div class="quick-settings">
    <button
		class="hovering-button icon-button"
		title="Toggle quick settings"
		on:click={toggleQuickSettings}
	>
		{#if isExpanded}
			<div class="toggled-icon-button">
				<X size={24} />
			</div>
		{:else}
			<div class="toggled-icon-button">
				<Gear size={24} />
			</div>
		{/if}
	</button>
	<div class="quick-settings-container" class:visible={isExpanded}>
		<button class="hovering-button icon-button" title="Toggle dark mode" on:click={toggleDarkMode}>
			{#if $settings.isLightMode}
				<div class="toggled-icon-button">
					<Moon size={24} />
				</div>
			{:else}
				<div class="toggled-icon-button">
					<Sun size={24} />
				</div>
			{/if}
		</button>
        <button class="hovering-button icon-button" title="Toggletemperature scale" on:click={toggleTemperature}>
			{#if $settings.isNormal}
				<div class="toggled-icon-button">
					°C
				</div>
			{:else}
				<div class="toggled-icon-button">
					°F
				</div>
			{/if}
		</button>
		<button class="hovering-button icon-button" title="Edit widgets" on:click={toggleEditWidgets}>
			<div class="toggled-icon-button">
				{#if $isEditingWidgets}
					<Check size={24} />
				{:else}
					<Pencil size={24} />
				{/if}
			</div>
		</button>
	</div>
</div>

<style>
	.quick-settings {
		position: absolute;
		top: 10px;
		right: 10px;
	}

	.hovering-button {
		background-color: var(--opaque-surface-color);
        color: var(--on-surface-color);
		width: 40px;
		height: 40px;
		border-radius: 40px;

		display: flex;
		justify-content: center;
		align-items: center;
		transform: scale(0.8);

		padding: 4px;
	}

    .quick-settings-container {
        transform: scale(0.8) translateY(-10px);
        opacity: 0;
        
        transition: transform 0.1s ease-out, opacity 0.1s ease-out;
    }

    .visible {
        transform: scale(1) translateY(0);
        opacity: 1;
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

	.toggled-icon-button {
		animation: fadeIn 0.1s ease-in-out;

		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
