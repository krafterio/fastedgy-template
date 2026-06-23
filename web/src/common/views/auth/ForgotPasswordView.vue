<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="flex flex-col gap-6">
        <Card class="border-none shadow-none">
          <CardHeader class="text-center">
            <div class="flex justify-center mb-4">
              <img src="@/common/assets/img/favicon.png" alt="Logo" class="w-16 h-16" />
            </div>
            <CardTitle class="text-2xl">
              {{ $t('Mot de passe oublié') }}
            </CardTitle>
            <CardDescription>
              {{ $t('Entrez votre email pour recevoir un lien de réinitialisation') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handleSubmit">
              <div class="grid gap-6">
                <div class="grid gap-2">
                  <Label for="email">{{ $t('Email') }}</Label>
                  <Input id="email" v-model="email" type="email" :placeholder="'votre@email.com'" required />
                </div>
                <Button type="submit" class="w-full" :disabled="loading">
                  {{ loading ? $t('Envoi...') : $t('Envoyer le lien') }}
                </Button>
                <div class="text-center text-sm">
                  <router-link
                    :to="{ name: 'Login' }"
                    class="underline underline-offset-4 text-primary hover:text-primary/80"
                  >
                    {{ $t('Retour à la connexion') }}
                  </router-link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useFetcherService } from 'vue-fastedgy';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const fetcher = useFetcherService();

const email = ref('');
const loading = ref(false);

const handleSubmit = async () => {
  if (!email.value) return;
  loading.value = true;
  try {
    await fetcher.post('/auth/password/forgot', { email: email.value });
    toast.success(t('Si un compte existe, un email a été envoyé'));
    router.push({ name: 'Login' }).then();
  } catch (e) {
  } finally {
    loading.value = false;
  }
};
</script>
