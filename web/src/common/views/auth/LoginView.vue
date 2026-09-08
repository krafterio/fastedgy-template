<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">
      <div class="flex flex-col gap-6">
        <Card class="border-none shadow-none">
          <CardHeader class="text-center">
            <div class="flex justify-center mb-4">
              <img src="@/common/assets/img/favicon.png" alt="Logo" class="h-16" />
            </div>
            <CardTitle class="text-2xl">
              {{ $t('Bienvenue sur FastEdgy') }}
            </CardTitle>
            <CardDescription>
              {{ $t('Connectez-vous à votre compte') }}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="handlePasswordLogin">
              <div class="grid gap-6">
                <div class="grid gap-2">
                  <Label for="email-password">{{ $t('Email') }}</Label>
                  <Input
                    id="email-password"
                    v-model="loginData.email"
                    type="email"
                    :placeholder="'votre@email.com'"
                    required
                  />
                </div>
                <div class="grid gap-2">
                  <div class="flex items-center">
                    <Label for="password">{{ $t('Mot de passe') }}</Label>
                    <router-link
                      :to="{ name: 'PasswordForgot' }"
                      class="ml-auto text-sm underline-offset-4 hover:underline text-primary"
                    >
                      {{ $t('Mot de passe oublié ?') }}
                    </router-link>
                  </div>
                  <Input id="password" v-model="loginData.password" type="password" required placeholder="********" />
                </div>
                <Button type="submit" class="w-full" :disabled="loading">
                  {{ loading ? $t('Connexion...') : $t('Se connecter') }}
                </Button>
              </div>
            </form>

            <div v-if="registerRouteName" class="mt-6 text-center text-sm">
              {{ $t('Pas encore de compte ?') }}
              <router-link
                :to="{ name: registerRouteName, query: queryParams }"
                class="underline underline-offset-4 text-primary hover:text-primary/80"
              >
                {{ $t("S'inscrire") }}
              </router-link>
            </div>
          </CardContent>
        </Card>
        <div
          class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary"
        >
          {{ $t('En continuant, vous acceptez nos') }}
          <a href="#">{{ $t("Conditions d'utilisation") }}</a> {{ $t('et notre') }}
          <a href="#">{{ $t('Politique de confidentialité') }}</a
          >.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useAuthStore } from 'vue-fastedgy';
import { reactive, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toast } from 'vue-sonner';
import { useI18n } from 'vue-i18n';
import { formatValidationErrors } from 'vue-fastedgy';

const props = defineProps({
  registerRouteName: {
    type: String,
    default: null,
  },
});

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginData = reactive({
  email: '',
  password: '',
});

const loading = ref(false);

const queryParams = computed(() => {
  const query = {};

  if (route.query.plan) {
    query.plan = route.query.plan;
  }

  if (route.query.period) {
    query.period = route.query.period;
  }

  return query;
});

const handlePasswordLogin = async () => {
  if (!loginData.email || !loginData.password) {
    return;
  }

  loading.value = true;
  try {
    const result = await authStore.login(loginData);
    if (!result.success) {
      toast.error(result.message || t('Email ou mot de passe incorrect'));
      return;
    }

    const redirectPath = route.query.redirect;
    if (redirectPath && typeof redirectPath === 'string') {
      router.push(redirectPath).then();
    } else {
      router.push({ name: 'Home' }).then();
    }
  } catch (error) {
    toast.error(formatValidationErrors(error));
  } finally {
    loading.value = false;
  }
};
</script>
