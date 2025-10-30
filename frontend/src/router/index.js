// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import GameInfoView from '../views/GameInfoView.vue'


import MarketplaceView from '../views/MarketplaceView.vue'
import LoginRegisterView from '../views/LoginRegisterView.vue'
import MyListingsView from '../views/MyListingsView.vue'
import MyOrdersView from '../views/MyOrdersView.vue'
import AdminView from '../views/AdminView.vue'
import PrivacyView from '../views/PrivacyView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import CartView from '../views/CartView.vue'   // <-- NY

const routes = [
  { path: '/', component: MarketplaceView },
  { path: '/login', component: LoginRegisterView },
  { path: '/mine', component: MyListingsView },
  { path: '/orders', component: MyOrdersView },
  { path: '/admin', component: AdminView },
  { path: '/privacy', component: PrivacyView },
  { path: '/userProfile', component: UserProfileView },
  { path: '/cart', component: CartView },     // <-- NY
  { path: '/game/:id', component: GameInfoView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  const role = auth.user?.role

  if (role === 'admin' && (to.path === '/mine' || to.path === '/orders' || to.path === '/cart')) {
    return next('/admin')
  }
  if (to.path === '/admin' && role !== 'admin') {
    return next('/')
  }
  next()
})

export default router
