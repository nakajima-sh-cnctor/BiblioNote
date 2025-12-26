<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { GetUserNotes } from '../features/notes/application/usecases/GetUserNotes'
import { FirebaseNoteRepository } from '../features/notes/infrastructure/repositories/FirebaseNoteRepository'

const router = useRouter()
const notes = ref([])
const loading = ref(true)

onMounted(async () => {
  if (auth.currentUser) {
    try {
      const repository = new FirebaseNoteRepository()
      const getUserNotes = new GetUserNotes(repository)
      notes.value = await getUserNotes.execute(auth.currentUser.uid)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      loading.value = false
    }
  } else {
    loading.value = false
  }
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">BiblioNote</h1>
        <div class="flex gap-4">
          <router-link
            to="/notes/new"
            class="rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            メモ作成
          </router-link>
          <router-link
            to="/profile/view"
            class="rounded-md bg-gray-700 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            プロフィール
          </router-link>
          <button
            @click="handleLogout"
            class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            ログアウト
          </button>
        </div>
      </div>
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">マイノート</h2>
        <div v-if="loading" class="text-gray-400">読み込み中...</div>
        <div v-else-if="notes.length === 0" class="text-gray-400">まだメモがありません。</div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <router-link
            v-for="note in notes"
            :key="note.id"
            :to="`/notes/${note.id}`"
            class="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <h3 class="text-lg font-bold text-white mb-2 truncate">{{ note.title }}</h3>
            <p class="text-gray-400 text-sm mb-4 line-clamp-3 h-12">{{ note.content }}</p>
            <div class="text-xs text-gray-500 text-right">
              {{ new Date(note.updatedAt).toLocaleDateString() }}
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
