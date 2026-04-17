<script lang="ts">
	import { settings } from '$lib/store/stores';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let prevThemeWasLight: Boolean = true;

	const colors: string[] = [
		'#1abc9c',
		'#2ecc71',
		'#3498db',
		'#9b59b6',
		'#16a085',
		'#27ae60',
		'#2980b9',
		'#8e44ad',
		'#f1c40f',
		'#e67e22',
		'#e74c3c',
		'#f39c12',
		'#d35400',
		'#c0392b'
	];

	const darkColors: string[] = [
		'#48C9B0', // Soft Turquoise
		'#58D68D', // Soft Emerald
		'#5DADE2', // Soft Blue
		'#A569BD', // Soft Purple
		'#45B39D', // Muted Teal
		'#52BE80', // Muted Green
		'#5499C7', // Muted Blue
		'#AF7AC5', // Muted Violet
		'#F4D03F', // Soft Yellow (Moonlight)
		'#EB984E', // Soft Orange
		'#EC7063', // Soft Red
		'#F5B041', // Muted Gold
		'#DC7633', // Muted Bronze
		'#E74C3C' // Muted Terra Cotta
	];

	function getRandomInt(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getCssVar(name: string) {
		const elements = document.getElementsByClassName('homepage');

		if (elements.length === 0) return 'transparent';

		return getComputedStyle(elements[0]).getPropertyValue(name).trim() || 'transparent';
	}

	const draw = () => {
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const width = window.innerWidth;
		const height = window.innerHeight;

		canvas.width = width;
		canvas.height = height;

		ctx.clearRect(0, 0, width, height);

		const circleRadius = Math.sqrt(width * width + height * height) / 2;
		const bgColor = getCssVar('--background-color');

		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);

		const circles = [
			{ x: 0, y: 0 }, // Top-Left
			{ x: width, y: 0 }, // Top-Right
			{ x: width / 2, y: height * 1.5 } // Center
		];

		circles.forEach((circle) => {
			let color;

			if ($settings.isLightMode) {
				color = colors[getRandomInt(0, colors.length - 1)];
			} else {
				color = darkColors[getRandomInt(0, colors.length - 1)];
			}
			

			const g = ctx.createRadialGradient(circle.x, circle.y, 0, circle.x, circle.y, circleRadius);

			g.addColorStop(0, color);
			g.addColorStop(1, bgColor); // Fade into background color

			ctx.fillStyle = g;

			// Move to the position and draw
			ctx.beginPath();
			ctx.arc(circle.x, circle.y, circleRadius, 0, Math.PI * 2);
			ctx.fill();
		});
	};

	const handleThemeUpdate = () => {
		if (prevThemeWasLight !== $settings.isLightMode) {
			prevThemeWasLight = $settings.isLightMode
			setTimeout(draw, 10);
		}
	};

	$: ($settings, handleThemeUpdate());

	onMount(() => {
		requestAnimationFrame(draw);
	});
</script>

<div>
	<div class="background-blur"></div>
	<canvas bind:this={canvas}></canvas>
</div>

<style>
	.background-blur {
		position: fixed;
		top: -50px;
		left: -50px;
		width: calc(100% + 100px);
		height: calc(100% + 100px);
		z-index: -10;
		backdrop-filter: blur(100px);
		pointer-events: none;
	}

	canvas {
		position: fixed;
		top: -50px;
		left: -50px;
		width: calc(100% + 100px);
		height: calc(100% + 100px);
		z-index: -20;
		pointer-events: none;
	}
</style>
