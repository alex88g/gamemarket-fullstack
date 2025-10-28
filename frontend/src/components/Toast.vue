<!-- src/components/Toast.vue -->
<template>
  <transition name="fade">
    <div
      v-if="toast.show"
      class="toast"
      :class="toastClass"
      @click="toast.hide()"
    >
      <p class="toast-msg">{{ toast.message }}</p>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '../store/toast.js'

const toast = useToastStore()

const toastClass = computed(() => {
  switch (toast.type) {
    case 'success': return 'toast-success'
    case 'error': return 'toast-error'
    default: return 'toast-info'
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all .2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(.95);
}

.toast {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  min-width: 200px;
  max-width: min(90vw,300px);
  background: #1e2537;
  border-radius: .75rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-pop);
  padding: .75rem 1rem;
  cursor: pointer;
  z-index: 1000;
  font-size: .8rem;
  line-height: 1.4;
  color: var(--text-main);
}
.toast-success {
  border-color: rgba(16,185,129,.5);
  box-shadow: 0 20px 40px rgba(16,185,129,.2);
}
.toast-error {
  border-color: rgba(220,38,38,.6);
  box-shadow: 0 20px 40px rgba(220,38,38,.2);
}
.toast-info {
  border-color: rgba(99,102,241,.5);
  box-shadow: 0 20px 40px rgba(99,102,241,.2);
}
.toast-msg {
  margin: 0;
  color: var(--text-main);
}
</style>
