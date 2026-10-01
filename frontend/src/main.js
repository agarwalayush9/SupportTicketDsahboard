import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import TicketList from './views/TicketList.vue'
import TicketDetail from './views/TicketDetail.vue'
import CreateTicket from './views/CreateTicket.vue'
import './assets/style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: TicketList },
    { path: '/tickets/new', component: CreateTicket },
    { path: '/tickets/:id', component: TicketDetail },
  ],
})

createApp(App).use(router).mount('#app')
