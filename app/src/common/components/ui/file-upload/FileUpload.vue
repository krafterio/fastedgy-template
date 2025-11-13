<template>
    <div class="space-y-4">
        <div @drop.prevent="handleDrop" @dragover.prevent="isDragOver = true" @dragleave.prevent="isDragOver = false"
            :class="[
                'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
                isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            ]" @click="!disabled && triggerFileInput()">
            <input ref="fileInput" type="file" :accept="accept" :multiple="multiple" @change="handleFileSelect"
                class="hidden" :disabled="disabled" />

            <div class="flex flex-col items-center justify-center text-center">
                <div class="mb-4">
                    <Upload class="h-10 w-10 text-muted-foreground" />
                </div>

                <div class="space-y-2">
                    <p class="text-sm font-medium">
                        {{ multiple ? `Glissez vos fichiers ici ou cliquez pour sélectionner` : `Glissez votre fichier
                        ici ou cliquez pour sélectionner` }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                        {{ acceptText || `Formats acceptés: ${accept}` }}
                    </p>
                    <p v-if="maxSize" class="text-xs text-muted-foreground">
                        Taille maximum: {{ formatFileSize(maxSize) }}
                    </p>
                </div>
            </div>
        </div>

        <!-- Liste des fichiers sélectionnés -->
        <div v-if="files.length > 0 && !hideSelectedFiles" class="space-y-2">
            <div class="flex items-center justify-between">
                <Label class="text-sm font-medium">Fichiers sélectionnés</Label>
                <Button variant="ghost" size="sm" @click="clearFiles" class="h-auto p-1 text-xs">
                    Tout supprimer
                </Button>
            </div>

            <div class="space-y-2">
                <div v-for="(file, index) in files" :key="index"
                    class="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <div class="flex items-center space-x-3 flex-1 min-w-0">
                        <div class="flex-shrink-0">
                            <FileText class="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">{{ file.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ formatFileSize(file.size) }}</p>
                        </div>
                    </div>

                    <Button variant="ghost" size="sm" @click="removeFile(index)"
                        class="h-auto p-1 text-destructive hover:text-destructive">
                        <X class="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="errors.length > 0" class="space-y-1">
            <div v-for="error in errors" :key="error" class="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                {{ error }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Button } from '@/common/components/ui/button'
import { Label } from '@/common/components/ui/label'
import { Upload, FileText, X } from 'lucide-vue-next'

const props = defineProps({
    modelValue: {
        type: [File, Array],
        default: null
    },
    accept: {
        type: String,
        default: '*'
    },
    multiple: {
        type: Boolean,
        default: false
    },
    maxSize: {
        type: Number,
        default: null // en bytes
    },
    acceptText: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    },
    hideSelectedFiles: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragOver = ref(false)
const files = ref([])
const errors = ref([])

// Initialiser les fichiers depuis modelValue
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        if (props.multiple && Array.isArray(newValue)) {
            files.value = [...newValue]
        } else if (!props.multiple && newValue instanceof File) {
            files.value = [newValue]
        }
    } else {
        files.value = []
    }
}, { immediate: true })

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click()
    }
}

const validateFile = (file) => {
    const validationErrors = []

    // Vérifier la taille
    if (props.maxSize && file.size > props.maxSize) {
        validationErrors.push(`${file.name}: Fichier trop volumineux (max ${formatFileSize(props.maxSize)})`)
    }

    // Vérifier le type si accept est spécifié
    if (props.accept !== '*') {
        const acceptedTypes = props.accept.split(',').map(type => type.trim())
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        const mimeType = file.type

        const isValidType = acceptedTypes.some(type => {
            if (type.startsWith('.')) {
                return type.toLowerCase() === fileExtension
            } else {
                return mimeType.startsWith(type.replace('*', ''))
            }
        })

        if (!isValidType) {
            validationErrors.push(`${file.name}: Type de fichier non autorisé`)
        }
    }

    return validationErrors
}

const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    processFiles(selectedFiles)
}

const handleDrop = (event) => {
    isDragOver.value = false
    if (props.disabled) return

    const droppedFiles = Array.from(event.dataTransfer.files)
    processFiles(droppedFiles)
}

const processFiles = (newFiles) => {
    errors.value = []

    // Valider chaque fichier
    const allErrors = []
    const validFiles = []

    newFiles.forEach(file => {
        const fileErrors = validateFile(file)
        if (fileErrors.length > 0) {
            allErrors.push(...fileErrors)
        } else {
            validFiles.push(file)
        }
    })

    if (allErrors.length > 0) {
        errors.value = allErrors
        return
    }

    if (props.multiple) {
        files.value = [...files.value, ...validFiles]
        emit('update:modelValue', files.value)
    } else {
        files.value = validFiles.slice(0, 1)
        emit('update:modelValue', files.value[0] || null)
    }
}

const removeFile = (index) => {
    files.value.splice(index, 1)

    if (props.multiple) {
        emit('update:modelValue', files.value)
    } else {
        emit('update:modelValue', files.value[0] || null)
    }
}

const clearFiles = () => {
    files.value = []
    emit('update:modelValue', props.multiple ? [] : null)
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
