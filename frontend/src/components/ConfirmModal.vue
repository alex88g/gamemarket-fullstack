<!-- src/components/ConfirmModal.vue -->
<template>
  <div class="modal-overlay">
    <div class="modal-card">
      <h2 class="card-title">{{ title }}</h2>
      <p class="card-sub">{{ message }}</p>

      <div style="display:flex; gap:.75rem; flex-wrap:wrap; justify-content:flex-end;">
        <button class="btn" @click="$emit('cancel')">Avbryt</button>
        <button class="btn danger" @click="$emit('confirm')">Ja, fortsätt</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Bekräfta' },
  message: { type: String, default: 'Är du säker?' }
})
defineEmits(['confirm','cancel'])
</script>
