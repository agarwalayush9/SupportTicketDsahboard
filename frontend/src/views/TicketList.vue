<template>
  <div>
    <!-- Title -->
    <h1 class="title">Tickets</h1>

    <!-- Summary -->
    <div class="mb-1 text-faint">
      Total: <span class="text-ink">{{ summary.total ?? '—' }}</span> &nbsp;|&nbsp;
      Open: <span class="text-blue">{{ summary.open ?? '—' }}</span> &nbsp;|&nbsp;
      In Progress: <span class="text-orange">{{ summary.in_progress ?? '—' }}</span> &nbsp;|&nbsp;
      Resolved: <span class="text-green">{{ summary.resolved ?? '—' }}</span>
    </div>

    <!-- Filters -->
    <div class="mb-2">
      Search: 
      <input
        v-model="filters.search"
        @input="onSearchInput"
        type="text"
        class="inline-input"
        style="width: 140px; margin-right: 16px;"
        placeholder="..."
      />

      Status: 
      <select v-model="filters.status" @change="applyFilters" class="inline-input" style="width: 110px; margin-right: 16px;">
        <option value="">All</option>
        <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
      </select>

      Priority: 
      <select v-model="filters.priority" @change="applyFilters" class="inline-input" style="width: 100px; margin-right: 16px;">
        <option value="">All</option>
        <option v-for="p in PRIORITIES" :key="p" :value="p">{{ p }}</option>
      </select>

      Sort: 
      <select v-model="filters.sort" @change="applyFilters" class="inline-input" style="width: 110px;">
        <option value="desc">Newest</option>
        <option value="asc">Oldest</option>
      </select>

      <button
        v-if="hasActiveFilters"
        class="inline-btn"
        @click="clearFilters"
        style="margin-left: 8px;"
      >
        (Clear)
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="mb-1 text-red">
      Error: {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="mb-1 text-faint">
      Loading...
    </div>

    <!-- Empty State -->
    <div v-else-if="tickets.length === 0" class="mb-1 text-faint">
      No tickets found.
    </div>

    <!-- Ticket List -->
    <div v-else class="mb-2">
      <div class="ticket-header-row text-faint">
        <div class="row-num">#</div>
        <div class="row-title">Title</div>
        <div class="row-status">Status</div>
        <div class="row-priority">Priority</div>
        <div class="row-date">Logged</div>
      </div>
      
      <div
        v-for="(ticket, index) in tickets"
        :key="ticket.id"
        class="ticket-row"
        @click="goToTicket(ticket.id)"
      >
        <div class="row-num">{{ ((filters.page - 1) * 10) + index + 1 }}.</div>
        <div class="row-title">{{ ticket.title }}</div>
        <div class="row-status" :class="statusColor(ticket.status)">[{{ ticket.status }}]</div>
        <div class="row-priority" :class="priorityColor(ticket.priority)">[{{ ticket.priority }}]</div>
        <div class="row-date">{{ relativeDate(ticket.created_at) }}</div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && pagination.totalPages > 1" class="mt-1 text-faint">
      Page {{ pagination.page }} of {{ pagination.totalPages }} &nbsp;
      <button
        class="inline-btn"
        :disabled="pagination.page <= 1"
        @click="setPage(pagination.page - 1)"
      >Prev</button>
      <button
        class="inline-btn"
        :disabled="pagination.page >= pagination.totalPages"
        @click="setPage(pagination.page + 1)"
      >Next</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../api.js'
import { STATUSES, PRIORITIES, relativeDate } from '../utils.js'

const router = useRouter()

const tickets    = ref([])
const pagination = ref({})
const summary    = ref({})
const loading    = ref(false)
const error      = ref('')

const filters = reactive({ search: '', status: '', priority: '', sort: 'desc', page: 1 })

let searchTimer = null

const hasActiveFilters = computed(
  () => filters.search || filters.status || filters.priority || filters.sort !== 'desc'
)

function statusColor(status) {
  if (status === 'Open') return 'text-blue'
  if (status === 'In Progress') return 'text-orange'
  if (status === 'Resolved') return 'text-green'
  return ''
}

function priorityColor(priority) {
  if (priority === 'High') return 'text-red'
  if (priority === 'Medium') return 'text-orange'
  if (priority === 'Low') return 'text-green'
  return ''
}

async function fetchTickets() {
  loading.value = true
  error.value   = ''
  try {
    const result = await api.listTickets({
      search:   filters.search   || undefined,
      status:   filters.status   || undefined,
      priority: filters.priority || undefined,
      sort:     filters.sort,
      page:     filters.page,
      limit:    10,
    })
    tickets.value    = result.data
    pagination.value = result.pagination
  } catch (e) {
    error.value = e.message || 'Failed to load tickets.'
  } finally {
    loading.value = false
  }
}

async function fetchSummary() {
  try { summary.value = await api.getSummary() } catch { /* non-critical */ }
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => { filters.page = 1; fetchTickets() }, 350)
}

function applyFilters() { filters.page = 1; fetchTickets() }

function clearFilters() {
  filters.search = ''; filters.status = ''; filters.priority = ''
  filters.sort = 'desc'; filters.page = 1
  fetchTickets()
}

function setPage(p) { filters.page = p; fetchTickets(); window.scrollTo({ top: 0, behavior: 'smooth' }) }
function goToTicket(id) { router.push(`/tickets/${id}`) }

onMounted(() => { fetchTickets(); fetchSummary() })
</script>

<style scoped>
.ticket-header-row {
  display: flex;
  height: var(--lh);
  align-items: center;
  padding-left: 8px;
  margin-left: -8px;
  border-bottom: 2px dashed rgba(15, 23, 42, 0.2);
}
.ticket-row {
  display: flex;
  height: var(--lh);
  cursor: pointer;
  align-items: center;
  border-radius: 4px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: -8px; /* pull slightly out so text stays aligned when padded */
  padding-left: 8px;
}
.ticket-row:hover {
  background-color: rgba(59, 130, 246, 0.04);
  transform: translateX(4px);
}
.row-num { width: 32px; color: var(--c2); opacity: 0.5; }
.row-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--c2); padding-right: 16px; transition: color 0.2s; }
.ticket-row:hover .row-title { color: var(--c3); }
.row-status { width: 110px; }
.row-priority { width: 90px; }
.row-date { width: 80px; color: var(--c2); opacity: 0.5; text-align: right; padding-right: 8px; }
</style>
