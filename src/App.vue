<script setup>
import { useMouse } from '@vueuse/core'

const { x, y } = useMouse()
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center space-y-4">
    <h1 class="text-4xl font-bold text-blue-500">
      Vite + Vue 3 + Tailwind + VueUse
    </h1>
    <p class="text-xl">
      Mouse position: {{ x }}, {{ y }}
    </p>
    <div class="p-4 bg-gray-800 rounded-lg shadow-lg">
      <p class="text-green-400">Tailwind CSS is working!</p>
    </div>
  </div>
</template>
