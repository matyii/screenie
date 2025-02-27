<script lang="ts">
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";


    import NavBar from "../components/NavBar.svelte";
    import Alerts from "../components/Alerts.svelte";
    import ImageGrid from "../components/ImageGrid.svelte";

    import LoginDialog from "../components/LoginDialog.svelte";
</script>

<div>
    <div class="h-lvh flex flex-col">
        <div class="h-full w-full bg-[url(pattern.svg)] bg-cover absolute opacity-35 -z-10"></div>

        <NavBar/>
        <div class="flex grow justify-center flex-col relative text-center lg:text-start">
            <div class="flex flex-col gap-10 lg:flex-row justify-center h-1/2 container">
                <div class="order-2 lg:order-1">
                    <div class="mb-1">
                        <h1 class="inline-block text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-purple-600 to-pink-400">
                            screenie
                        </h1>
                        <div class="block md:inline-block align-top md:mt-5">
                            <Badge variant="outline">beta</Badge>
                        </div>
                    </div>
                    <p class="text-gray-500 text-lg">Easily share your screenshots and videos with friends and colleagues. Upload, manage, and showcase your media effortlessly.</p>
        
                    <div class="text-start space-y-2 my-3">
                        <Alerts/>
                    </div>
        
                    <Button>Get started!</Button>
                    <LoginDialog />
                </div>
                <div class="order-1 lg:order-2 m-auto">
                    <ImageGrid/>
                </div>
            </div>
        </div>
    </div>
    
    <div class="h-50 bg-primary">
        <div class="container text-secondary py-10">
            <h1>Lorem ipsum dolor sit amet.</h1>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dignissimos incidunt ab, enim consectetur pariatur beatae ea esse libero eos quisquam? Voluptate, eveniet ducimus. Laboriosam rem iure ab, laudantium officiis officia architecto cum modi magnam! Qui id voluptas quibusdam adipisci, doloribus minus doloremque nobis odio soluta, rerum voluptate ex sequi dicta sint ratione debitis fugit sit velit rem labore dolores similique tenetur eos fugiat? Assumenda dolore inventore accusantium quia est necessitatibus, eius possimus maxime ut quibusdam odio facere illum saepe incidunt neque distinctio fugiat nostrum! Quo deleniti, neque in possimus facere vero. Facilis id dignissimos quas atque illum, tenetur ipsa inventore?</p>
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