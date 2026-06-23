<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        class="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
      >
        <img src="@/common/assets/img/flags/france.png" alt="Français" class="w-4 h-4 rounded-sm" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48">
      <DropdownMenuItem class="cursor-pointer">
        <div class="flex items-center gap-2 w-full">
          <img src="@/common/assets/img/flags/france.png" alt="Français" class="w-4 h-4 rounded-sm" />
          <span>Français</span>
          <Check class="w-4 h-4 ml-auto text-primary" />
        </div>
      </DropdownMenuItem>
      <DropdownMenuItem disabled class="cursor-not-allowed opacity-50">
        <div class="flex items-center gap-2 w-full">
          <img src="@/common/assets/img/flags/united_kingdom.png" alt="English" class="w-4 h-4 rounded-sm" />
          <span>English</span>
          <span class="text-xs text-muted-foreground ml-auto">(bientôt)</span>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup>
import { Button } from '@/common/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-vue-next';
</script>
