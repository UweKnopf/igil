<template>
  <main class="home">
    <section class="card">
      <h1>My App</h1>
      <p>Welcome. Choose where you want to go.</p>

      <div class="actions">
        <NuxtLink to="/dashboard" class="button primary">
          Go to dashboard
        </NuxtLink>

        <NuxtLink to="/auth" class="button secondary">
          Sign in / Sign up
        </NuxtLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 1.5rem;
  background: #f8fafc;
}

.card {
  width: min(100%, 32rem);
  padding: 2rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  background: white;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.button {
  display: inline-block;
  padding: 0.75rem 1rem;
  border-radius: 0.45rem;
  text-decoration: none;
  font-weight: 600;
}

.primary {
  background: #2563eb;
  color: white;
}

.secondary {
  border: 1px solid #cbd5e1;
  background: white;
  color: #1e293b;
}
</style>