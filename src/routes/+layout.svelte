<script lang="ts">
    import { onMount } from 'svelte';
	import '../app.css';
	import { ModeWatcher, mode } from "mode-watcher";
	let { children } = $props();

	onMount(() => {
		const background = document.getElementById('bgx');

		$effect(() => {
			if ($mode == 'dark') {
				console.log(background, 'dark')
                background?.classList.add('pattern-dark');
                background?.classList.remove('pattern-light');

				console.log(background?.classList)
            } else if ($mode == 'light') {
                background?.classList.add('pattern-light');
                background?.classList.remove('pattern-dark');
			}
		})
	})
</script>

<ModeWatcher />
{@render children()}
