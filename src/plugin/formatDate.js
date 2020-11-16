import moment from 'moment'

export default {
    install(Vue, options) {
        Vue.prototype.$formatDate = dateStr => {
            const momentObj = moment(dateStr);
            return momentObj.isValid() ? momentObj.format('YYYY-MM-DD') : dateStr
        }
    }
}

