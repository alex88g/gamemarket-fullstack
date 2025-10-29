// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

import MarketplaceView from '../views/MarketplaceView.vue'
import LoginRegisterView from '../views/LoginRegisterView.vue'
import MyListingsView from '../views/MyListingsView.vue'
import MyOrdersView from '../views/MyOrdersView.vue'
import AdminView from '../views/AdminView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import UserProfileView from '../views/UserProfileView.vue'

const routes = [
  { path: '/', component: MarketplaceView },
  { path: '/login', component: LoginRegisterView },
  { path: '/mine', component: MyListingsView },
  { path: '/orders', component: MyOrdersView },
  { path: '/admin', component: AdminView },
  { path: '/privacy', component: PrivacyView },
  { path: '/userProfile', component: UserProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// global guard
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  const role = auth.user?.role

  // admin får INTE se /mine eller /orders
  if (role === 'admin' && (to.path === '/mine' || to.path === '/orders')) {
    return next('/admin')
  }

  // icke-admin får INTE se /admin
  if (to.path === '/admin' && role !== 'admin') {
    return next('/')
  }

  next()
})

export default router
