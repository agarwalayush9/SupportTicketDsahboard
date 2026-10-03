<template>
  <div>
    <div class="mb-1">
      <RouterLink to="/" class="text-faint">&laquo; Cancel &amp; Back</RouterLink>
    </div>

    <h1 class="title">New Ticket</h1>

    <div v-if="apiError" class="mb-1 text-red">
      {{ apiError }}
    </div>

    <form @submit.prevent="submitForm" novalidate>
      
      <div class="mb-1">
        Title <span class="text-red">*</span>: 
        <input
          v-model="form.title"
          class="inline-input"
          style="width: 400px;"
          :class="{ 'input-error': errors.title }"
          placeholder="Brief description..."
          @blur="validateField('title')"
        />
        <span v-if="errors.title" class="text-red ml-1">{{ errors.title }}</span>
      </div>

      <div class="mb-1">
        Email <span class="text-red">*</span>: 
        <input
          v-model="form.email"
          type="email"
          class="inline-input"
          style="width: 300px;"
          :class="{ 'input-error': errors.email }"
          placeholder="user@example.com"
          @blur="validateField('email')"
        />
        <span v-if="errors.email" class="text-red ml-1">{{ errors.email }}</span>
      </div>

      <div class="mb-2">
        Priority: 
        <select v-model="form.priority" class="inline-input" style="width: 100px;">
          <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
        </select>
        &nbsp;&nbsp;&nbsp;&nbsp;
        Status: 
        <select v-model="form.status" class="inline-input" style="width: 120px;">
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div class="mb-2">
        Description <span class="text-red">*</span>:
        <span v-if="errors.description" class="text-red ml-1">{{ errors.description }}</span>
        <textarea
          v-model="form.description"
          class="inline-input"
          :class="{ 'input-error': errors.description }"
          placeholder="..."
          @blur="validateField('description')"
        ></textarea>
      </div>

      <div class="mb-2">
        <button type="submit" class="inline-btn primary" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Submit Ticket' }}
        </button>
      </div>

    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'
import { STATUSES, PRIORITIES } from '../utils.js'

const router = useRouter()

const form = reactive({ title: '', description: '', email: '', priority: 'Medium', status: 'Open' })
const errors     = reactive({})
const submitting = ref(false)
const apiError   = ref('')

function validateField(field) {
  delete errors[field]
  if (field === 'title') {
    if (!form.title.trim())       errors.title = '(Required)'
    else if (form.title.length > 120) errors.title = '(Max 120 chars)'
  }
  if (field === 'email') {
    if (!form.email.trim())       errors.email = '(Required)'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                   errors.email = '(Invalid email)'
  }
  if (field === 'description') {
    if (!form.description.trim()) errors.description = '(Required)'
  }
}

function validateAll() {
  ['title', 'email', 'description'].forEach(validateField)
  return Object.keys(errors).length === 0
}

async function submitForm() {
  apiError.value = ''
  if (!validateAll()) return
  submitting.value = true
  try {
    const ticket = await api.createTicket({
      title:       form.title.trim(),
      description: form.description.trim(),
      email:       form.email.trim(),
      priority:    form.priority,
      status:      form.status,
    })
    router.push(`/tickets/${ticket.id}`)
  } catch (e) {
    if (e.details?.length) {
      e.details.forEach((d) => { errors[d.field] = '(' + d.message + ')' })
    } else {
      apiError.value = e.message || 'Failed to create ticket.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ml-1 { margin-left: 16px; }
.input-error {
  border-left-color: var(--c4) !important;
  border-bottom-color: var(--c4) !important;
}
</style>
