// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: object) => void;
                    renderButton: (parent: HTMLElement, options: object) => void;
                    prompt: () => void;
                };
            };
            // This line allows other Google APIs (like Maps) to coexist without errors
            [key: string]: unknown; 
        };
    }
}

export { };
