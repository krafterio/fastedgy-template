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
							<span v-if="loginMode === 'magic'">
								{{ $t('Connexion par lien magique') }}
							</span>
							<span v-else>
								{{ $t('Connectez-vous à votre compte') }}
							</span>
						</CardDescription>
					</CardHeader>
					<CardContent>
						<!-- Magic Link Success Message -->
						<div v-if="loginMode === 'magic' && magicLinkSent" class="text-center">
							<div class="flex flex-col items-center gap-4 py-4">
								<div class="text-green-500">
									<svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto" fill="none"
										viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
											d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<div>
									<p class="text-sm font-medium text-foreground mb-2">
										{{ $t('Email envoyé !') }}
									</p>
									<p class="text-sm text-muted-foreground">
										{{ $t('Consultez votre boîte email pour vous connecter') }}
									</p>
								</div>
								<Button @click="resetMagicLinkForm" variant="outline" class="w-full mt-2">
									{{ $t('Renvoyer un lien') }}
								</Button>
							</div>
						</div>

						<!-- Magic Link Form -->
						<form v-else-if="loginMode === 'magic'" @submit.prevent="handleMagicLinkRequest">
							<div class="grid gap-6">
								<div class="grid gap-2">
									<Label for="email">{{ $t('Email') }}</Label>
									<Input id="email" v-model="loginData.email" type="email"
										:placeholder="('votre@email.com')" required />
								</div>
								<Button type="submit" class="w-full" :disabled="loading">
									{{ loading ? $t('Envoi...') : $t('Recevoir le lien de connexion') }}
								</Button>
							</div>
						</form>

						<!-- Password Form -->
						<form v-else @submit.prevent="handlePasswordLogin">
							<div class="grid gap-6">
								<div class="grid gap-2">
									<Label for="email-password">{{ $t('Email') }}</Label>
									<Input id="email-password" v-model="loginData.email" type="email"
										:placeholder="('votre@email.com')" required />
								</div>
								<div class="grid gap-2">
									<div class="flex items-center">
										<Label for="password">{{ $t('Mot de passe') }}</Label>
										<router-link :to="{ name: 'PasswordForgot' }"
											class="ml-auto text-sm underline-offset-4 hover:underline text-primary">
											{{ $t('Mot de passe oublié ?') }}
										</router-link>
									</div>
									<Input id="password" v-model="loginData.password" type="password" required
										placeholder="********" />
								</div>
								<Button type="submit" class="w-full" :disabled="loading">
									{{ loading ? $t('Connexion...') : $t('Se connecter') }}
								</Button>
							</div>
						</form>

						<!-- Toggle between modes (only if magic link is enabled and not sent) -->
						<div v-if="magicLinkEnabled && !magicLinkSent" class="mt-6 text-center">
							<button type="button" @click="toggleLoginMode"
								class="text-sm text-primary hover:underline underline-offset-4">
								<span v-if="loginMode === 'magic'">
									{{ $t('Connexion par identifiants') }}
								</span>
								<span v-else>
									{{ $t('Connexion par lien magique') }}
								</span>
							</button>
						</div>

						<div v-if="registerRouteName && !magicLinkSent" class="mt-6 text-center text-sm">
							{{ $t('Pas encore de compte ?') }}
							<router-link :to="{ name: registerRouteName, query: queryParams }"
								class="underline underline-offset-4 text-primary hover:text-primary/80">
								{{ $t('S\'inscrire') }}
							</router-link>
						</div>
					</CardContent>
				</Card>
				<div
					class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					{{ $t('En continuant, vous acceptez nos') }} <a href="#">{{ $t('Conditions d\'utilisation') }}</a>
					{{ $t('et notre') }} <a href="#">{{ $t('Politique de confidentialité') }}</a>.
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { Button } from '@/common/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/common/components/ui/card'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'
import { useAuthStore, useFetcherService } from 'vue-fastedgy'
import { reactive, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { useI18n } from 'vue-i18n'
import { formatValidationErrors } from 'vue-fastedgy'

const props = defineProps({
	registerRouteName: {
		type: String,
		default: null
	}
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const fetcher = useFetcherService()

const magicLinkEnabled = computed(() => import.meta.env.VITE_AUTH_MAGIC_LINK_ENABLED === true)
const loginMode = ref(magicLinkEnabled.value ? 'magic' : 'password')

const loginData = reactive({
	email: '',
	password: ''
})

const loading = ref(false)
const magicLinkSent = ref(false)

const queryParams = computed(() => {
	const query = {}

	if (route.query.plan) {
		query.plan = route.query.plan
	}

	if (route.query.period) {
		query.period = route.query.period
	}

	return query
})

const toggleLoginMode = () => {
	loginMode.value = loginMode.value === 'magic' ? 'password' : 'magic'
	magicLinkSent.value = false
	loginData.password = ''
}

const resetMagicLinkForm = () => {
	magicLinkSent.value = false
}

const handleMagicLinkRequest = async () => {
	if (!loginData.email) {
		return
	}

	loading.value = true
	magicLinkSent.value = false

	try {
		const response = await fetcher.post('/auth/magic-link/request', {
			email: loginData.email
		})

		magicLinkSent.value = true
		toast.success(response.data.message || t('Un email avec le lien de connexion vous a été envoyé'))
	} catch (error) {
		toast.error(formatValidationErrors(error) || t('Une erreur est survenue'))
	} finally {
		loading.value = false
	}
}

const handlePasswordLogin = async () => {
	if (!loginData.email || !loginData.password) {
		return
	}

	loading.value = true
	try {
		const result = await authStore.login(loginData)
		if (!result.success) {
			toast.error(result.message || t('Email ou mot de passe incorrect'))
			return
		}

		const redirectPath = route.query.redirect
		if (redirectPath && typeof redirectPath === 'string') {
			router.push(redirectPath).then()
		} else {
			router.push({ name: 'Home' }).then()
		}
	} catch (error) {
		toast.error(formatValidationErrors(error))
	} finally {
		loading.value = false
	}
}
</script>
