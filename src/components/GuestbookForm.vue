<script setup lang="ts">
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref } from 'vue';
import { db } from '../lib/firebase';

const name = ref('');
const message = ref('');
const isSubmitting = ref(false);
const error = ref('');
const success = ref(false);

const submitMessage = async () => {
  if (!name.value || !message.value) return;
  
  isSubmitting.value = true;
  error.value = '';
  success.value = false;

  try {
    await addDoc(collection(db, 'guestbook'), {
      name: name.value,
      message: message.value,
      createdAt: serverTimestamp(),
    });
    
    name.value = '';
    message.value = '';
    success.value = true;
  } catch (e: any) {
    console.error("Error adding document: ", e);
    error.value = 'Failed to submit message. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="border-main border border-dashed p-6 sm:p-8">
    <h2 class="font-serif text-2xl mb-4">Sign the Guestbook</h2>
    <form @submit.prevent="submitMessage" class="flex flex-col gap-4">
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">Thank you for signing!</div>
      
      <div>
        <label for="name" class="block text-sm font-medium mb-1">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          maxlength="100"
          placeholder="Your name"
          class="text-main border-main placeholder:text-main/60 h-10 w-full rounded-lg border bg-transparent px-4 py-2 text-sm focus:outline-hidden"
        />
      </div>
      
      <div>
        <label for="message" class="block text-sm font-medium mb-1">Message</label>
        <textarea
          id="message"
          v-model="message"
          required
          maxlength="500"
          placeholder="Leave a message..."
          rows="4"
          class="text-main border-main placeholder:text-main/60 w-full rounded-lg border bg-transparent px-4 py-2 text-sm focus:outline-hidden resize-none"
        ></textarea>
      </div>
      
      <button
        type="submit"
        :disabled="isSubmitting"
        class="bg-main text-white h-10 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {{ isSubmitting ? 'Posting...' : 'Post Message' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.bg-main {
  background-color: var(--color-main, #000);
}
.text-main {
  color: var(--color-main, #000);
}
.border-main {
  border-color: var(--color-main, rgba(0,0,0,0.1));
}
</style>
