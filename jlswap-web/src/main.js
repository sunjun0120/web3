import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Web3 from 'web3'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.Web3 = Web3

router.beforeEach((to, from, next) => {
    if (to.fullPath === '/') {
        next({
            path: '/swap'
        })
    } else {
        next()
    }
})

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
