<template>
    <div :class="cn('flex items-center flex-row-reverse', $attrs.class)">
        <!-- Avatar pour les utilisateurs restants -->
        <Avatar v-if="remainingCount > 0" class="-ml-2 hover:z-10 relative ring-2 ring-background cursor-pointer">
            <AvatarFallback class="bg-muted-foreground text-white">
                +{{ remainingCount }}
            </AvatarFallback>
        </Avatar>

        <!-- Avatars affichés -->
        <div v-for="(avatar, index) in displayedAvatars" :key="index" class="-ml-2 hover:z-10 relative">
            <Avatar class="ring-2 ring-background cursor-pointer">
                <AvatarImage v-if="avatar.image" :src="avatar.image" :alt="avatar.name || `Avatar ${index + 1}`" />
                <AvatarFallback :class="avatar.fallbackClass || 'bg-primary text-primary-foreground'">
                    {{ avatar.fallback || getInitials(avatar.name) }}
                </AvatarFallback>
            </Avatar>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from '@/common/components/ui/avatar'
import { cn } from '@/common/lib/utils'

const props = defineProps({
    avatars: {
        type: Array,
        required: true,
        default: () => []
    },
    max: {
        type: Number,
        default: 4
    }
})

// Calcul des avatars à afficher
const displayedAvatars = computed(() => {
    return props.avatars.slice(0, props.max).reverse()
})

// Calcul du nombre d'avatars restants
const remainingCount = computed(() => {
    return props.max && props.avatars.length > props.max
        ? props.avatars.length - props.max
        : 0
})

// Fonction utilitaire pour obtenir les initiales
const getInitials = (name) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
}
</script>
