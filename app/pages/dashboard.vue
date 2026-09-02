<script setup lang="ts">
import { authClient } from "../../lib/auth-client"

definePageMeta({
  middleware: "auth",
})

const { data: session } = await authClient.useSession(useFetch)

async function logout() {
  await authClient.signOut()
  await navigateTo("/auth")
}
</script>

<template>
  <main>
    <h1>Dashboard</h1>

    <p v-if="session">
      Signed in as {{ session.user.email }}
    </p>

    <button @click="logout">
      Sign out
    </button>
  </main>
</template>