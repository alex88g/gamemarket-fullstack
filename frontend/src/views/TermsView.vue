<!-- src/views/TermsView.vue -->
<!-- src/views/TermsView.vue -->
<template>
  <section class="legal-wrapper">
    <article class="card prose" v-html="html"></article>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const html = ref('<p>Laddar...</p>')

function extractBody(doc) {
  const m = doc.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (m) return m[1]
  return doc
    .replace(/<!doctype[^>]*>/ig, '')
    .replace(/<\/?html[^>]*>/ig, '')
    .replace(/<\/?head[^>]*>[\s\S]*?<\/head>/ig, '')
    .replace(/<\/?body[^>]*>/ig, '')
}

onMounted(async () => {
  try {
    const res = await api.get('/legal/terms', { responseType: 'text' })
    html.value = extractBody(res.data)
    document.title = 'Allmänna villkor – GameMarket'
    window.scrollTo(0, 0)
  } catch {
    html.value = '<p>Kunde inte ladda villkoren.</p>'
  }
})
</script>

<style scoped>
.legal-wrapper { max-width: 860px; margin: 2rem auto; padding: 0 1rem; }
.prose { line-height: 1.7; color: var(--text-main); }
.prose :deep(h1), .prose :deep(h2) { margin: 0 0 .75rem 0; line-height: 1.25; }
.prose :deep(h1) { font-size: 1.4rem; }
.prose :deep(p), .prose :deep(li) { color: var(--text-main); }
.prose :deep(ul) { margin: 0 0 1rem 1.25rem; }
.prose :deep(a) { color: var(--accent-hover); text-decoration: underline; }
</style>



