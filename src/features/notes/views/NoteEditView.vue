<script setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';
import { auth } from '../../../firebase';
import { CreateNote } from '../application/usecases/CreateNote';
import { FirebaseNoteRepository } from '../infrastructure/repositories/FirebaseNoteRepository';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const title = ref('');
const content = ref('# マークダウンへようこそ\n\n書き始めてください...');
const tags = ref([]);
const newTag = ref('');
const showHelp = ref(false);
const isSaving = ref(false);
const notification = ref({
  show: false,
  message: '',
  type: 'success' // success, error, warning
});

const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  };
  
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

onMounted(async () => {
  const noteId = route.params.id;
  if (noteId && noteId !== 'new') {
    try {
      const repository = new FirebaseNoteRepository();
      const note = await repository.findById(noteId);
      
      if (note) {
        // Check ownership
        if (note.userId !== auth.currentUser?.uid) {
           showNotification('このメモにアクセスする権限がありません', 'error');
           router.push('/');
           return;
        }
        title.value = note.title;
        content.value = note.content;
        tags.value = note.tags || [];
      } else {
        showNotification('メモが見つかりませんでした', 'error');
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      showNotification('メモの取得に失敗しました', 'error');
    }
  }
});

const compiledMarkdown = computed(() => {
  return marked.parse(content.value, { breaks: true });
});

const addTag = () => {
  const tag = newTag.value.trim();
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag);
  }
  newTag.value = '';
};

const removeTag = (index) => {
  tags.value.splice(index, 1);
};

const handleSave = async () => {
  if (!auth.currentUser) {
    showNotification('ログインが必要です', 'error');
    router.push('/login');
    return;
  }

  if (!title.value.trim()) {
    showNotification('タイトルを入力してください', 'warning');
    return;
  }

  isSaving.value = true;
  try {
    const repository = new FirebaseNoteRepository();
    const createNote = new CreateNote(repository);
    
    // If editing existing note, pass the ID.
    // If route.params.id is present and not 'new', use it.
    // However, if we just created it and redirected without reload, the URL changes.
    // Better to track 'currentNoteId' in ref or just rely on URL.
    const currentId = route.params.id !== 'new' ? route.params.id : undefined;

    const params = {
      id: currentId,
      userId: auth.currentUser.uid,
      title: title.value,
      content: content.value,
      tags: [...tags.value] // Unwrap proxy
    };
    const savedId = await createNote.execute(params);
    
    showNotification('保存しました', 'success');
    
    // Redirect to edit page if created new
    if (!currentId) {
      router.push(`/notes/${savedId}`);
    }
  } catch (error) {
    console.error('Save error:', error);
    showNotification('保存に失敗しました: ' + error.message, 'error');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-900 relative">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center flex-1">
        <router-link to="/" class="mr-4 text-gray-400 hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </router-link>
        <input 
          v-model="title" 
          type="text" 
          placeholder="タイトル" 
          class="text-xl font-semibold text-white placeholder-gray-500 border-none focus:ring-0 w-full bg-transparent"
        />
      </div>
      
      <!-- Tag Input -->
      <div class="flex items-center mx-4 bg-gray-700 rounded-full px-3 py-1.5 border border-gray-600 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        <svg class="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
        </svg>
        <div class="flex flex-wrap gap-2 items-center">
            <span 
              v-for="(tag, index) in tags" 
              :key="index" 
              class="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full flex items-center shadow-sm"
            >
              {{ tag }}
              <button @click="removeTag(index)" class="ml-1 hover:text-indigo-200 focus:outline-none">×</button>
            </span>
            <input 
              v-model="newTag" 
              @keydown.enter="addTag"
              @keydown.tab.prevent="addTag"
              type="text" 
              placeholder="タグ追加 (Enter)" 
              class="w-24 bg-transparent text-sm text-gray-200 focus:text-white focus:outline-none placeholder-gray-500"
            />
        </div>
      </div>

      <div class="flex items-center">
        <button 
          @click="showHelp = true"
          class="px-4 py-2 bg-gray-700 text-white hover:bg-gray-600 rounded-md transition-colors mr-2 text-sm font-medium shadow-sm border border-gray-600"
        >
          ヘルプ
        </button>
        <button 
          @click="handleSave"
          :disabled="isSaving"
          class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
      </div>
    </header>

    <!-- Main Content (Split View) -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Editor (Left) -->
      <div class="w-1/2 flex flex-col border-r border-gray-700 bg-gray-800">
        <div class="px-4 py-2 bg-gray-700 border-b border-gray-600 text-xs font-bold text-gray-300 uppercase tracking-wide">
          エディタ
        </div>
        <textarea 
          v-model="content" 
          class="flex-1 w-full p-6 text-gray-100 bg-gray-800 font-mono text-sm resize-none focus:outline-none placeholder-gray-500"
          placeholder="ここにマークダウンを記述..."
        ></textarea>
      </div>

      <!-- Preview (Right) -->
      <div class="w-1/2 flex flex-col bg-gray-900">
        <div class="px-4 py-2 bg-gray-700 border-b border-gray-600 text-xs font-bold text-gray-300 uppercase tracking-wide">
          プレビュー
        </div>
        <div 
          class="flex-1 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-a:text-indigo-400 text-white prose-p:text-white prose-headings:text-white prose-li:text-white prose-strong:text-white"
          v-html="compiledMarkdown"
        ></div>
      </div>
    </main>

    <!-- Markdown Help Modal -->
    <div v-if="showHelp" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="showHelp = false">
      <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700">
        <div class="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 class="text-xl font-semibold text-white">マークダウン 記法一覧</h3>
          <button @click="showHelp = false" class="text-gray-400 hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
            
            <!-- Headers -->
            <div class="space-y-2">
              <h4 class="font-medium text-indigo-400 mb-2">見出し</h4>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400"># Header 1</code>
                <span class="text-gray-400 text-xs">見出し 1</span>
              </div>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">## Header 2</code>
                <span class="text-gray-400 text-xs">見出し 2</span>
              </div>
            </div>

            <!-- Emphasis -->
            <div class="space-y-2">
              <h4 class="font-medium text-indigo-400 mb-2">強調</h4>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">*Italic*</code>
                <span class="italic text-gray-400">斜体</span>
              </div>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">**Bold**</code>
                <span class="font-bold text-gray-400">太字</span>
              </div>
            </div>

            <!-- Lists -->
            <div class="space-y-2">
              <h4 class="font-medium text-indigo-400 mb-2">リスト</h4>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">- Item</code>
                <span class="text-gray-400">箇条書き</span>
              </div>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">1. Item</code>
                <span class="text-gray-400">番号付き</span>
              </div>
            </div>

            <!-- Links & Images -->
            <div class="space-y-2">
              <h4 class="font-medium text-indigo-400 mb-2">リンクと画像</h4>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">[Link](url)</code>
                <span class="text-blue-400 underline cursor-pointer">リンク</span>
              </div>
              <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                <code class="text-pink-400">![Alt](url)</code>
                <span class="text-gray-400">画像</span>
              </div>
            </div>

            <!-- Code -->
            <div class="col-span-2 space-y-2">
              <h4 class="font-medium text-indigo-400 mb-2">コード</h4>
              <div class="p-2 bg-gray-900 rounded border border-gray-700 flex justify-between items-center">
                <code class="text-pink-400">`Inline Code`</code>
                <span class="font-mono bg-gray-700 text-gray-300 px-1 rounded text-xs">インラインコード</span>
              </div>
              <div class="p-2 bg-gray-900 rounded border border-gray-700">
                <pre class="text-pink-400 text-xs">```
コードブロック
```</pre>
              </div>
            </div>
            
            <!-- Blockquote -->
            <div class="col-span-2 space-y-2">
               <h4 class="font-medium text-indigo-400 mb-2">引用</h4>
               <div class="flex items-baseline justify-between p-2 bg-gray-900 rounded border border-gray-700">
                  <code class="text-pink-400">> Quote</code>
                  <span class="border-l-2 border-gray-500 pl-2 text-gray-400 italic">引用テキスト</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="notification.show" 
        class="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center min-w-[300px]"
        :class="{
          'bg-emerald-500': notification.type === 'success',
          'bg-red-500': notification.type === 'error',
          'bg-yellow-500': notification.type === 'warning'
        }"
      >
        <span class="mr-2 text-xl">
          <span v-if="notification.type === 'success'">✓</span>
          <span v-else-if="notification.type === 'error'">!</span>
          <span v-else>⚠</span>
        </span>
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<style>
/* 
  If you don't have @tailwindcss/typography installed, 
  you might not see nice markdown styles in the preview.
  For now, standard prose classes are assumed or raw HTML.
  I'll stick to 'prose' assuming the user might add it or generic styles.
  If not, it will just be unstyled HTML, which is okay for MVP.
*/
</style>
