import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '@/views/Layout.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Layout,
        children: [
            {
                path: '/swap',
                component: () => import('@/views/swap.vue')
            },
            {
                path: '/farm',
                component: () => import('@/views/farm.vue')
            },
            {
                path: '/pool',
                component: () => import('@/views/pool.vue')
            }
        ]
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
