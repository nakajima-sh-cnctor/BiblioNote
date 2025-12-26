<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import useProfile from '../composables/useProfile'
import ProfileDetail from '../components/ProfileDetail.vue'

const router = useRouter()
const { profile, isLoading, error, loadProfile } = useProfile()

onMounted(async () => {
  const loadedProfile = await loadProfile()
  if (!loadedProfile) {
    // プロフィールが存在しない場合は編集画面へリダイレクト
    router.push('/profile')
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">BiblioNote</h1>
        <p class="text-gray-400">あなたの読書記録</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-gray-800 rounded-lg shadow-xl p-8">
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p class="text-gray-400">プロフィールを読み込み中...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-gray-800 rounded-lg shadow-xl p-8">
        <div class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          <p class="font-medium">エラーが発生しました</p>
          <p class="text-sm mt-1">{{ error }}</p>
        </div>
        <div class="mt-6">
          <button
            @click="router.push('/profile')"
            class="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition duration-200"
          >
            プロフィールを設定
          </button>
        </div>
      </div>

      <!-- Profile Display -->
      <ProfileDetail v-else-if="profile" :profile="profile" />
    </div>
  </div>
</template>
