<script lang="ts">
	// 1. Define Types for the Google Response
	type GoogleSuggestResponse = [
		string, // The original query
		any[], // The list of suggestions
		any[],
		{ 'google:clientdata': { bpc: boolean; tlw: boolean } } // Optional metadata
	];

	// 2. Extend the Window interface to allow our custom callback
	interface Window {
		googleSuggestCallback?: (data: GoogleSuggestResponse) => void;
	}

	let query: string = '';
	let suggestionsList: HTMLUListElement;
	let suggestions: string[] = [];
	let selectedIndex: number = -1;
	let debounceTimer: number | undefined;
	let showSuggestionsList: boolean = true;

	function performSearch(searchText: string) {
		if (!searchText.trim()) return;
		// Redirect to Google Search
		window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchText)}`;
	}

	function getSuggestions() {
		// Basic debounce to prevent spamming requests
		clearTimeout(debounceTimer);
		debounceTimer = window.setTimeout(() => {
			if (query.length < 2) {
				suggestions = [];
				selectedIndex = -1;
				return;
			}

			const callbackName = 'googleSuggestCallback';

			// Define the callback globally so the script can execute it
			(window as any)[callbackName] = (data: GoogleSuggestResponse) => {
                const suggestionsArray = data[1];
                suggestions = suggestionsArray.map(item => item[0]);
				selectedIndex = -1; // Reset selection when new results arrive

				// Cleanup: Remove callback and script tag
				delete (window as any)[callbackName];
				document.getElementById('jsonp-script')?.remove();
			};

			// Create and inject the script tag
			const script = document.createElement('script');
			script.id = 'jsonp-script';
			// client=youtube often bypasses stricter CORS/formatting checks than other clients
			script.src = `https://suggestqueries.google.com/complete/search?client=youtube&q=${encodeURIComponent(query)}&callback=${callbackName}`;
			document.body.appendChild(script);
		}, 200); // Wait 200ms after typing stops
	}

	function handleBlur() {
		// Delay clearing suggestions to allow click event to register
		showSuggestionsList = false;
	}

	function handleFocus() {
		showSuggestionsList = true;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (suggestions.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % suggestions.length;
			query = suggestions[selectedIndex]; // Optional: Update input as you scroll
			suggestionsList.children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length;
			query = suggestions[selectedIndex];
			suggestionsList.children[selectedIndex]?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'Escape') {
			suggestions = [];
			selectedIndex = -1;
		}
	}
</script>

<div class="search-wrapper">
	<form on:submit|preventDefault={() => performSearch(query)} class="search-box glass">
		<span class="icon">🔍</span>
		<input
			type="text"
			bind:value={query}
			on:input={getSuggestions}
			on:keydown={handleKeydown}
			on:blur={handleBlur}
			on:focus={handleFocus}
			placeholder="Search Google..."
			autocomplete="off"
		/>
	</form>

	{#if suggestions.length > 0}
		<ul class="suggestions-list opaque-surface" bind:this={suggestionsList} class:visible={showSuggestionsList}>
			{#each suggestions as item, index}
				<li class:selected={index === selectedIndex} on:click={() => performSearch(item)}>
					{item}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search-wrapper {
		position: relative;
		max-width: 580px;
		width: 100%;
		margin: 50px auto;
	}

	.search-box {
		display: flex;
		align-items: center;
		border-radius: 24px;
		padding: 0 15px;
		height: 46px;
		transition: all 0.1s ease;
	}

	.search-box:focus-within {
		background-color: var(--surface-color);
		box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
		border-color: rgba(223, 225, 229, 0);
	}

	.icon {
		color: #9aa0a6;
		margin-right: 12px;
		font-size: 18px;
	}

	input {
		flex: 1;
		border: none;
		outline: none;
		font-size: 16px;
		background: transparent;
		height: 100%;
		color: #202124;
	}

	.suggestions-list {
		position: absolute;
		top: 55px; /* Push it just below the bar */
		left: 0;
		right: 0;
		border-radius: 12px;
		list-style: none;
		padding: 6px 0;
		margin: 0;
		z-index: 10;
		max-height: 200px;
		overflow-y: auto;
		transition: 0.2s ease-in opacity;
		opacity: 1;
	}

	.suggestions-list:not(.visible) {
		opacity: 0;
	}

	li {
		padding: 10px 20px;
		cursor: pointer;
		font-size: 14px;
		color: #202124;
		display: flex;
		align-items: center;
	}

	/* Highlight for hover or arrow key selection */
	li:hover,
	li.selected {
		background-color: #eee;
		border-radius: 10px;
	}
</style>
