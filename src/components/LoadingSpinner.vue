<script setup>
import { useLoading } from '../composables/useLoading'

const { isLoading } = useLoading()
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center space-y-4">
        <div class="relative">
          <div class="h-16 w-16 rounded-full border-4 border-gray-700"></div>
          <div class="absolute top-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-indigo-500"></div>
        </div>
        <p class="text-sm text-gray-300 font-medium">読み込み中...</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
