<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent class="sm:max-w-md">
            <DialogHeader>
                <DialogTitle v-tc>Paramètres du profil</DialogTitle>
                <DialogDescription v-tc>
                    Personnalisez votre nom et votre avatar
                </DialogDescription>
            </DialogHeader>

            <div class="space-y-6 py-4">
                <!-- Avatar Section -->
                <div class="flex flex-col items-center space-y-4">
                    <div class="relative">
                        <Avatar class="h-20 w-20">
                            <AvatarImage :src="getAvatarUrl(formData.avatar)" :alt="formData.name" v-fetcher-src.lazy />
                            <AvatarFallback class="text-lg">
                                {{ getInitials(formData.name) }}
                            </AvatarFallback>
                        </Avatar>
                        <Button size="sm" variant="outline" class="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                            @click="triggerFileInput">
                            <Camera class="h-4 w-4" />
                        </Button>
                    </div>

                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />

                    <div class="text-center">
                        <Button variant="ghost" size="sm" @click="triggerFileInput">
                            <Upload class="h-4 w-4 mr-2" />
                            <span v-tc>Changer l'avatar</span>
                        </Button>
                        <p class="text-xs text-muted-foreground mt-1" v-tc>
                            JPG, PNG ou GIF (max. 2MB)
                        </p>
                    </div>
                </div>

                <!-- Name Section -->
                <div class="space-y-2">
                    <Label for="name" v-tc>Nom d'affichage</Label>
                    <Input id="name" v-model="formData.name" :placeholder="('Entrez votre nom')" class="w-full" />
                </div>
            </div>

            <DialogFooter class="flex gap-2">
                <Button variant="outline" @click="$emit('update:open', false)">
                    <span v-tc>Annuler</span>
                </Button>
                <Button @click="saveChanges" :disabled="isSaving">
                    <Loader2 v-if="isSaving" class="h-4 w-4 mr-2 animate-spin" />
                    <span v-tc>Enregistrer</span>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useAuthStore } from 'vue-fastedgy'
import { useFetcher } from 'vue-fastedgy'
import { Camera, Upload, Loader2 } from 'lucide-vue-next'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/common/components/ui/dialog'
import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Label } from '@/common/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/common/components/ui/avatar'
import { toast } from 'vue-sonner'

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:open'])

const authStore = useAuthStore()
const fetcher = useFetcher()
const fileInput = ref(null)
const isSaving = ref(false)

const formData = reactive({
    name: '',
    avatar: ''
})

// Initialize form data when dialog opens
watch(() => props.open, (isOpen) => {
    if (isOpen && authStore.user) {
        formData.name = authStore.user.name || ''
        formData.avatar = authStore.user.avatar || ''
    }
})

function getInitials(name) {
    if (!name) return 'U'
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

function getAvatarUrl(avatarPath) {
    if (!avatarPath) return null
    // Use the download API endpoint
    return `/storage/download/${avatarPath}`
}

function triggerFileInput() {
    fileInput.value?.click()
}

async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 2MB")
        return
    }

    if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image (JPG, PNG, GIF)")
        return
    }

    try {
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)

        const uploadResponse = await fetcher.post(
            `/storage/upload/users/${authStore.user.id}/avatar`,
            formDataUpload
        )

        await authStore.refreshUser()
        formData.avatar = authStore.user?.avatar || ''
        toast.success("Image uploadée avec succès")
    } catch (error) {
        console.error('Error uploading file:', error)
        toast.error("Erreur lors de l'upload de l'image")
    }
}

async function saveChanges() {
    if (!formData.name.trim()) {
        toast.error("Veuillez entrer un nom d'affichage")
        return
    }

    isSaving.value = true

    try {
        const payload = {
            name: formData.name.trim()
        }

        if (formData.avatar && formData.avatar !== authStore.user?.avatar) {
            payload.avatar = formData.avatar
        }

        const updatedUser = await fetcher.patch('/me', payload)

        toast.success("Profil mis à jour avec succès")
        await authStore.refreshUser()
        emit('update:open', false)
    } catch (error) {
        console.error('Error updating profile:', error)
        toast.error("Impossible de sauvegarder les modifications")
    } finally {
        isSaving.value = false
    }
}
</script>
