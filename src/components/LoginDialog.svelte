<script lang="ts">
    import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";    
    let checked = $state(false);
</script>

<Dialog.Root>
    <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>Log in</Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Log in or Register</Dialog.Title>
            <Dialog.Description>
                Enter your credentials to log in or register.
            </Dialog.Description>
        </Dialog.Header>
        <Tabs.Root value="login" class="w-full">
            <Tabs.List class="grid w-full grid-cols-2">
                <Tabs.Trigger value="login">Log in</Tabs.Trigger>
                <Tabs.Trigger value="register">Register</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="login">
                <div class="p-4">
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">Log in</h2>
                        <p class="text-sm text-gray-600">Enter your email and password to log in.</p>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" class="mt-1 w-full" />
                        </div>
                        <div>
                            <Label for="password">Password</Label>
                            <Input id="password" type="password" placeholder="********" class="mt-1 w-full" />
                        </div>
                    </div>
                    <div class="mt-6 flex justify-center">
                        <Button type="submit" class="w-full">Log in</Button>
                    </div>
                </div>
            </Tabs.Content>
            <Tabs.Content value="register">
                <div class="p-4">
                    <div class="mb-4">
                        <h2 class="text-lg font-semibold">Register</h2>
                        <p class="text-sm text-gray-600">Enter your details to create a new account.</p>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" placeholder="you@example.com" class="mt-1 w-full" />
                        </div>
                        <div>
                            <Label for="password">Password</Label>
                            <Input id="password" type="password" placeholder="********" class="mt-1 w-full" />
                        </div>
                    </div>
                    <div class="mt-6 flex justify-center">
                        <Button type="submit" class="w-full">Register</Button>
                    </div>
                </div>
            </Tabs.Content>
        </Tabs.Root>
    </Dialog.Content>
</Dialog.Root>