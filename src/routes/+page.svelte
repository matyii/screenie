<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";

    import Terminal from "lucide-svelte/icons/terminal";
    import * as Alert from "$lib/components/ui/alert/index.js";

    import ImageGrid from "../components/ImageGrid.svelte";
    import NavBar from "../components/NavBar.svelte";
    import LoginDialog from "../components/LoginDialog.svelte";
</script>

<div class="h-lvh flex flex-col">
    <NavBar/>
    <div class="flex grow justify-center flex-col relative">
        <div class="h-full w-full bg-[url(pattern.svg)] bg-cover absolute opacity-40 -z-10"></div>
        <div class="flex justify-center h-1/2 container">
            <div class="pe-10">
                <div class="mb-2">
                    <h1 class="inline-block text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-400">
                        screenie
                    </h1>
                    <Badge class="inline-block align-top mt-5" variant="outline">beta</Badge>
                </div>
                <p class="text-gray-500 text-lg mb-5">Easily share your screenshots and videos with friends and colleagues. Upload, manage, and showcase your media effortlessly.</p>
    
                <div class="mb-5">
                    <Alert.Root class="w-2/3 mb-2">
                        <Terminal class="size-4" />
                        <Alert.Title>Heads up!</Alert.Title>
                        <Alert.Description class="">You can add components to your app using the cli.</Alert.Description>
                    </Alert.Root>
        
                    <Alert.Root class="w-2/3">
                        <Terminal class="size-4" />
                        <Alert.Title>Heads up!</Alert.Title>
                        <Alert.Description>You can add components to your app using the cli.</Alert.Description>
                    </Alert.Root>
                </div>
    
                <Button>Get started!</Button>
                <LoginDialog />
            </div>
            <div>
                <ImageGrid/>
            </div>
        </div>
    </div>
</div>

<style>
    :global(.pattern-dark) {
        background-image: url('../pattern-dark.svg');
        background-size: cover;
    }

    :global(.pattern-light) {
        background-image: url('../pattern-light.svg');
        background-size: cover;
    }
</style>