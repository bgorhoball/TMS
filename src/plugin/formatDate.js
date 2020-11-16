import moment from 'moment'

export default {
    install(Vue, options) {
        Vue.prototype.$formatDate = dateStr => {
            const momentObj = moment(dateStr);
            return momentObj.isValid() ? `${momentObj.month() + 1}/${momentObj.year()}` : dateStr
        }
    }
}

