<template>
    <Dialog v-model:open="isOpen">
        <DialogContent class="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0">
            <!-- Phase 1: Upload -->
            <template v-if="!importResult">
                <DialogHeader class="px-6 pt-6">
                    <DialogTitle v-tc>Importer des données</DialogTitle>
                    <DialogDescription v-tc>
                        Téléchargez un fichier CSV, XLSX ou ODS pour importer des données
                    </DialogDescription>
                </DialogHeader>

                <div class="flex-1 overflow-y-auto px-6">
                    <div class="space-y-4 py-4">
                        <!-- File drop zone -->
                        <div class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                            @click="$refs.fileInput.click()" @dragover.prevent @drop.prevent="handleDrop">
                            <Upload class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p class="text-sm font-medium mb-1" v-tc>
                                Déposez un fichier ici ou cliquez pour sélectionner
                            </p>
                            <p class="text-xs text-muted-foreground" v-tc>
                                Formats supportés : CSV, XLSX, ODS
                            </p>
                            <input ref="fileInput" type="file" accept=".csv,.xlsx,.ods" class="hidden"
                                @change="handleFileSelect" />
                        </div>

                        <!-- Selected file info -->
                        <div v-if="selectedFile" class="flex items-center gap-2 p-3 bg-muted rounded">
                            <FileSpreadsheet class="w-5 h-5" />
                            <span class="text-sm flex-1">{{ selectedFile.name }}</span>
                            <Button size="icon" variant="ghost" @click="clearFile">
                                <X class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter class="px-6 py-4">
                    <Button variant="outline" @click="close">
                        <span v-tc>Annuler</span>
                    </Button>
                    <Button @click="handleImport" :disabled="!selectedFile || importing">
                        <Loader2 v-if="importing" class="w-4 h-4 mr-2 animate-spin" />
                        <span v-tc>Importer</span>
                    </Button>
                </DialogFooter>
            </template>

            <!-- Phase 2: Results -->
            <template v-else>
                <DialogHeader class="px-6 pt-6">
                    <DialogTitle v-tc>Résultats de l'importation</DialogTitle>
                </DialogHeader>

                <div class="flex-1 overflow-y-auto px-6">
                    <div class="space-y-4 py-4">
                        <!-- Success Message (no errors) -->
                        <div v-if="importResult.errors === 0" class="text-center py-8">
                            <div
                                class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                                <Check class="w-8 h-8 text-green-600" />
                            </div>
                            <h3 class="text-lg font-semibold mb-2" v-tc>Importation terminée avec succès !</h3>
                            <div class="text-muted-foreground space-y-2">
                                <p class="text-3xl font-bold text-green-600">
                                    {{ importResult.success }}
                                </p>
                                <p class="text-sm">
                                    <span v-tc>ligne(s) importée(s) avec succès</span>
                                </p>
                            </div>
                        </div>

                        <!-- Stats Cards -->
                        <div v-if="importResult.errors > 0" class="grid grid-cols-2 gap-3">
                            <Card>
                                <CardContent class="p-2 text-center">
                                    <div class="text-xl font-bold text-green-600">
                                        {{ importResult.success }}
                                    </div>
                                    <div class="text-xs text-muted-foreground" v-tc>Succès</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent class="p-2 text-center">
                                    <div class="text-xl font-bold text-red-600">
                                        {{ importResult.errors }}
                                    </div>
                                    <div class="text-xs text-muted-foreground" v-tc>Erreurs</div>
                                </CardContent>
                            </Card>
                        </div>

                        <!-- Error Details -->
                        <div v-if="importResult.errors > 0" class="space-y-2">
                            <h4 class="text-sm font-medium" v-tc>Détails des erreurs</h4>
                            <div class="space-y-3">
                                <Card v-for="(error, idx) in importResult.error_details" :key="idx"
                                    class="border-destructive">
                                    <CardHeader class="pb-3">
                                        <div class="flex items-start gap-3">
                                            <AlertCircle class="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                                            <div class="flex-1 min-w-0">
                                                <CardTitle class="text-base">
                                                    <span v-tc>Ligne</span> {{ error.row }}
                                                </CardTitle>
                                                <CardDescription class="mt-1 break-words">
                                                    {{ error.error }}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <!-- Sous-table des données -->
                                        <div class="rounded-md border overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead v-tc>Champ</TableHead>
                                                        <TableHead v-tc>Valeur</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow v-for="(value, fieldName) in error.data" :key="fieldName">
                                                        <TableCell class="font-medium whitespace-nowrap">
                                                            {{ getFieldLabel(fieldName) }}
                                                        </TableCell>
                                                        <TableCell class="break-all max-w-xs">{{ value }}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter class="px-6 py-4">
                    <Button @click="close">
                        <span v-tc>Fermer</span>
                    </Button>
                </DialogFooter>
            </template>
        </DialogContent>
    </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useMetadataStore } from 'vue-fastedgy'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/common/components/ui/dialog/index.js'
import { Button } from '@/common/components/ui/button/index.js'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/common/components/ui/card/index.js'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/common/components/ui/table/index.js'
import {
    Upload,
    FileSpreadsheet,
    X,
    Loader2,
    AlertCircle,
    Check,
} from 'lucide-vue-next'

const props = defineProps({
    modelName: {
        type: String,
        required: true,
    },
    onImport: {
        type: Function,
        required: true,
    },
})

const isOpen = ref(false)
const selectedFile = ref(null)
const importing = ref(false)
const importResult = ref(null)

const metadataStore = useMetadataStore()

/**
 * Convert technical field name to label using metadata
 * @param {string} fieldName - Field name (can be technical or label, with relations like "product_category.name")
 * @returns {string} - Field label
 */
const getFieldLabel = (fieldName) => {
    // If it's already a label (contains " / " or spaces)
    if (fieldName.includes(' / ') || /\s/.test(fieldName)) {
        return fieldName
    }

    const metadata = metadataStore.getMetadata(props.modelName)
    if (!metadata?.fields) return fieldName

    // Handle relational paths (e.g., product_category.name)
    if (fieldName.includes('.')) {
        const parts = fieldName.split('.')
        let label = ''
        let currentMetadata = metadata

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            const field = currentMetadata.fields?.[part]

            if (field) {
                label += field.label || part

                // If it's a relation and not the last element
                if (i < parts.length - 1) {
                    label += ' / '
                    // Get target model metadata
                    if (field.target) {
                        currentMetadata = metadataStore.getMetadata(field.target)
                    }
                }
            } else {
                label += part
                if (i < parts.length - 1) label += ' / '
            }
        }

        return label
    }

    // Simple field
    const field = metadata.fields[fieldName]
    return field?.label || fieldName
}

const open = () => {
    isOpen.value = true
    importResult.value = null
    selectedFile.value = null
}

const close = () => {
    isOpen.value = false
}

const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
        selectedFile.value = file
    }
}

const handleDrop = (event) => {
    const file = event.dataTransfer.files?.[0]
    if (file) {
        selectedFile.value = file
    }
}

const clearFile = () => {
    selectedFile.value = null
}

const handleImport = async () => {
    if (!selectedFile.value) return

    try {
        importing.value = true
        importResult.value = await props.onImport(selectedFile.value)
    } catch (error) {
        console.error('Import error:', error)
    } finally {
        importing.value = false
    }
}

defineExpose({
    open,
    close,
})
</script>
