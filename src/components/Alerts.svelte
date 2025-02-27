
<script lang="ts">
    import Info from "lucide-svelte/icons/info";
    import * as Alert from "$lib/components/ui/alert/index.js";

    let alerts: { title: string, description: string }[] = [
        {
            title: "ShareX Integration",
            description: "You can now upload your screenshots directly from ShareX to Screenie. Configure your ShareX settings to use our API."
        },
        {
            title: "New Features",
            description: "Check out the new features in Screenie, including enhanced media management and improved sharing options."
        }
    ]
</script>

{#each alerts as alert}
    <Alert.Root class="w-2/3 m-auto lg:m-0">
        <div class="flex items-start gap-3">
            <div class="bg-secondary rounded-lg border shadow-2xl">
                <Info class="size-5 m-3 text-" />
            </div>
            <div class="inline-block">
                <Alert.Title>{alert.title}</Alert.Title>
                <Alert.Description class="flex">
                    <Alert.Description class="text-muted-foreground">{alert.description}</Alert.Description>
                </Alert.Description>
            </div>
        </div>
    </Alert.Root>
{/each}