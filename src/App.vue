<template>
    <div id="app">
        <div id="nav">
            <template v-if="!this.$store.state.userId">
                <router-link to="/">Home</router-link>
            </template>
            <template v-else>
                <router-link v-if="this.$store.state.userId" to="/dashboard"> Dashboard |</router-link>
                <router-link
                    v-if="this.$store.state.roles.includes('admin') || this.$store.state.roles.includes('user-manager')"
                    to="/users"> Users |
                </router-link>

                <router-link v-if="this.$store.state.roles.includes('admin')" to="/works"> Work Records |</router-link>

                <a class="button" @click.prevent="logout"> Logout </a>
                <!--                <router-link to="/logout">Logout</router-link>-->
            </template>

        </div>
        <router-view/>
    </div>
</template>

<script lang="ts">
import {Vue} from 'vue-property-decorator';
import axios from 'axios'

export default class App extends Vue {
    async logout() {
        try {
            if (this.$store.state.token) {
                await axios.post(`${process.env.VUE_APP_WEBBASEURL}/logout`, '', {
                    headers: {
                        'Accept': 'application/vnd.api+json',
                        'Content-Type': 'application/vnd.api+json',
                        'Authorization': `Bearer ${this.$store.state.token}`
                    },
                });
                this.$store.state.userId = null;
                this.$router.push({name: 'Home'})
            }
        } catch (e) {
            console.log(e)
        }
    }
}
</script>

<style lang="scss">
@import "~primevue/resources/themes/saga-blue/theme.css";
@import "~primevue/resources/primevue.min.css";
@import "~primeicons/primeicons.css";
@import "~primeflex/primeflex.css";
@import './assets/css/main.css';

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

#nav {
    padding: 30px;
}

#nav a {
    font-weight: bold;
    color: #2c3e50;
}

#nav a.router-link-exact-active {
    color: #42b983;
}
</style>
