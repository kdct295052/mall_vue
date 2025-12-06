// src/router/index.ts (需要创建这个文件)
import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'
import Login from '@/component/Login.vue'
import Index from '@/component/index.vue'


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/login'  // 根路径重定向到登录页
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/home',
        name: 'Index',
        component: Index,
        // 可以添加路由守卫检查是否已登录
        children: [
            {
                path: '',
                name: 'DefaultHome',
                component: () => import('@/component/Home.vue')
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/component/Main.vue')
            },
            {
                path: 'item',
                name: 'Item',
                component: () => import('@/component/Item.vue')
            },
            {
                path: 'category',
                name: 'Category',
                component: () => import('@/component/Category.vue')
            },

            {
                path: 'info',
                name: 'HomeInfo',
                component: () => import('@/component/Home.vue')
            }, {
                path: 'warehouse',
                name: 'warehouse',
                component: () => import('@/component/Warehouse.vue')
            },{
                path: 'suppliercustomer',
                name: 'suppliercustomer',
                component: () => import('@/component/suppliercustomer.vue')
            }
        ]
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
