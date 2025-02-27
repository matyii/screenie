<script lang="ts">
    import { onMount, tick } from 'svelte';
    import anime from 'animejs';

    let images: string[] = [];
    let imagesLoaded = false;

    onMount(async () => {
        images = Array.from({ length: 9 }, randomImage);

        await preloadImages(images);
        imagesLoaded = true;

        await tick();

        anime({
            targets: '#image-grid img',
            scale: [0, 1],
            duration: 2500,
            easing: 'easeOutExpo'
        });
    })

    const preloadImages = (urls: string[]): Promise<void[]> => {
        return Promise.all(
            urls.map(
                (url) =>
                    new Promise<void>((resolve) => {
                        const img = new Image();
                        img.src = url;
                        img.onload = () => resolve();
                    })
            )
        );
    };

    const randomImage = (): string => {
        return `https://picsum.photos/200/200?random=${Math.random()}`
    }
</script>

    <div class="w-[300px] lg:w-[500px] rotate-3d">
        <div id="image-grid" class="grid grid-cols-3 gap-3">
            {#if imagesLoaded}
                {#each images as image}
                    <img 
                        id="hover"
                        class="shadow-2xl transition-all cursor-pointer rounded-lg select-none"
                        src={image} 
                        alt="A beautiful pic!"
                    >
                {/each}
            {:else}
                {#each { length: 3*3 }}
                    <div class="aspect-square bg-secondary shadow-2xl transition-all cursor-pointer rounded-lg select-none animate-pulse"></div>
                {/each}
            {/if}
        </div>
    </div>

<style>
    :global(.rotate-3d) {
        transform: perspective(100rem) rotateY(-15deg);
    }

    :global(#hover:hover) {
        transform: scale(1.05) !important;
    }
</style>