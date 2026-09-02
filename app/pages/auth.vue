<script setup lang="ts">
import { authClient } from "../../lib/auth-client"

const mode = ref<"sign-in" | "sign-up">("sign-in")

const name = ref("")
const email = ref("")
const password = ref("")

const loading = ref(false)
const errorMessage = ref("")

const isSignUp = computed(() => mode.value === "sign-up")

async function submit() {
  errorMessage.value = ""
  loading.value = true

  try {
    if (isSignUp.value) {
      const { error } = await authClient.signUp.email({
        name: name.value,
        email: email.value,
        password: password.value,
      })

      if (error) {
        errorMessage.value = error.message ?? "Unable to create account."
        return
      }
    } else {
      const { error } = await authClient.signIn.email({
        email: email.value,
        password: password.value,
      })

      if (error) {
        errorMessage.value = error.message ?? "Invalid email or password."
        return
      }
    }

    await navigateTo("/dashboard")
  } finally {
    loading.value = false
  }
}

function switchMode() {
  mode.value = isSignUp.value ? "sign-in" : "sign-up"
  errorMessage.value = ""
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>{{ isSignUp ? "Create an account" : "Welcome back" }}</h1>

      <p class="subtitle">
        {{
          isSignUp
            ? "Sign up with your email and password."
            : "Sign in to continue."
        }}
      </p>

      <form @submit.prevent="submit">
        <label v-if="isSignUp">
          Name
          <input
            v-model="name"
            type="text"
            autocomplete="name"
            required
            placeholder="Jane Doe"
          />
        </label>

        <label>
          Email
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
          />
        </label>

        <label>
          Password
          <input
            v-model="password"
            type="password"
            :autocomplete="isSignUp ? 'new-password' : 'current-password'"
            minlength="8"
            required
            placeholder="At least 8 characters"
          />
        </label>

        <p v-if="errorMessage" class="error" role="alert">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="loading">
          {{
            loading
              ? "Please wait..."
              : isSignUp
                ? "Create account"
                : "Sign in"
          }}
        </button>
      </form>

      <button class="switch-mode" type="button" @click="switchMode">
        {{
          isSignUp
            ? "Already have an account? Sign in"
            : "Need an account? Sign up"
        }}
      </button>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 1.5rem;
  background: #f8fafc;
}

.auth-card {
  width: min(100%, 26rem);
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
  box-shadow: 0 10px 30px rgb(15 23 42 / 8%);
}

h1 {
  margin: 0;
  font-size: 1.75rem;
}

.subtitle {
  margin: 0.5rem 0 1.5rem;
  color: #64748b;
}

form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.4rem;
  font-size: 0.9rem;
  font-weight: 600;
}

input {
  padding: 0.7rem 0.8rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.45rem;
  font: inherit;
}

button {
  padding: 0.75rem 1rem;
  border: 0;
  border-radius: 0.45rem;
  background: #2563eb;
  color: white;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}

button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.switch-mode {
  width: 100%;
  margin-top: 1rem;
  background: transparent;
  color: #2563eb;
}

.error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
}
</style>