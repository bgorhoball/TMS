import Vue from 'vue'
import VueRouter, {RouteConfig} from 'vue-router'
import Home from '../views/Home.vue'
import store from '../store/index'


Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        beforeEnter(to, from, next) {
            store.state.userId ? next() : next('/')
        },
        component: () => import(/* webpackChunkName: "about" */ '../views/Dashboard.vue')
    },
    {
        path: '/users',
        name: 'Users',
        beforeEnter(to, from, next) {
            store.state.userId ? (store.state.roles.includes('user-manager') || store.state.roles.includes('admin') ? next() : next('/dashboard')) : next('/')
        },
        component: () => import(/* webpackChunkName: "about" */ '../views/Users.vue')
    },
    {
        path: '/works',
        name: 'Works',
        beforeEnter(to, from, next) {
            store.state.userId ? (store.state.roles.includes('admin') ? next() : next('/dashboard')) : next('/')
        },
        component: () => import(/* webpackChunkName: "about" */ '../views/Works.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router
