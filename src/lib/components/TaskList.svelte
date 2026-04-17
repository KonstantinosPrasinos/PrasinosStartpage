<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingIndicator from './LoadingIndicator.svelte';
	import { CaretLeft, CaretRight, Cat, Check, Pencil } from 'phosphor-svelte';

	type GoogleResponse = {
		clientId: string;
		client_id: string;
		credential: string;
		select_by: string;
	};

	interface GetTasksResponse {
		tasks: Array<Task>;
		currentEntries: Array<Entry>;
	}

	interface GetCategoriesResponse {
		categories: Array<Category>
	}

	type User = {
		googleId: string;
		local: {
			email: string;
		};
		_id: string;
	};

	type Task = {
		category: string;
		currentEntryId: string;
		description: string;
		group: string;
		hidden: boolean;
		priority: number;
		title: string;
		type: 'Checkbox' | 'Number';
		_id: string;
		currentEntry: Entry | undefined;
	};

	type Entry = {
		date: string;
		taskId: string;
		_id: string;
		value: number;
	};

	type Category = {
		color: 'Red' | 'Orange' | 'Yellow' | 'Green' | 'LightBlue' | 'Blue' | 'Purple',
		title: string,
		_id: string
	}

	let divRef: HTMLElement;
	let isLoading: boolean = false;
	let user: User | null = null;
	let taskList: Array<Task> = [];
	let categoryList: Array<Category> = [];
	let allCategoriesSelected: boolean = true;

	const fetchTasks = async () => {
		const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/task`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error((await response.json()).message);
		}

		const data: GetTasksResponse = await response.json();

		taskList = data.tasks.map((task) => {
			task.currentEntry = data.currentEntries.find((entry) => entry._id === task.currentEntryId);

			return task;
		});
	};

	const fetchCategories = async () => {
		const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/category`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error((await response.json()).message);
		}

		const data: GetCategoriesResponse = await response.json();

		categoryList = data.categories;
	};

	const handleCredentialResponse = (response: GoogleResponse) => {
		loginWithGoogle(response);
	};

	const loginWithGoogle = async (googleResponse: GoogleResponse) => {
		const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/user/google`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(googleResponse),
			credentials: 'include'
		});

		const data: User = await response.json();

		localStorage.setItem('user', JSON.stringify(data));

		user = data;
	};

	const attemptRenderGoogle = () => {
		try {
			if (window?.google) {
				window?.google?.accounts?.id?.initialize({
					client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
					callback: handleCredentialResponse
				});

				window.google.accounts.id.renderButton(divRef, {
					theme: 'outline',
					size: 'large',
					shape: 'pill'
				});
			} else {
				// Sometimes it doesn't load instantly for some reason so try again after 200ms
				setTimeout(attemptRenderGoogle, 200);
			}
		} catch (_) {
			setTimeout(attemptRenderGoogle, 200);
		}
	};

	const initialize = async (userStr: string) => {
		isLoading = true;

		user = JSON.parse(userStr);
		await fetchTasks();
		await fetchCategories();

		isLoading = false;
	};

	const setCurrentEntry = () => {};

	onMount(() => {
		const localStorageUser = localStorage.getItem('user');

		if (localStorageUser) {
			initialize(localStorageUser);
		} else {
			attemptRenderGoogle();
		}
	});
</script>

<div class="widget-container">
	<div class="glass widget small categories-container">
		<button class=""><CaretLeft /></button>
		<div class="categories-title">
			Selected categories: 
		</div>
		<button class=""><CaretRight /></button>
		<!-- {#if allCategoriesSelected}
			<button class="category" title="Edit categories">
				All
				<Pencil />
			</button>
		{/if} -->
	</div>
	<div class="glass widget large">
		{#if isLoading}
			<LoadingIndicator />
		{:else if user === null}
			<div bind:this={divRef}></div>
		{:else}
			<div class="tasks-container">
				{#each taskList as task}
					<div class="task">
						<div class="task-left-side">
							<div class="task-title">
								{task.title}
							</div>
							{task.description}
						</div>
						<button class="task-button" on:click={setCurrentEntry} title="Set current entry">
							<Check size={20} />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.widget-container {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.categories-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.categories-title {
		font-size: 20px;
		font-weight: 500;
	}
	.category {
		border: 1px solid var(--outline-color);
		background-color: var(--opaque-surface-color);
		padding: 4px 8px;
		border-radius: 20px;

		display: flex;
		gap: 10px;

		font-size: 20px;
	}
	.tasks-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow-y: auto;

		height: 100%;
	}
	.task {
		flex-shrink: 0;
		width: 100%;
		overflow: hidden;
		box-sizing: border-box;
		background-color: var(--opaque-surface-color);
		border: 1px solid var(--outline-color);

		padding: 10px;
		border-radius: 16px;

		display: flex;
		justify-content: space-between;
		gap: 10px;
		align-items: center;
	}

	.task-button {
		padding: 4px;
		background-color: var(--on-surface-color);
		color: var(--surface-color);
		border: 1px solid var(--outline-color);
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		border-radius: 28px;
	}
</style>
