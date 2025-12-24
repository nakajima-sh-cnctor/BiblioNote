<script setup>
import { useMouse } from '@vueuse/core'
import LoginForm from './components/LoginForm.vue'

const { x, y } = useMouse()
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
    <LoginForm />
  </div>
</template>
