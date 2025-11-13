<template>
    <Dialog :open="open" @update:open="$emit('update:open', $event)">
        <DialogContent>
            <DialogHeader>
                <DialogTitle v-tc>Ajouter une pièce jointe</DialogTitle>
                <DialogDescription v-tc>
                    Glissez-déposez vos fichiers ou cliquez pour sélectionner
                </DialogDescription>
            </DialogHeader>

            <div @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop" @click="triggerFileInput" :class="[
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                ]">
                <input ref="fileInput" type="file" class="hidden" @change="handleFileSelect" :multiple="multiple"
                    :accept="accept" />
                <Upload class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p class="text-sm text-muted-foreground mb-2" v-tc>
                    Glissez-déposez vos fichiers ici
                </p>
                <p class="text-xs text-muted-foreground" v-tc>
                    ou cliquez pour sélectionner
                </p>
            </div>

            <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
                <p class="text-sm font-medium" v-tc>Fichiers sélectionnés :</p>
                <div v-for="(file, index) in selectedFiles" :key="index"
                    class="flex items-center justify-between p-2 bg-muted rounded">
                    <div class="flex items-center gap-2">
                        <FileText class="w-4 h-4" />
                        <span class="text-sm">{{ file.name }}</span>
                        <span class="text-xs text-muted-foreground">({{ formatFileSize(file.size) }})</span>
                    </div>
                    <Button variant="ghost" size="sm" @click="removeFile(index)">
                        <X class="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <DialogFooter class="mt-4">
                <Button variant="outline" @click="handleClose" :disabled="isUploading">
                    <span v-tc>Annuler</span>
                </Button>
                <Button @click="handleUpload" :disabled="selectedFiles.length === 0 || isUploading">
                    <Loader2 v-if="isUploading" class="w-4 h-4 animate-spin mr-2" />
                    <span v-if="!isUploading" v-tc>Ajouter {{ selectedFiles.length }} fichier(s)</span>
                    <span v-else v-tc>Envoi en cours...</span>
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/common/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/common/components/ui/dialog'
import { Upload, FileText, X, Loader2 } from 'lucide-vue-next'
import { formatFileSize } from '@/common/utils/storage'

const props = defineProps({
    open: {
        type: Boolean,
        required: true
    },
    accept: {
        type: String,
        default: '*'
    },
    multiple: {
        type: Boolean,
        default: true
    },
    uploadHandler: {
        type: Function,
        required: true
    }
})

const emit = defineEmits(['update:open', 'uploaded'])

const fileInput = ref(null)
const selectedFiles = ref([])
const isUploading = ref(false)
const isDragging = ref(false)

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || [])
    if (props.multiple) {
        selectedFiles.value.push(...files)
    } else {
        selectedFiles.value = files.slice(0, 1)
    }
    isDragging.value = false
}

const handleDrop = (event) => {
    const files = Array.from(event.dataTransfer?.files || [])
    if (props.multiple) {
        selectedFiles.value.push(...files)
    } else {
        selectedFiles.value = files.slice(0, 1)
    }
    isDragging.value = false
}

const removeFile = (index) => {
    selectedFiles.value.splice(index, 1)
}

const handleUpload = async () => {
    if (selectedFiles.value.length === 0) {
        toast.error('Veuillez sélectionner au moins un fichier')
        return
    }

    try {
        isUploading.value = true
        await props.uploadHandler(selectedFiles.value)

        toast.success(`${selectedFiles.value.length} fichier(s) uploadé(s) avec succès`)
        emit('uploaded')
        handleClose()
    } catch (error) {
        console.error('Error uploading files:', error)
        toast.error('Erreur lors de l\'upload des fichiers')
    } finally {
        isUploading.value = false
    }
}

const handleClose = () => {
    selectedFiles.value = []
    isDragging.value = false
    if (fileInput.value) {
        fileInput.value.value = ''
    }
    emit('update:open', false)
}
</script>
