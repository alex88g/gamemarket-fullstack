<template>
  <section class="card" v-if="auth.isLoggedIn">
    <div class="card-header">
      <div>
        <div class="card-title">Min profil</div>
        <div class="card-sub">Visa och uppdatera dina uppgifter</div>
      </div>
    </div>

    <div class="row">
      <div class="input-group">
        <label class="input-label" for="username">Användarnamn</label>
        <input id="username" class="input-field" v-model="me.username" />
      </div>

      <div class="input-group">
        <label class="input-label" for="email">E-post</label>
        <input id="email" class="input-field" type="email" v-model="me.email" />
      </div>

      <div class="row-2col" style="margin-top:.5rem">
        <button class="btn primary" @click="saveLater">Spara ändringar</button>
        <button class="btn danger" @click="deleteLater">Radera konto</button>
      </div>
    </div>
  </section>

  <section class="card" v-else>
    <div class="card-title">Inte inloggad</div>
    <div class="card-sub">Logga in för att se din profil.</div>
  </section>
</template>

<script setup>
import { reactive, watchEffect } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { useToastStore } from '../store/toast.js'

const auth = useAuthStore()
const toast = useToastStore()

// Storing locally so you can PUT later
const me = reactive({ username: '', email: '' })

watchEffect(() => {
  me.username = auth.user?.username || ''
  me.email = auth.user?.email || ''
})

function saveLater() {
  toast.push('Sparfunktion kommer snart', 'info')
}
function deleteLater() {
  toast.push('Radering kommer snart', 'warn')
}
</script>