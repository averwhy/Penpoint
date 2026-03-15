<script lang="ts">
    import RegistrationForm from "$lib/components/registration-form.svelte";
    import CampSNHU from "$lib/assets/CampSNHU.jpg";
</script>

<div class="min-h-screen flex w-full items-center justify-center overflow-hidden bg-background">
    <img
        src={CampSNHU}
        alt="Camp SNHU event as a background"
        class="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover brightness-[0.4]"
        loading="lazy"
    />
    <div class="absolute inset-0 z-0 bg-background/60 backdrop-blur-sm"></div>

    <RegistrationForm class="z-10 w-full max-w-md" />
</div>
