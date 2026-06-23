<template>
  <div class="min-h-[calc(100vh-9rem)] flex items-center justify-center bg-background">
    <div class="text-center space-y-8 max-w-md mx-auto px-4">
      <div class="space-y-4">
        <RouteOff class="w-16 h-16 mx-auto text-muted-foreground mb-6" />
        <h1 class="text-6xl font-bold text-muted-foreground">404</h1>
        <h2 class="text-2xl font-semibold text-foreground">Page non trouvée</h2>
        <p class="text-muted-foreground">La page que vous recherchez n'existe pas ou a été déplacée.</p>
      </div>

      <div class="space-y-4">
        <Button @click="goRoot" class="w-full"> Retour à l'accueil </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import Button from '@/common/components/ui/button/Button.vue';
import { RouteOff } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();

const goRoot = () => {
  router.push({ name: 'Root' });
};
</script>
