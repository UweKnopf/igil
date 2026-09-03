<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'
import { authClient } from '~~/lib/auth-client'

const toast = useToast()
const errorMessage = ref("")
const loading = ref(false)
const route = useRoute()

definePageMeta({
  middleware: 'guest'
})

const fields: AuthFormField[] = [{
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
  type: 'checkbox',
  defaultValue: false
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
    
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Must be at least 8 characters'),
    remember: z.boolean().default(false), //remember to change AuthForm too
})

type Schema = z.output<typeof schema>

  function getRedirectPath() {
  const redirect = route.query.redirect

  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//')
  ) {
    return redirect
  }

  return '/orgDashboard'
}

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  errorMessage.value = ""
  loading.value = true

  try {
    
    const { error } = await authClient.signIn.email({
      email: payload.data.email,
      password: payload.data.password,
      rememberMe: payload.data.remember,
    })

    if (error) {
      errorMessage.value = error.message ?? "Unable to sign in."
      return
    }

    const { data: session, error: sessionError } = await authClient.getSession()

    if (sessionError || !session) {
      errorMessage.value =
        'Sign-in succeeded, but we could not confirm your session. Please try again.'
      return
    }

    await navigateTo(getRedirectPath())

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
          Don't have an account? <ULink to="/signUp" class="text-primary font-medium">Sign up</ULink>.
        </template>
        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">Forgot password?</ULink>
        </template>
        <template #validation>
          <UAlert v-if="errorMessage" color="error" icon="i-lucide-info" title="Unable to sign in" :description="errorMessage" />
        </template>
        <template #footer>
          By signing in, you agree to our <ULink to="#" class="text-primary font-medium">Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
