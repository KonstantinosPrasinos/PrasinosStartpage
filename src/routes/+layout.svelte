<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { settings } from '$lib/store/stores';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Homepage</title>
</svelte:head>

{@render children()}

<style>
	:global(body) {
		/* "Inter" is the family name. */
		font-family: 'Inter', sans-serif;

		/* Makes the text crisp on standard monitors */
		-webkit-font-smoothing: antialiased;

		/* Optional: Improves legibility (adds tail to 'l', open '4', etc.) */
		font-feature-settings: 'cv05', 'cv11', 'ss01';
		width: 100vw;
		height: 100vh;
		margin: 0;

		--background-color: #f9f8f4;
		--surface-color: rgba(255, 252, 245, 0.5);
		--opaque-surface-color: rgb(255, 252, 245);
		--on-background-color: #45403c;
		--on-surface-color: #2d2a26;
		--outline-color: rgba(223, 225, 229, 0.3);

		background-color: var(--background-color);
		color: var(--on-background-color);
	}

	:global(*) {
		transition: background-color 0.2s ease-out, color 0.2s ease-out;
	}

	:global(.dark) {
		--background-color: #181614;
		--surface-color: rgba(40, 38, 35, 0.6);
		--opaque-surface-color: rgb(40, 38, 35);
		--on-background-color: #a8a29e; 
		--on-surface-color: #e7e5e4; 
		--outline-color: rgba(255, 255, 255, 0.1);
	}

	:global(h3) {
		margin: 0;
	}

	:global(.glass) {
		backdrop-filter: blur(20px);
		background-color: var(--surface-color);
		box-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--outline-color);
	}

	:global(.opaque-surface) {
		background-color: var(--opaque-surface-color);
		box-shadow: 0 1px 12px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--outline-color);
	}

	:global(.widget) {
		width: 320px;
		height: 165px;
		border-radius: 20px;
		padding: 12px;
		color: var(--on-surface-color);
	}

	:global(button) {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}
	:global(.icon-button) {
		transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	:global(.icon-button:hover) {
		transform: scale(1.1);
	}
	:global(.icon-button:active) {
		transform: scale(0.9);
	}

	:global(.normal-button) {
		padding: 10px 24px;
		border-radius: 100px;
		background-color: var(--surface-color);
		border: 1px solid rgba(128, 128, 128, 0.3);
		transition: all 0.2s ease-in-out;
		font-weight: 500;
	}

	:global(.normal-button:not(:disabled):hover) {
		background-color: var(--opaque-surface-color);
		border-color: rgba(128, 128, 128, 0.5);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	:global(.normal-button:not(:disabled):active) {
		transform: translateY(0) scale(0.98);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	:global(.normal-button:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}
</style>
