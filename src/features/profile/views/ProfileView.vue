<script setup>
import ProfileForm from '../components/ProfileForm.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">BiblioNote</h1>
        <p class="text-gray-400">あなたの読書記録を始めましょう</p>
      </div>
      <ProfileForm />
    </div>
  </div>
</template>
