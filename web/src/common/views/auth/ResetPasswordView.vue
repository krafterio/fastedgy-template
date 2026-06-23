<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader class="text-center">
            <div class="flex justify-center mb-4">
              <img src="@/common/assets/img/favicon.png" alt="FastEdgy" class="w-8 h-8" />
            </div>
            <CardTitle class="text-2xl">
              {{ $t('Réinitialiser le mot de passe') }}
            </CardTitle>
            <CardDescription>
              {{ $t('Choisissez un nouveau mot de passe') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="invalid" class="text-center">
              <p class="text-sm mb-4">{{ $t('Lien invalide ou expiré.') }}</p>
              <router-link
                :to="{ name: 'PasswordForgot' }"
                class="underline underline-offset-4 text-primary hover:text-primary/80"
              >
                {{ $t('Demander un nouveau lien') }}
              </router-link>
            </div>
            <form v-else @submit.prevent="handleSubmit">
              <div class="grid gap-6">
                <div class="grid gap-2">
                  <Label for="password">{{ $t('Nouveau mot de passe') }}</Label>
                  <Input id="password" v-model="password" type="password" required placeholder="********" />
                </div>
                <div class="grid gap-2">
                  <Label for="confirm">{{ $t('Confirmer le mot de passe') }}</Label>
                  <Input id="confirm" v-model="confirm" type="password" required placeholder="********" />
                </div>
                <Button type="submit" class="w-full" :disabled="loading">
                  {{ loading ? $t('Mise à jour...') : $t('Mettre à jour') }}
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
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';
import { formatValidationErrors } from 'vue-fastedgy';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const fetcher = useFetcherService();

const token = ref('');
const password = ref('');
const confirm = ref('');
const loading = ref(false);
const invalid = ref(false);

onMounted(async () => {
  const t = route.query.token;
  if (!t) {
    invalid.value = true;
    return;
  }
  token.value = String(t);
  try {
    await fetcher.post('/auth/password/validate', { token: token.value });
  } catch (e) {
    invalid.value = true;
  }
});

const handleSubmit = async () => {
  if (!password.value || password.value !== confirm.value) return;
  loading.value = true;
  try {
    await fetcher.post('/auth/password/reset', { token: token.value, password: password.value });
    toast.success(t('Mot de passe mis à jour'));
    router.push({ name: 'Login' }).then();
  } catch (e) {
    toast.error(formatValidationErrors(e));
  } finally {
    loading.value = false;
  }
};
</script>
