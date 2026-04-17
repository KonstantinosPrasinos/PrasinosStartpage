<script lang="ts">
	import { onMount, tick } from 'svelte';
	import LoadingIndicator from './LoadingIndicator.svelte';

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
		_id: string,
		priority?: number,
	}

	import { SignOut, User as UserIcon, CaretRight } from 'phosphor-svelte';
	import taskflowIcon from '$lib/assets/taskflow-icon.png';

	let { isEditMode = $bindable(false), user = $bindable(null) } = $props();

	let divRef: HTMLElement;
	let isLoading: boolean = $state(false);
	let taskList: Array<Task> = $state([]);
	let categoryList: Array<Category> = $state([]);
	let categoryTasks: Record<string, Task[]> = $state({})

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

		taskList = taskList.filter(task => task.currentEntry && task.currentEntry.value === 0).sort((a, b) => b.priority - a.priority)
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

		categoryList = data.categories.sort((a, b) => (b.priority ?? 0 )- (a.priority ?? 0));

		categoryList.forEach(category => {
			categoryTasks[category._id] = taskList.filter(task => task.category === category._id);

			const set1 = new Set(categoryTasks[category._id]);
			taskList = taskList.filter(task => !set1.has(task));
		})
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

		const data = await response.json();

		localStorage.setItem('user', JSON.stringify(data));

		user = data['user'];
		initialize()
	};

	const logout = async () => {
		const response = await fetch(`${import.meta.env.VITE_BACK_END_IP}/api/user/logout`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include'
		});

		if (!response.ok) {
			throw new Error((await response.json()).message);
		}

		localStorage.removeItem('user');
		user = null;
		
		await tick();
		attemptRenderGoogle();
	}

	const attemptRenderGoogle = () => {
		if (!divRef) {
			setTimeout(attemptRenderGoogle, 100);
			return;
		}

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
		} catch {
			setTimeout(attemptRenderGoogle, 200);
		}
	};

	const initialize = async (userStr?: string) => {
		isLoading = true;

		if (userStr) {
			user = JSON.parse(userStr)['user'];
		}
		await fetchTasks();
		await fetchCategories();

		isLoading = false;
	};

	const getColorVariable = (color: Category['color']) => {
		const mapping: Record<Category['color'], string> = {
			Red: 'var(--red-color)',
			Orange: 'var(--orange-color)',
			Yellow: 'var(--yellow-color)',
			Green: 'var(--green-color)',
			LightBlue: 'var(--light-blue-color)',
			Blue: 'var(--blue-color)',
			Purple: 'var(--purple-color)'
		};
		return mapping[color] || 'var(--on-surface-color)';
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
	<div class="glass widget large">
		{#if isEditMode && user}
			<div class="user-profile-overlay">
				<div class="promo-header">
					<div class="taskflow-logo">
						<img src={taskflowIcon} alt="Taskflow icon" />
					</div>
					<h3>Taskflow</h3>
				</div>

				<p class="Body-Small promo-text">
					Your tasks are synced with the <strong>Taskflow</strong> cloud. Any changes you make 
					in the full app will reflect here automatically.
				</p>

				<div class="user-info">
					<div class="user-avatar">
						<UserIcon size={32} weight="duotone" />
					</div>
					<div class="user-details">
						<div class="user-label Body-Small">Logged in as:</div>
						<div class="user-email Body-Medium">{user.local.email}</div>
					</div>
				</div>

				<div class="promo-actions">
					<button class="logout-button" on:click={() => { logout(); isEditMode = false; }}>
						<SignOut size={18} />
						<span>Logout</span>
					</button>
					<a href="https://taskflow.kprasinos.com" target="_blank" rel="noopener noreferrer" class="external-link Body-Small">
						Open Full App <CaretRight size={14} />
					</a>
				</div>
			</div>
		{/if}
		{#if isLoading}
			<LoadingIndicator />
		{:else if user === null}
			<div class="taskflow-promo">
				<div class="promo-header">
					<div class="taskflow-logo">
						<img src={taskflowIcon} alt="Taskflow icon" />
					</div>
					<h3>Taskflow</h3>
				</div>
				<p class="Body-Small promo-text">
					Stay organized with <strong>Taskflow</strong>. This widget syncs directly with your 
					tasks, categories, and progress from the full app.
				</p>
				
				<div class="promo-actions">
					<div bind:this={divRef} class="login-container"></div>
					<a href="https://taskflow.kprasinos.com" target="_blank" rel="noopener noreferrer" class="external-link Body-Small">
						Open Full App <CaretRight size={14} />
					</a>
				</div>
			</div>
		{:else}
			<div class="tasks-container">
				{#each categoryList as category (category._id)}
					{#if categoryTasks[category._id].length > 0}
						<div class="task-container category">
							<div class="category-title Body-Small" style="background-color: {getColorVariable(category.color)}">
								{category.title}
							</div>
							{#each categoryTasks[category._id] as task (task._id)}
								<div class="task">
									<div class="task-left-side">
										<div class="task-title Body-Medium">
											{task.title}
										</div>
										<div class="task-description Body-Small">
											{task.description}
										</div>
									</div>
									<button class="task-button" on:click={setCurrentEntry} title="Set current entry">
									</button>
								</div>
							{/each}
						</div>
					{/if}
				{/each}
				{#each taskList as task (task._id)}
					<div class="task-container task">
						<div class="task-left-side">
							<div class="task-title Body-Medium">
								{task.title}
							</div>
							<div class="task-description Body-Small">
								{task.description}
							</div>
						</div>
						<button class="task-button" on:click={setCurrentEntry} title="Set current entry">
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
	.widget.large {
		position: relative;
		overflow: visible;
	}

	.tasks-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow-y: auto;

		height: 100%;
	}

	.user-profile-overlay {
		position: absolute;
		inset: 0;
		background: var(--opaque-surface-color);
		z-index: 15;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		padding: 24px;
		border-radius: 20px;
		animation: fadeIn 0.15s ease-in-out;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 12px;
		background: var(--surface-color);
		padding: 10px 14px;
		border-radius: 16px;
		border: 1px solid var(--outline-color);
		width: 100%;
		box-sizing: border-box;
	}

	.user-avatar {
		background: var(--outline-color);
		padding: 8px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--on-surface-color);
	}

	.user-details {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.user-label {
		opacity: 0.6;
	}

	.user-email {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.logout-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 6px;
		background-color: var(--on-background-color);
		color: var(--background-color);
		padding: 8px 16px;
		border-radius: 100px;
		font-weight: 500;
		font-size: 14px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: transform 0.2s ease, opacity 0.2s ease;
		cursor: pointer;
	}

	.logout-button:hover {
		transform: scale(1.05);
		opacity: 0.9;
	}

	.logout-button:active {
		transform: scale(0.95);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: scale(0.98); }
		to { opacity: 1; transform: scale(1); }
	}

	.task-container {
      flex-shrink: 0;
      width: 100%;
      overflow: hidden;
      box-sizing: border-box;
      background-color: var(--opaque-surface-color);
      border: 1px solid var(--outline-color);

      border-radius: 16px;

      padding: 4px;
      gap: 6px;
	}

	.category {
      display: flex;
      gap: 10px;
			flex-direction: column;
	}

	.category-title {
      border-radius: 100px;
      padding: 4px 7px;
			color: var(--on-surface-color);
			width: max-content;
	}
	.task {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		align-items: center;
	}

	.task-button {
      font-size: 14px;
      height: 19.6px;
      width: 19.6px;
      border: 2px solid var(--checkbox-color);
      border-radius: 18px;
      color: var(--checkbox-color);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      position: relative;
	}

	.task-button:hover {
			background-color: var(--checkbox-color);
	}

	.task-description {
			opacity: 0.37;
	}

	.taskflow-promo {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		padding: 20px;
		gap: 20px;
	}

	.promo-header {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.taskflow-logo {
		width: 44px;
		height: 44px;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 12px;
		overflow: hidden;
	}

	.taskflow-logo img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.promo-text {
		max-width: 240px;
		opacity: 0.8;
		line-height: 1.6;
	}

	.promo-actions {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		width: 100%;
	}

	.login-container {
		display: flex;
		justify-content: center;
		min-height: 40px;
	}

	.external-link {
		color: var(--on-surface-color);
		text-decoration: none;
		display: flex;
		align-items: center;
		gap: 4px;
		opacity: 0.6;
		transition: opacity 0.2s ease, transform 0.2s ease;
		font-weight: 500;
	}

	.external-link:hover {
		opacity: 1;
		transform: translateX(2px);
	}
</style>
