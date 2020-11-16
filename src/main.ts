import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ToastService from 'primevue/toastservice';
import Vuelidate from 'vuelidate'
import moment from './plugin/moment';
import formatDate from './plugin/formatDate'
import papaparse from './plugin/papaparse'
import 'bootstrap/dist/css/bootstrap.min.css'

Vue.config.productionTip = false

Vue.use(ToastService)
Vue.use(Vuelidate)
Vue.use(moment)
Vue.use(formatDate)
Vue.use(papaparse)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
