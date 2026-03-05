import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue'
import Login from "@/views/login/LoginPage.vue";
import Register from "@/views/login/RegisterPage.vue"; // 导入首页组件

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/register',
        component: Register
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
