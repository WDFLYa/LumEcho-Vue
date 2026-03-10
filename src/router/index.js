import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '@/views/WelcomeView.vue'
import Login from "@/views/login/LoginPage.vue";
import Register from "@/views/login/RegisterPage.vue";
import Home from "@/views/HomePage.vue"


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
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
