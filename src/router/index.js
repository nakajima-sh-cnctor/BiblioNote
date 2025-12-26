import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import LoginView from '../features/auth/views/LoginView.vue'
import SignupView from '../features/auth/views/SignupView.vue'
import ForgotPasswordView from '../features/auth/views/ForgotPasswordView.vue'
import ProfileView from '../features/profile/views/ProfileView.vue'
import ProfileDetailView from '../features/profile/views/ProfileDetailView.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
    { path: '/', component: HomeView, meta: { requiresAuth: true, requiresProfile: true } },
    { path: '/login', component: LoginView, meta: { requiresGuest: true } },
    { path: '/signup', component: SignupView, meta: { requiresGuest: true } },
    { path: '/forgot-password', component: ForgotPasswordView, meta: { requiresGuest: true } },
    { path: '/profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/profile/view', component: ProfileDetailView, meta: { requiresAuth: true, requiresProfile: true } },
    { path: '/notes/:id', component: () => import('../features/notes/views/NoteEditView.vue'), meta: { requiresAuth: true, requiresProfile: true } },
    { path: '/notes/new', component: () => import('../features/notes/views/NoteEditView.vue'), meta: { requiresAuth: true, requiresProfile: true } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Loading state management
import { useLoading } from '../composables/useLoading'
const { setLoading } = useLoading()

router.beforeEach(async (to, from, next) => {
    // Start loading
    setLoading(true)

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
    const requiresProfile = to.matched.some(record => record.meta.requiresProfile)
    const currentUser = auth.currentUser

    if (requiresAuth && !currentUser) {
        next('/login')
    } else if (requiresGuest && currentUser) {
        next('/')
    } else if (requiresProfile && currentUser) {
        // Firebaseでプロフィールの存在確認
        try {
            const { CheckProfileExists } = await import('../features/profile/application/usecases/CheckProfileExists')
            const { FirebaseProfileRepository } = await import('../features/profile/infrastructure/repositories/FirebaseProfileRepository')

            const repository = new FirebaseProfileRepository()
            const checkProfileExists = new CheckProfileExists(repository)
            const profileExists = await checkProfileExists.execute(currentUser.uid)

            if (!profileExists && to.path !== '/profile') {
                next('/profile')
            } else {
                next()
            }
        } catch (error) {
            console.error('Error checking profile:', error)
            next()
        }
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
