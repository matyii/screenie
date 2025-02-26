<script>
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";

    import ImageGrid from "../ImageGrid.svelte";
</script>

<div class="h-lvh flex justify-center items-center">
    <div class="flex w-1/3 h-1/2">
        <div class="basis-2/3">
            <div class="my-3">
                <h1 class="text-7xl font-bold">screenie</h1>
                <Badge>beta</Badge>
            </div>
            <p class="text-gray-500 text-lg my-3">share your screenshots and videos easily</p>
            <Button>get started</Button>
        </div>
        <div>
            <ImageGrid/>
        </div>
    </div>
</div>
