<template>
    <div class="home">
        <div class="vue-template" v-if="login">
            <Toast/>
            <form>
                <h3>Sign In</h3>

                <div class="form-group">
                    <label>Email address</label>
                    <input v-model.trim="user.email" type="email" class="form-control form-control-lg"/>
                    <small class="p-invalid" v-if="submitted && !$v.user.email.required">Email is required. </small>
                    <small class="p-invalid" v-if="submitted && !$v.user.email.email">Invalid email format. </small>
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input v-model.trim="user.password" type="password" class="form-control form-control-lg"/>
                    <small class="p-invalid" v-if="submitted && !$v.user.password.required">Password is
                        required. </small>
                    <small class="p-invalid" v-if="submitted && !$v.user.password.minLength">Password should be at least
                        6 characters. </small>
                </div>

                <button @click.prevent="loginUser" :disabled="loading" type="submit" class="btn btn-dark btn-lg btn-block">Sign In</button>

                <p class="forgot-password text-right">
                    Not have an account?
                    <a class="button" @click.prevent="toggle">Register</a>
                </p>

                <Message v-if="showMessage" :severity="message.status" :closable="false">{{ message.message }}</Message>

            </form>
        </div>

        <div class="vue-template" v-else>
            <form>
                <h3>Register</h3>

                <div class="form-group">
                    <label>Name</label>
                    <input v-model.trim="user.name" type="text" class="form-control form-control-lg"/>
                    <small class="p-invalid" v-if="submitted && !$v.user.name.required">Name is required. </small>
                </div>

                <div class="form-group">
                    <label>Email address</label>
                    <input v-model.trim="user.email" type="email" class="form-control form-control-lg"/>
                    <small class="p-invalid" v-if="submitted && !$v.user.email.required">Email is required. </small>
                    <small class="p-invalid" v-if="submitted && !$v.user.email.email">Invalid email format. </small>
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input v-model.trim="user.password" type="password" class="form-control form-control-lg"/>
                    <small class="p-invalid" v-if="submitted && !$v.user.password.required">Password is
                        required. </small>
                    <small class="p-invalid" v-if="submitted && !$v.user.password.minLength">Password should be at least
                        6 characters. </small>
                </div>

                <div class="form-group">
                    <label>Password Confirmation</label>
                    <input v-model.trim="user['password_confirmation']" type="password"
                           class="form-control form-control-lg"/>
                    <small class="p-invalid" v-if="submitted && !$v.user['password_confirmation'].required">Password
                        Confirmation is required. </small>
                    <small class="p-invalid" v-if="submitted && !$v.user['password_confirmation'].sameAsPassword">Password
                        Confirmation not matched with password. </small>
                </div>

                <button @click.prevent="registerUser" :disabled="loading" type="submit" class="btn btn-dark btn-lg btn-block">Sign Up
                </button>

                <p class="forgot-password text-right">
                    Already registered?
                    <a class="button" @click.prevent="toggle">Sign in</a>
                </p>

                <Message v-if="showMessage" :severity="message.status" :closable="false">{{ message.message }}</Message>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

Component.registerHooks(['validations']);
import {required, email, minLength, sameAs} from 'vuelidate/lib/validators'
import axios from 'axios';
import Message from 'primevue/message';
import Toast from 'primevue/toast';

@Component({
    components: {
        Message: Vue.extend(Message),
        Toast: Vue.extend(Toast),
    },
})
export default class Home extends Vue {
    user = {};
    login = true;
    submitted = false;
    loading = false;
    showMessage = false;
    message = {
        status: '',
        message: ''
    }

    toggle() {
        this.login = !this.login
        this.submitted = false;
        this.user = {}
    }

    validations() {
        const validations = {
            user: {
                name: {},
                email: {required, email},
                password: {required, minLength: minLength(6)},
                'password_confirmation': {}
            }
        }

        if (!this.login) {
            validations.user.name = {required};
            validations.user["password_confirmation"] = {required, sameAsPassword: sameAs('password')};
        }
        return validations;
    }

    async loginUser() {
        this.loading = true;
        this.submitted = true;
        if (this.$v.$invalid) {
            this.loading = false;
            return; // invalid input
        }
        try {
            const response = await axios.post('https://tms-api.dita1.fhk-app.com/login', this.user);
            this.$store.commit('addToken', response.data.token); // add token to store
            this.$store.commit('addUserId', response.data.user.toString()); // add user id to store
            this.$store.commit('addRoles', response.data.roles); // add roles to store

            await this.$store.dispatch('jv/get', [`users/${response.data.user}`, {params: {include: 'works'}}]);
            this.showMessage = true;
            this.message.status = 'success';
            this.message.message = 'successfully logged in';
            setTimeout(() => {
                this.showMessage = false;
                this.$router.push({name: 'Dashboard'})
            }, 1000)
        } catch (e) {
            this.showMessage = true;
            this.message.status = 'error';
            let error = '';
            if (e.response.data.errors) {
                // Work with each error from the JSONAPI 'errors' array
                for (const err of e.response.data.errors) {
                    err.detail ? error += err.detail : error += err
                }
            } else {
                error += e.response.data.message;
            }
            this.message.message = error;
            setTimeout(() => {
                this.showMessage = false;
            }, 3000)
        }
        this.loading = false;
    }

    async registerUser() {
        this.loading = true;
        this.submitted = true;
        if (this.$v.$invalid) {
            this.loading = false;
            return; // invalid input
        }

        try {
            const response = await axios.post('https://tms-api.dita1.fhk-app.com/register', this.user);
            this.$store.commit('addToken', response.data.token); // add token to store
            this.$store.commit('addUserId', response.data.user); // add user id to store
            this.$store.commit('addRoles', ['regular-user']); // add roles to store

            const user = await this.$store.dispatch('jv/get', [`users/${response.data.user}`, {params: {include: 'works'}}]);
            this.showMessage = true;
            this.message.status = 'success';
            this.message.message = 'successfully logged in';
            setTimeout(() => {
                this.showMessage = false;
                this.$router.push({name: 'Dashboard'})
            }, 1000)
        } catch (e) {
            this.showMessage = true;
            this.message.status = 'error';
            let error = '';
            if (e.response.data.errors) {
                // Work with each error from the JSONAPI 'errors' array
                for (const err of e.response.data.errors) {
                    err.detail ? error += err.detail : error += err
                }
            } else {
                error += e.response.data.message;
            }
            this.message.message = error;
            setTimeout(() => {
                this.showMessage = false;
            }, 3000)
        }
        this.loading = false;
    }
}
</script>

