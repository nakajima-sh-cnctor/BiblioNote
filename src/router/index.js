import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import LoginView from '../features/auth/views/LoginView.vue'
import SignupView from '../features/auth/views/SignupView.vue'
import ForgotPasswordView from '../features/auth/views/ForgotPasswordView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
    { path: '/', component: HomeView, meta: { requiresAuth: true } },
    { path: '/login', component: LoginView, meta: { requiresGuest: true } },
    { path: '/signup', component: SignupView, meta: { requiresGuest: true } },
    { path: '/forgot-password', component: ForgotPasswordView, meta: { requiresGuest: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Loading state management
import { useLoading } from '../composables/useLoading'
const { setLoading } = useLoading()

router.beforeEach((to, from, next) => {
    // Start loading
    setLoading(true)

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    const currentUser = auth.currentUser

    if (requiresAuth && !currentUser) {
        next('/login')
    } else if (requiresGuest && currentUser) {
        next('/')
    } else {
        next()
    }
})

router.afterEach(() => {
    // End loading with a small delay for smooth UX
    setTimeout(() => {
        setLoading(false)
    }, 300)
})

export default router
