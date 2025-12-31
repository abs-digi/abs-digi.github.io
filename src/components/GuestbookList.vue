<script setup lang="ts">
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { onMounted, onUnmounted, ref } from 'vue';
import { db } from '../lib/firebase';

interface Entry {
  id: string;
  name: string;
  message: string;
  createdAt: any;
}

const entries = ref<Entry[]>([]);
const isLoading = ref(true);
let unsubscribe: (() => void) | null = null;

onMounted(() => {
  const q = query(
    collection(db, 'guestbook'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  unsubscribe = onSnapshot(q, (snapshot) => {
    entries.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Entry[];
    isLoading.value = false;
  }, (error) => {
    console.error("Error fetching guestbook: ", error);
    isLoading.value = false;
  });
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const formatDate = (timestamp: any) => {
  if (!timestamp) return '';
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
</script>

<template>
  <div class="mt-12">
    <h2 class="font-serif text-2xl mb-6">Recent Messages</h2>
    
    <div v-if="isLoading" class="text-main/60 text-sm italic">Loading messages...</div>
    
    <div v-else-if="entries.length === 0" class="text-main/60 text-sm italic">No messages yet. Be the first to sign!</div>
    
    <div v-else class="flex flex-col gap-6">
      <div v-for="entry in entries" :key="entry.id" class="border-b border-main/10 pb-6 last:border-0">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium text-main">{{ entry.name }}</span>
          <span class="text-xs text-main/40">{{ formatDate(entry.createdAt) }}</span>
        </div>
        <p class="text-sm text-main/80 leading-relaxed">{{ entry.message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-main {
  color: var(--color-main, #000);
}
.border-main\/10 {
  border-color: var(--color-main, rgba(0,0,0,0.1));
}
</style>
