<template>
  <div>
    <div class="mb-1">
      <RouterLink to="/" class="text-faint">&laquo; Back to Tickets</RouterLink>
    </div>

    <div v-if="loading">
      <div class="skeleton skeleton-text" style="width: 50%; height: 32px; margin-bottom: var(--lh);"></div>
      <div class="mb-1"><div class="skeleton skeleton-text" style="width: 35%;"></div></div>
      <div class="mb-2"><div class="skeleton skeleton-text" style="width: 250px; height: 32px;"></div></div>
      <div class="text-faint">Description:</div>
      <div class="mb-2">
        <div class="skeleton skeleton-text" style="width: 95%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 85%; margin-bottom: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 90%;"></div>
      </div>
    </div>
    <div v-else-if="error" class="text-red">Error: {{ error }}</div>
    <div v-else-if="ticket">
      
      <!-- Title -->
      <h1 class="title">#{{ ticket.id }}: {{ ticket.title }}</h1>
      
      <!-- Meta -->
      <div class="mb-1 text-faint">
        From: <span class="text-ink">{{ ticket.email }}</span> &nbsp;|&nbsp;
        Created: <span class="text-ink">{{ formatDate(ticket.created_at) }}</span>
        <span v-if="ticket.updated_at !== ticket.created_at">
          &nbsp;|&nbsp; Updated: <span class="text-ink">{{ formatDate(ticket.updated_at) }}</span>
        </span>
      </div>

      <!-- Editor -->
      <div class="mb-2">
        Status: 
        <select v-model="form.status" class="inline-input" style="width: 120px;" :disabled="saving">
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
        &nbsp;&nbsp;
        Priority: 
        <select v-model="form.priority" class="inline-input" style="width: 100px;" :disabled="saving">
          <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
        </select>
        &nbsp;&nbsp;
        <button class="inline-btn primary" @click="saveChanges" :disabled="saving || !hasChanges">
          {{ saving ? 'Saving...' : 'Save' }}
        </button>
        <span v-if="saved" class="text-green ml-1">Saved!</span>
        <span v-if="updateError" class="text-red ml-1">{{ updateError }}</span>
      </div>

      <!-- Description -->
      <div class="text-faint">Description:</div>
      <div class="description-block">
        {{ ticket.description }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api.js'
import { STATUSES, PRIORITIES, formatDate } from '../utils.js'

const route = useRoute()

const ticket      = ref(null)
const loading     = ref(false)
const error       = ref('')
const saving      = ref(false)
const saved       = ref(false)
const updateError = ref('')

const form = reactive({ status: '', priority: '' })

const hasChanges = computed(
  () => ticket.value &&
    (form.status !== ticket.value.status || form.priority !== ticket.value.priority)
)

async function loadTicket() {
  loading.value = true; error.value = ''
  try {
    ticket.value    = await api.getTicket(route.params.id)
    form.status     = ticket.value.status
    form.priority   = ticket.value.priority
  } catch (e) {
    error.value = e.status === 404 ? 'Ticket not found.' : (e.message || 'Failed to load ticket.')
  } finally {
    loading.value = false
  }
}

async function saveChanges() {
  saving.value = true; saved.value = false; updateError.value = ''
  try {
    const updated   = await api.updateTicket(route.params.id, { status: form.status, priority: form.priority })
    ticket.value    = updated
    form.status     = updated.status
    form.priority   = updated.priority
    saved.value     = true
    setTimeout(() => (saved.value = false), 2500)
  } catch (e) {
    updateError.value = e.message || 'Failed to save changes.'
  } finally {
    saving.value = false
  }
}

onMounted(loadTicket)
</script>

<style scoped>
.description-block {
  white-space: pre-wrap;
  margin-bottom: calc(var(--lh) * 2);
  color: var(--c2);
}
.ml-1 { margin-left: 16px; }
</style>
