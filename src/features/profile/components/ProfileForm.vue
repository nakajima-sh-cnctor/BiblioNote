<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useProfile from '../composables/useProfile'

const router = useRouter()
const { saveProfile, isLoading, error } = useProfile()

const formData = ref({
  name: '',
  gender: ''
})

const handleSubmit = async () => {
  const success = saveProfile(formData.value)
  if (success) {
    router.push('/')
  }
}

const handleSkip = () => {
  router.push('/')
}
</script>

<template>
  <div class="w-full max-w-md mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-xl p-8">
      <h2 class="text-2xl font-bold text-white mb-6">プロフィール設定</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 名前 -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
            名前 <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            placeholder="山田太郎"
          />
        </div>

        <!-- 性別 -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-3">
            性別 <span class="text-red-500">*</span>
          </label>
          <div class="grid grid-cols-3 gap-3">
            <!-- 男性 -->
            <label class="relative cursor-pointer group">
              <input
                type="radio"
                v-model="formData.gender"
                value="male"
                required
                class="peer sr-only"
              />
              <div class="h-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-lg transition-all duration-200 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 peer-checked:shadow-lg peer-checked:shadow-indigo-500/20 hover:border-gray-500 hover:bg-gray-700/70">
                <div class="flex flex-col items-center justify-center gap-2">
                  <svg class="w-6 h-6 text-gray-400 transition-colors peer-checked:text-indigo-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-300 transition-colors peer-checked:text-indigo-300 group-hover:text-white">男性</span>
                </div>
              </div>
              <div class="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500/0 to-purple-500/0 peer-checked:from-indigo-500/5 peer-checked:to-purple-500/5 pointer-events-none transition-all duration-200"></div>
            </label>

            <!-- 女性 -->
            <label class="relative cursor-pointer group">
              <input
                type="radio"
                v-model="formData.gender"
                value="female"
                required
                class="peer sr-only"
              />
              <div class="h-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-lg transition-all duration-200 peer-checked:border-pink-500 peer-checked:bg-pink-500/10 peer-checked:shadow-lg peer-checked:shadow-pink-500/20 hover:border-gray-500 hover:bg-gray-700/70">
                <div class="flex flex-col items-center justify-center gap-2">
                  <svg class="w-6 h-6 text-gray-400 transition-colors peer-checked:text-pink-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-300 transition-colors peer-checked:text-pink-300 group-hover:text-white">女性</span>
                </div>
              </div>
              <div class="absolute inset-0 rounded-lg bg-gradient-to-br from-pink-500/0 to-rose-500/0 peer-checked:from-pink-500/5 peer-checked:to-rose-500/5 pointer-events-none transition-all duration-200"></div>
            </label>

            <!-- その他 -->
            <label class="relative cursor-pointer group">
              <input
                type="radio"
                v-model="formData.gender"
                value="other"
                required
                class="peer sr-only"
              />
              <div class="h-full px-4 py-4 bg-gray-700/50 border-2 border-gray-600 rounded-lg transition-all duration-200 peer-checked:border-purple-500 peer-checked:bg-purple-500/10 peer-checked:shadow-lg peer-checked:shadow-purple-500/20 hover:border-gray-500 hover:bg-gray-700/70">
                <div class="flex flex-col items-center justify-center gap-2">
                  <svg class="w-6 h-6 text-gray-400 transition-colors peer-checked:text-purple-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span class="text-sm font-medium text-gray-300 transition-colors peer-checked:text-purple-300 group-hover:text-white">その他</span>
                </div>
              </div>
              <div class="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500/0 to-indigo-500/0 peer-checked:from-purple-500/5 peer-checked:to-indigo-500/5 pointer-events-none transition-all duration-200"></div>
            </label>
          </div>
        </div>

        <!-- エラーメッセージ -->
        <div v-if="error" class="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {{ error }}
        </div>

        <!-- ボタン -->
        <div class="flex gap-4">
          <button
            type="submit"
            :disabled="isLoading || !formData.name || !formData.gender"
            class="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {{ isLoading ? '保存中...' : '保存' }}
          </button>
          <button
            type="button"
            @click="handleSkip"
            class="flex-1 rounded-lg bg-gray-700 px-4 py-3 text-sm font-semibold text-gray-300 shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition duration-200"
          >
            スキップ
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
