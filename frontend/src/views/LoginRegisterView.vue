<template>
  <section class="auth-wrapper">
    <div class="auth-grid">
      <!-- LOGIN -->
      <div class="card auth-panel">
        <div class="card-header no-margin">
          <div>
            <div class="card-title">Logga in</div>
            <div class="card-sub">Välkommen tillbaka 👋</div>
          </div>
        </div>

        <form class="panel-form" @submit.prevent="handleLogin">
          <div class="input-group">
            <label class="input-label">E-post</label>
            <input
              class="input-field"
              v-model.trim="loginEmail"
              type="email"
              placeholder="you@example.com"
            />
            <p v-if="loginErrors.email" class="err-msg">{{ loginErrors.email }}</p>
          </div>

          <div class="input-group">
            <label class="input-label">Lösenord</label>
            <input
              class="input-field"
              v-model="loginPassword"
              type="password"
              placeholder="••••••••"
            />
            <p v-if="loginErrors.password" class="err-msg">{{ loginErrors.password }}</p>
          </div>

          <button class="btn primary w-full-btn" type="submit">
            Logga in
          </button>

          <p class="hint-text">
            Har du inget konto? <span class="accent-soft">Skapa konto här bredvid →</span>
          </p>
        </form>
      </div>

      <!-- REGISTER -->
      <div class="card auth-panel highlight">
        <div class="card-header no-margin">
          <div>
            <div class="card-title">Skapa konto</div>
            <div class="card-sub">
              Bli medlem och börja lägga upp spel för försäljning eller uthyrning.
            </div>
          </div>
        </div>

        <form class="panel-form" @submit.prevent="handleRegister">
          <div class="input-group">
            <label class="input-label">Användarnamn</label>
            <input
              class="input-field"
              v-model.trim="regUsername"
              placeholder="t.ex. retroMaster87"
            />
            <p v-if="regErrors.username" class="err-msg">{{ regErrors.username }}</p>
          </div>

          <div class="input-group">
            <label class="input-label">E-post</label>
            <input
              class="input-field"
              v-model.trim="regEmail"
              type="email"
              placeholder="you@example.com"
            />
            <p v-if="regErrors.email" class="err-msg">{{ regErrors.email }}</p>
          </div>

          <div class="input-group">
            <label class="input-label">Lösenord</label>
            <input
              class="input-field"
              v-model="regPassword"
              type="password"
              placeholder="Minst 6 tecken"
            />
            <p v-if="regErrors.password" class="err-msg">{{ regErrors.password }}</p>
          </div>

         <label class="consent-row">
  <input type="checkbox" v-model="regConsent" />
  <span class="consent-text">
    Jag samtycker till
    <router-link to="/terms" class="consent-link">allmänna villkor</router-link>
    och
    <router-link to="/privacy" class="consent-link">integritetspolicyn</router-link>.
  </span>
</label>

        <p v-if="regErrors.consent" class="err-msg">{{ regErrors.consent }}</p>

          <button class="btn primary w-full-btn" type="submit">
            Skapa konto
          </button>

          <p class="hint-text">
            Redan medlem? <span class="accent-soft">Logga in till vänster ←</span>
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { useToastStore } from '../store/toast.js'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

// LOGIN state
const loginEmail = ref('')
const loginPassword = ref('')
const loginErrors = ref({
  email: '',
  password: '',
})

// REGISTER state
const regUsername = ref('')
const regEmail = ref('')
const regPassword = ref('')
const regConsent = ref(false)
const regErrors = ref({
  username: '',
  email: '',
  password: '',
  consent: '',
})

function validateLogin() {
  loginErrors.value = { email: '', password: '' }
  let ok = true
  if (!loginEmail.value) {
    loginErrors.value.email = 'E-post krävs'
    ok = false
  }
  if (!loginPassword.value) {
    loginErrors.value.password = 'Lösenord krävs'
    ok = false
  }
  return ok
}

function validateRegister() {
  regErrors.value = { username: '', email: '', password: '' }
  regErrors.value = { username: '', email: '', password: '', consent: '' }
  let ok = true
  if (!regUsername.value) {
    regErrors.value.username = 'Användarnamn krävs'
    ok = false
  }
  if (!regEmail.value) {
    regErrors.value.email = 'E-post krävs'
    ok = false
  }
  if (!regPassword.value) {
    regErrors.value.password = 'Lösenord krävs'
    ok = false
  }
  if (!regConsent.value) {
    regErrors.value.consent = 'Du behöver samtycka till personuppgiftsbehandlingen'; ok = false
  }
  return ok
}

async function handleLogin() {
  if (!validateLogin()) return

  try {
    await auth.login(loginEmail.value, loginPassword.value)
    toast.push(`Inloggad som ${auth.user.username}`, 'success')
    router.push('/')
  } catch (err) {
    console.error(err)
    toast.push('Fel e-post/lösenord eller serverfel', 'error')
  }
}

async function handleRegister() {
  if (!validateRegister()) return

  try {
    await auth.register(regUsername.value, regEmail.value, regPassword.value)
    toast.push('Konto skapat ✅ Du kan nu logga in.', 'success')

    // rensa formuläret
    regUsername.value = ''
    regEmail.value = ''
    regPassword.value = ''
    regConsent.value = false
  } catch (err) {
    console.error(err)
    toast.push('Registrering misslyckades', 'error')
  }
}
</script>

<style scoped>
/* wrapper runt allt = centrerar blocket i sidan */
.auth-wrapper {
  min-height: calc(100vh - 80px); /* ~ minus navbarhöjd */
  display: grid;
  place-items: center;
  padding: 2rem 1rem;
}

/* själva två-kolumnslayouten */
.auth-grid {
  width: 100%;
  max-width: 900px;
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr 1.4fr; /* lite asymmetri */
}

@media (max-width: 700px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }
}

/* varje panelkort */
.auth-panel {
  display: grid;
  row-gap: 1.25rem;
  align-content: start;
}

/* highlight på registerpanelen så den känns "CTA" */
.highlight {
  border-color: var(--accent);
  box-shadow: 0 24px 48px rgba(99,102,241,.35);
  position: relative;
}

/* formulären i korten */
.panel-form {
  display: grid;
  row-gap: 1rem;
}

.w-full-btn {
  width: 100%;
  justify-content: center;
  text-align: center;
}

/* liten text under knappen */
.hint-text {
  font-size: .75rem;
  line-height: 1.4;
  color: var(--text-dim);
  margin: 0;
  text-align: center;
}

.accent-soft {
  color: var(--accent-hover);
  font-weight: 500;
}

/* felmeddelanden för inputs */
.err-msg {
  color: #fca5a5;
  font-size: .7rem;
  line-height: 1.3;
  margin: 0;
}

/* ta bort default extra spacing i card-header för just auth */
.no-margin {
  margin-bottom: 0;
}

.consent-row {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex-wrap: wrap;
  line-height: 1.4;
}

.consent-text { display: inline; }

.consent-link,
.consent-link:visited {
  color: var(--accent-hover);
  text-decoration: underline;
}
</style>
