<template>
    <div>
        <!--Edit User Dialog-->
        <Dialog :visible.sync="userDialog" :style="{width: '450px'}" header="User Qualifications Details"
                :modal="true" :maximizable="true" class="p-fluid" @hide="submitted = false">

            <div class="p-field">
                <label for="name">Name</label>
                <InputText id="name" v-model.trim="user.name" required="true" autofocus
                           :class="{'p-invalid': submitted && $v.user.name.$invalid}"/>
                <small class="p-invalid" v-if="submitted && $v.user.name.$invalid">Name is
                    required.</small>
            </div>

            <div class="p-field">
                <label for="email">Email</label>
                <InputText id="email" v-model.trim="user.email" required="true" autofocus
                           :class="{'p-invalid': submitted && $v.user.email.$invalid}"/>
                <small class="p-invalid" v-if="submitted && !$v.user.email.required">Email is required.</small>
                <small class="p-invalid" v-if="submitted && !$v.user.email.email">Invalid email format.</small>
            </div>
            
            <div class="p-field" v-if="createUser">
                <label for="password">Password</label>
                <Password id="password" v-model.trim="user.password" required="true" autofocus
                          :class="{'p-invalid': submitted && $v.user.password.$invalid}"/>
                <small class="p-invalid" v-if="submitted && !$v.user.password.required">Password is
                    required. </small>
                <small class="p-invalid" v-if="submitted && !$v.user.password.minLength">Password should be at least
                    6 characters. </small>
            </div>

            <div class="p-field" v-if="createUser">
                <label for="password_confirmation">Password Confirmation</label>
                <Password id="password_confirmation" v-model.trim="user.password_confirmation" required="true"
                          autofocus
                          :class="{'p-invalid': submitted && $v.user.password_confirmation.$invalid}"/>
                <small class="p-invalid" v-if="submitted && !$v.user['password_confirmation'].required">Password
                    Confirmation is required. </small>
                <small class="p-invalid" v-if="submitted && !$v.user['password_confirmation'].sameAsPassword">Password
                    Confirmation not matched with password. </small>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
                <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveUser"/>
            </template>
        </Dialog>


        <!--Delete User Dialog-->
        <Dialog :visible.sync="deleteUserDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
                <span v-if="user">Are you sure you want to delete <b>{{ user.name }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text"
                        @click="deleteUserDialog = false"/>
                <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteUser"/>
            </template>
        </Dialog>

        <!--Delete Users Dialog-->
        <Dialog :visible.sync="deleteUsersDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
                <span v-if="user">Are you sure you want to delete the selected User?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text"
                        @click="deleteUsersDialog = false"/>
                <Button label="Yes" icon="pi pi-check" class="p-button-text"
                        @click="deleteSelectedUsers"/>
            </template>
        </Dialog>
    </div>
</template>

<script>
import {Component, Prop, Vue} from "vue-property-decorator";

Component.registerHooks(['validations']);
import {required, integer, minLength, email, sameAs} from 'vuelidate/lib/validators'
import Toast from 'primevue/toast';
import Dialog from "primevue/dialog";
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
import Calendar from 'primevue/calendar';
import Password from 'primevue/password';
import store from "../store";
import axios from 'axios';

/**
 * Class-component
 */
@Component({
    components: {
        Toast: Vue.extend(Toast),
        Dialog: Vue.extend(Dialog),
        Dropdown: Vue.extend(Dropdown),
        InputText: Vue.extend(InputText),
        Button: Vue.extend(Button),
        InputSwitch: Vue.extend(InputSwitch),
        Calendar: Vue.extend(Calendar),
        Password: Vue.extend(Password),
    }
})
export default class UserDialog extends Vue {
    users = [];
    userDialog = false;
    deleteUserDialog = false;
    deleteUsersDialog = false;
    user = {};
    submitted = false;
    selectedUsers = [];
    showMessage = false;
    createUser = false;
    message = {
        status: '',
        message: ''
    }

    validations() {
        if (this.createUser) {
            return {
                user: {
                    name: {required},
                    email: {required, email},
                    password: {required, minLength: minLength(6)},
                    'password_confirmation': {required, sameAsPassword: sameAs('password')}
                }
            }
        } else {
            return {
                user: {
                    name: {required},
                    email: {required, email},
                }
            }
        }
    }

    hideDialog() {
        this.userDialog = false;
        this.user = {}
    }

    async saveUser() {
        this.submitted = true;

        if (this.$v.$invalid) {
            return; // invalid input
        }

        const userObj = {
            _jv: {
                type: 'users',
            }
        };

        ['name', 'email'].forEach(el => {
            userObj[el] = this.user[el]
        });

        if (this.createUser) {
            ['password', 'password_confirmation'].forEach(el => {
                userObj[el] = this.user[el]
            });
        }

        try {
            if (this.user._jv) {
                // PATCH
                userObj._jv.id = this.user._jv.id
                await store.dispatch('jv/patch', userObj)
            } else {
                // POST
                await axios.post(`${process.env.VUE_APP_WEBBASEURL}/register`, this.user);
            }
            this.$emit('updated')
        } catch (e) {
            console.log(e)
        }
        this.userDialog = false;
        this.user = {};
    }

    async deleteUser() {
        try {
            await store.dispatch('jv/delete', `users/${this.user._jv.id}`)
            this.$emit('updated')
        } catch (e) {
            console.log(e)
        }
        this.deleteUserDialog = false;
        this.user = {};
    }

    async deleteSelectedUsers() {
        try {
            for (const deleteUser of this.selectedUsers) {
                await store.dispatch('jv/delete', `users/${deleteUser._jv.id}`)
            }
            this.$emit('updated')
        } catch (e) {
            console.log(e)
        }
        this.deleteUsersDialog = false;
        this.selectedUsers = [];
    }
}


</script>