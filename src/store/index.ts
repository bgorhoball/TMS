import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import {jsonapiModule} from 'jsonapi-vuex/src/jsonapi-vuex.js'

Vue.use(Vuex)

const api = axios.create({
    baseURL: 'https://tms-api.dita1.fhk-app.com/api/v1/',
    headers: {
        'Content-Type': 'application/vnd.api+json',
    },
})

export default new Vuex.Store({
    state: {
        token: '',
        userId: null,
        roles: []
    },
    mutations: {
        addToken(store, payload) {
            store.token = payload
            api.defaults.headers.common['Authorization'] = `Bearer ${payload}`;
        },
        addUserId(store, payload) {
            store.userId = payload
        },
        addRoles(store, payload) {
            store.roles = payload
        },
    },
    actions: {},
    modules: {
        jv: jsonapiModule(api)
    }
})
