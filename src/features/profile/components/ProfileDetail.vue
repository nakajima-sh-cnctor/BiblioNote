<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  profile: {
    type: Object,
    required: true
  }
})

const router = useRouter()

const genderConfig = computed(() => {
  const configs = {
    male: {
      label: '男性',
      color: 'indigo',
      gradient: 'from-indigo-500/10 to-purple-500/10',
      borderColor: 'border-indigo-500/30',
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/5'
    },
    female: {
      label: '女性',
      color: 'pink',
      gradient: 'from-pink-500/10 to-rose-500/10',
      borderColor: 'border-pink-500/30',
      textColor: 'text-pink-400',
      bgColor: 'bg-pink-500/5'
    },
    other: {
      label: 'その他',
      color: 'purple',
      gradient: 'from-purple-500/10 to-indigo-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/5'
    }
  }
  return configs[props.profile.gender] || configs.other
})

const handleEdit = () => {
  router.push('/profile')
}

const handleBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto">
    <div class="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
        <h2 class="text-2xl font-bold text-white">プロフィール</h2>
        <p class="text-indigo-100 mt-1">あなたの登録情報</p>
      </div>

      <!-- Content -->
      <div class="p-8 space-y-6">
        <!-- Name Section -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-400">名前</label>
          <div class="bg-gray-700/50 rounded-lg px-4 py-3 border border-gray-600">
            <p class="text-lg text-white font-medium">{{ profile.name }}</p>
          </div>
        </div>

        <!-- Gender Section -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-400">性別</label>
          <div 
            :class="[
              'rounded-lg px-4 py-4 border-2 transition-all duration-200',
              genderConfig.borderColor,
              genderConfig.bgColor
            ]"
          >
            <div class="flex items-center gap-3">
              <!-- Gender Icon -->
              <div 
                :class="[
                  'p-2 rounded-lg',
                  genderConfig.bgColor
                ]"
              >
                <svg 
                  v-if="profile.gender === 'male' || profile.gender === 'female'"
                  class="w-6 h-6" 
                  :class="genderConfig.textColor"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <svg 
                  v-else
                  class="w-6 h-6" 
                  :class="genderConfig.textColor"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              
              <!-- Gender Label -->
              <span 
                :class="[
                  'text-lg font-medium',
                  genderConfig.textColor
                ]"
              >
                {{ genderConfig.label }}
              </span>
            </div>
          </div>
        </div>

        <!-- Metadata -->
        <div class="pt-4 border-t border-gray-700 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">登録日時</span>
            <span class="text-gray-300">{{ new Date(profile.createdAt).toLocaleDateString('ja-JP') }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-400">最終更新</span>
            <span class="text-gray-300">{{ new Date(profile.updatedAt).toLocaleDateString('ja-JP') }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-4 flex gap-3">
          <button
            @click="handleBack"
            class="flex-1 rounded-lg bg-gray-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition duration-200"
          >
            戻る
          </button>
          <button
            @click="handleEdit"
            class="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition duration-200"
          >
            プロフィールを編集
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
