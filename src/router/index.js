import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '@/views/WelcomeView.vue'
import Login from "@/views/login/LoginPage.vue";
import Register from "@/views/login/RegisterPage.vue";
import Home from "@/views/HomePage.vue"
import PostDetail from '@/views/PostDetail.vue'
import PostUpload from '@/views/PostUpload.vue';
import UserProfile from '@/views/UserProfile.vue'
import ProfileEdit from '@/views/ProfileEdit.vue'
import ChallengeList from '@/views/ChallengeList.vue'
import ActivityList from '@/views/ActivityList.vue'

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
        path: '/profile/:id?',  // 👈 注意这里的冒号和问号
        name: 'UserProfile',
        component: UserProfile
    },
    {
        path: '/profile/edit',
        name: 'ProfileEdit',
        component: ProfileEdit,
    },
    {
        path: '/challenge',
        name: 'ChallengeList',
        component: ChallengeList,
        meta: { title: '热门挑战赛 - LumEcho' } // 可选：设置网页标题
    },
    {
        path: '/activity',
        name: 'ActivityList',
        component: ActivityList,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,

    // ⭐ 控制页面滚动位置
    scrollBehavior(to, from, savedPosition) {

        // 浏览器前进后退
        if (savedPosition) {
            return savedPosition
        }

        // 进入新页面滚动到顶部
        return { top: 0 }
    }
})

export default router