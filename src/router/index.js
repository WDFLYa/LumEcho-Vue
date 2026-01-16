import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/HomeView.vue' // 导入首页组件

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    // 其他路由...
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
