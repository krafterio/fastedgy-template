<template>
    <Popover>
        <PopoverTrigger as-child>
            <Button variant="outline" :class="cn(
                'w-full justify-start text-left font-normal',
                !internalModelValue && 'text-muted-foreground'
            )">
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ internalModelValue ? df.format(toDate(placeholderRef)) : placeholder }}
            </Button>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0" align="start">
            <CalendarRoot v-slot="{ date, grid, weekDays }" v-model:placeholder="placeholderRef"
                v-model="placeholderRef" :class="cn('rounded-md border p-3')" locale="fr-FR" weekday-format="narrow"
                @update:model-value="(value) => emits('update:modelValue', value)">
                <CalendarHeader>
                    <CalendarHeading class="flex w-full items-center justify-between gap-2">
                        <Select :default-value="placeholderRef.month.toString()" @update:model-value="(v) => {
                            if (!v || !placeholderRef) return;
                            if (Number(v) === placeholderRef?.month) return;
                            placeholderRef = placeholderRef.set({
                                month: Number(v),
                            })
                        }">
                            <SelectTrigger aria-label="Sélectionner le mois" class="w-[60%]">
                                <SelectValue placeholder="Sélectionner le mois" />
                            </SelectTrigger>
                            <SelectContent class="max-h-[200px]">
                                <SelectItem v-for="month in createYear({ dateObj: date })" :key="month.toString()"
                                    :value="month.month.toString()">
                                    {{ formatter.custom(toDate(month), { month: 'long' }) }}
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select :default-value="placeholderRef.year.toString()" @update:model-value="(v) => {
                            if (!v || !placeholderRef) return;
                            if (Number(v) === placeholderRef?.year) return;
                            placeholderRef = placeholderRef.set({
                                year: Number(v),
                            })
                        }">
                            <SelectTrigger aria-label="Sélectionner l'année" class="w-[40%]">
                                <SelectValue placeholder="Sélectionner l'année" />
                            </SelectTrigger>
                            <SelectContent class="max-h-[200px]">
                                <SelectItem
                                    v-for="yearValue in createDecade({ dateObj: date, startIndex: -100, endIndex: 30 })"
                                    :key="yearValue.toString()" :value="yearValue.year.toString()">
                                    {{ yearValue.year }}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CalendarHeading>
                </CalendarHeader>

                <div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
                    <CalendarGrid v-for="month in grid" :key="month.value.toString()">
                        <CalendarGridHead>
                            <CalendarGridRow>
                                <CalendarHeadCell v-for="day in weekDays" :key="day">
                                    {{ day }}
                                </CalendarHeadCell>
                            </CalendarGridRow>
                        </CalendarGridHead>
                        <CalendarGridBody class="grid">
                            <CalendarGridRow v-for="(weekDates, index) in month.rows" :key="`weekDate-${index}`"
                                class="mt-2 w-full">
                                <CalendarCell v-for="weekDate in weekDates" :key="weekDate.toString()" :date="weekDate">
                                    <CalendarCellTrigger :day="weekDate" :month="month.value" />
                                </CalendarCell>
                            </CalendarGridRow>
                        </CalendarGridBody>
                    </CalendarGrid>
                </div>
            </CalendarRoot>
        </PopoverContent>
    </Popover>
</template>

<script setup lang="ts">
import type { DateValue } from "@internationalized/date"
import type { CalendarRootEmits, CalendarRootProps } from "reka-ui"
import type { HTMLAttributes, Ref } from "vue"
import { getLocalTimeZone, today, parseDate } from "@internationalized/date"
import { useVModel } from "@vueuse/core"
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from "reka-ui"
import { createDecade, createYear, toDate } from "reka-ui/date"
import { computed } from "vue"
import { cn } from "@/common/lib/utils"
import { CalendarCell, CalendarCellTrigger, CalendarGrid, CalendarGridBody, CalendarGridHead, CalendarGridRow, CalendarHeadCell, CalendarHeader, CalendarHeading } from "@/common/components/ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/common/components/ui/select"
import { Button } from '@/common/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/common/components/ui/popover'
import { CalendarIcon } from 'lucide-vue-next'
import { DateFormatter } from '@internationalized/date'

const props = defineProps({
    modelValue: {
        type: Object,
        default: undefined
    },
    placeholder: {
        type: String,
        default: 'Sélectionner une date'
    }
})

const emits = defineEmits(['update:modelValue'])

const internalModelValue = useVModel(props, "modelValue", emits, {
    passive: true,
    defaultValue: today(getLocalTimeZone()),
}) as Ref<DateValue | string | undefined>

// Convertir la valeur interne en DateValue pour le calendrier
const placeholderRef = computed({
    get: () => {
        const value = internalModelValue.value
        if (!value) return today(getLocalTimeZone())

        // Si c'est déjà un DateValue, le retourner
        if (typeof value === 'object' && value !== null && 'calendar' in value) {
            return value as DateValue
        }

        // Si c'est une chaîne de date, essayer de la parser
        if (typeof value === 'string') {
            try {
                // Essayer de parser comme YYYY-MM-DD
                const date = new Date(value)
                if (!isNaN(date.getTime())) {
                    return parseDate(value.split('T')[0]) // Prendre seulement la partie date
                }
            } catch {
                // En cas d'erreur, utiliser aujourd'hui
                return today(getLocalTimeZone())
            }
        }

        return today(getLocalTimeZone())
    },
    set: (value: DateValue) => {
        internalModelValue.value = value
    }
})

const formatter = useDateFormatter("fr")

const df = new DateFormatter('fr-FR', {
    dateStyle: 'medium'
})
</script>
