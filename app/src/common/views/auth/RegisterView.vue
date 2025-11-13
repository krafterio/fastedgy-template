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
							{{ $t('Créer un compte') }}
						</CardTitle>
						<CardDescription>
							{{ $t('Créez votre compte pour rejoindre l\'équipe : Rejoignez FastEdgy') }}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div v-if="formError"
							class="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
							{{ formError }}
						</div>

						<form @submit.prevent="handleRegister">
							<div class="grid gap-6">
								<div class="grid gap-6">
									<div v-if="useName" class="grid gap-2">
										<Label for="name">{{ $t('Nom') }}</Label>
										<Input id="name" v-model="registerData.name" type="text"
											:placeholder="$t('Votre nom')" required />
									</div>
									<template v-else>
										<div class="grid gap-2">
											<Label for="first_name">{{ $t('Prénom') }}</Label>
											<Input id="first_name" v-model="registerData.first_name" type="text"
												:placeholder="$t('Votre prénom')" required />
										</div>
										<div class="grid gap-2">
											<Label for="last_name">{{ $t('Nom') }}</Label>
											<Input id="last_name" v-model="registerData.last_name" type="text"
												:placeholder="$t('Votre nom')" required />
										</div>
									</template>
									<div class="grid gap-2">
										<Label for="email">{{ $t('Email') }}</Label>
										<Input id="email" v-model="registerData.email" type="email"
											:placeholder="'votre@email.com'" required />
									</div>
									<div class="grid gap-2">
										<Label for="password">{{ $t('Mot de passe') }}</Label>
										<Input id="password" v-model="registerData.password" type="password"
											:placeholder="$t('Créez un mot de passe sécurisé')" required />
									</div>
									<div class="grid gap-2">
										<Label for="confirmPassword">{{ $t('Confirmer le mot de passe') }}</Label>
										<Input id="confirmPassword" v-model="confirmPassword" type="password"
											:placeholder="$t('Confirmez votre mot de passe')" required />
									</div>
									<Button type="submit" class="w-full" :disabled="loading || !!formError">
										{{ loading ? $t('Création du compte...') : $t('Créer mon compte') }}
									</Button>
								</div>
								<div class="text-center text-sm">
									{{ $t('Déjà un compte ?') }}
									<router-link :to="{ name: 'Login' }"
										class="underline underline-offset-4 text-primary hover:text-primary/80">
										{{ $t('Se connecter') }}
									</router-link>
								</div>
							</div>
						</form>
					</CardContent>
				</Card>
				<div
					class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					{{ $t('En créant un compte, vous acceptez nos') }} <a href="#">
						{{ $t('Conditions d\'utilisation') }}
					</a> {{ $t('et notre') }}<a href="#">{{ $t('Politique de confidentialité') }}</a>.
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
import { Avatar, AvatarImage, AvatarFallback } from '@/common/components/ui/avatar'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from 'vue-fastedgy'
import { useFetcher } from 'vue-fastedgy'
import { formatValidationErrors } from 'vue-fastedgy'
import { useI18n } from 'vue-i18n'

const props = defineProps({
	useName: {
		type: Boolean,
		default: false
	}
})

const { t } = useI18n();
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const fetcher = useFetcher()

const registerData = reactive(
	props.useName
		? {
			name: '',
			email: '',
			password: ''
		}
		: {
			first_name: '',
			last_name: '',
			email: '',
			password: ''
		}
)

const confirmPassword = ref('')
const loading = ref(false)
const formError = ref('')

const clearError = () => {
	formError.value = ''
}

const handleRegister = async () => {
	formError.value = ''
	if (!registerData.email || !registerData.password) {
		const msg = ''
		toast.error(msg)
		return
	}

	if (registerData.password !== confirmPassword.value) {
		const msg = t('Les mots de passe ne correspondent pas')
		toast.error(msg)
		return
	}

	loading.value = true
	try {
		const result = await authStore.register(registerData)
		if (result.success) {
			toast.success(t('Compte créé avec succès ! Bienvenue sur FastEdgy.'))

			let guard = { name: 'Root' }

			router.push(guard).then()
		} else {
			const msg = result.message || t('Erreur lors de la création du compte')
			toast.error(msg)
		}
	} catch (error) {
		formError.value = formatValidationErrors(error)
	} finally {
		loading.value = false
	}
}
</script>
