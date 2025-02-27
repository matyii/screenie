<script lang="ts">
    import * as Card from "$lib/components/ui/card/index.js";

    import Sun from "lucide-svelte/icons/sun";
    import Moon from "lucide-svelte/icons/moon";
    
    import { toggleMode } from "mode-watcher";
    import { Button } from "$lib/components/ui/button/index.js";
    import { onMount } from "svelte";
    import anime from "animejs";

    onMount(() => {
      anime({
        targets: 'nav',
        translateY: [-500, 0],
        opacity: 1,
        duration: 2500,
        easing: 'easeOutExpo'
      })
    })
</script>

<nav class="container pt-5 sticky top-0 z-10 opacity-0">
  <Card.Root class="rounded-full px-1 shadow-lg">
    <Card.Content class="py-4">
        <div class="flex justify-between items-center">
            <div class="space-x-2">
              <img class="w-20 inline-block" src="./logo.png" alt="Logo">
              <span class="text-lg">screenie</span>
            </div>
            <Button onclick={toggleMode} variant="outline" size="icon">
              <Sun
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Moon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
        </div>
    </Card.Content>
  </Card.Root>
</nav>