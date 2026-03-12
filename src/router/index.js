import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '@/views/WelcomeView.vue'
import Login from "@/views/login/LoginPage.vue";
import Register from "@/views/login/RegisterPage.vue";
import Home from "@/views/HomePage.vue"
import PostDetail from '@/views/PostDetail.vue'
import PostUpload from '@/views/PostUpload.vue';
import UserProfile from '@/views/UserProfile.vue'
const routes = [
    {
        path: '/',
        name: 'Welcome',
        component: Welcome
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
    {
        path: '/home',
        component: Home
    },
    {
        path: '/post/:id',
        component: PostDetail
    },
    {
        path: '/upload',
        component: PostUpload
    },
    {
        path: '/profile',
        component: UserProfile
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
