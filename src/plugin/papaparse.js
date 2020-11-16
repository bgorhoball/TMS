import papaparse from 'papaparse'

export default {
    install(Vue, options) {
        Vue.prototype.$papaparse = papaparse;
    }
}

