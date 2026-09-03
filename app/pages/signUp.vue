<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { authClient } from '~~/lib/auth-client'

const toast = useToast()
const errorMessage = ref("")
const loading = ref(false)

definePageMeta({
  middleware: "sign",
})


const fields: AuthFormField[] = [{
  name: 'name',
  type: 'name',
  label: 'Name',
  placeholder: 'Enter your name',
  required: true
},{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox'
}]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

const schema = z.object({
    name: z.string('Name is required').min(3, 'Must be at least 3 characters').max(256, 'Must be less then 256 characters'),
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = ""
  loading.value = true

  try {
    
      const { error } = await authClient.signUp.email({
        name: payload.data.name,
        email: payload.data.email,
        password: payload.data.password,
      })

      if (error) {
        errorMessage.value = error.message ?? "Unable to create account."
        return
      }

      await navigateTo("/dashboard")

  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Unexpected error. Please try again."

  }
  finally {
    loading.value = false
  }
} 
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        :providers="providers"
        :loading="loading"
        title="Welcome back!"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account? <ULink to="/signIn" class="text-primary font-medium">Sign in</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
        </template>
        <template #validation>
          <UAlert v-if="errorMessage" color="error" icon="i-lucide-info" title="Unable to create account" :description="errorMessage" />
        </template>
        <template #footer>
          By signing up, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
