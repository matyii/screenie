<script lang="ts">
    import { onMount } from 'svelte';

    import anime from 'animejs';

    onMount(() => {
        anime({
            targets: '#image-grid img',
            scale: '1'
        });
    })

    const randomImage = (): string => {
        return `https://picsum.photos/200/200?random=${Math.random()}`
    }
</script>

<div class="rotate-3d">
    <div id="image-grid" class="grid grid-cols-3 gap-3">
        {#each {length: 3*3}}
            <img 
                class="shadow-2xl"
                style="transform: scale(0);"
                src={randomImage()} 
                alt="A beautiful pic!"
            >
        {/each}
    </div>
</div>


<style>
    :global(.rotate-3d) {
        transform: perspective(100rem) rotateY(-15deg);
    }
</style>