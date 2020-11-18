<template>
    <div>
        <!--Edit Work Dialog-->
        <Dialog :visible.sync="workDialog" :style="{width: '450px'}" header="Work Qualifications Details"
                :modal="true" :maximizable="true" class="p-fluid" @hide="submitted = false">

            <div class="p-field" v-if="createWork">
                <label for="user">User</label>
                <Dropdown id="user" v-model="work.user"
                          :options="users" optionLabel="name" :filter="true"
                          :class="{'p-invalid': submitted && $v.work.user.$invalid}"/>
                <small class="p-invalid" v-if="submitted && $v.work.user.$invalid">User is
                    required.</small>
            </div>

            <div class="p-field">
                <label for="details">Details</label>
                <InputText id="details" v-model.trim="work.details" required="true" autofocus
                           :class="{'p-invalid': submitted && $v.work.details.$invalid}"/>
                <small class="p-invalid" v-if="submitted && $v.work.details.$invalid">Details is
                    required.</small>
            </div>

            <div class="p-field">
                <label for="date">Date</label>
                <Calendar id="date" v-model="work.date" dateFormat="yy-mm-dd"/>
                <small class="p-invalid" style="margin-right: 1em" v-if="submitted && !$v.work.date.required">
                    Date is required.
                </small>
                <small class="p-invalid" v-if="submitted && !$v.work.date.dateFormat">
                    Date is in wrong format.
                </small>
            </div>

            <div class="p-field">
                <label for="est-hours">Est Hours</label>
                <InputText id="est-hours" v-model.trim="work['est-hours']" required="true" autofocus
                           :class="{'p-invalid': submitted && $v.work['est-hours'].$invalid}"/>
                <small class="p-invalid" v-if="submitted && $v.work['est-hours'].$invalid">Est Hours is
                    required.</small>
            </div>

            <div class="p-field">
                <label for="hours">Hours</label>
                <InputText id="hours" v-model.trim="work.hours" required="true" autofocus
                           :class="{'p-invalid': submitted && $v.work.hours.$invalid}"/>
                <small class="p-invalid" v-if="submitted && $v.work.hours.$invalid">Hours is
                    required.</small>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
                <Button label="Save" icon="pi pi-check" class="p-button-text" @click="saveWork"/>
            </template>
        </Dialog>


        <!--Delete Work Dialog-->
        <Dialog :visible.sync="deleteWorkDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
                <span v-if="work">Are you sure you want to delete <b>{{ work.details }}</b>?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text"
                        @click="deleteWorkDialog = false"/>
                <Button label="Yes" icon="pi pi-check" class="p-button-text" @click="deleteWork"/>
            </template>
        </Dialog>

        <!--Delete Works Dialog-->
        <Dialog :visible.sync="deleteWorksDialog" :style="{width: '450px'}" header="Confirm" :modal="true">
            <div class="confirmation-content">
                <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem"/>
                <span v-if="work">Are you sure you want to delete the selected Work Records?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" class="p-button-text"
                        @click="deleteWorksDialog = false"/>
                <Button label="Yes" icon="pi pi-check" class="p-button-text"
                        @click="deleteSelectedWorks"/>
            </template>
        </Dialog>
    </div>
</template>

<script>
import {Component, Prop, Vue, Watch} from "vue-property-decorator";

Component.registerHooks(['validations']);
import {required, integer} from 'vuelidate/lib/validators'
import Toast from 'primevue/toast';
import Dialog from "primevue/dialog";
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
import Calendar from 'primevue/calendar';
import store from "../store";

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
        Calendar: Vue.extend(Calendar)
    }
})
export default class WorkDialog extends Vue {
    createWork = false;
    users = [];
    workDialog = false;
    deleteWorkDialog = false;
    deleteWorksDialog = false;
    work = {};
    submitted = false;
    selectedWorks = [];
    showMessage = false;
    message = {
        status: '',
        message: ''
    }

    validations() {
        const dateFormat = value => {
            if (typeof value === 'string' && !value.match(/^\d{4}-\d{1,2}-\d{1,2}$/g)) return false
            return this.$moment(value).isValid();
        }
        return {
            work: {
                user: {required},
                details: {required},
                date: {required, dateFormat},
                'est-hours': {required, integer},
                hours: {integer},
            }
        }
    }

    @Watch('createWork')
    async onCreateWorkChanged() {
        if (this.createWork) {
            const users = await store.dispatch('jv/get', 'users');
            this.users = Object.values(users)
        }
    }

    @Watch('work')
    async onWorkChanged() {
        if (this.work.date) this.work.date = this.$formatDate(this.work.date)
    }

    hideDialog() {
        this.workDialog = false;
        this.work = {};
    }

    async saveWork() {
        this.submitted = true;

        if (this.$v.$invalid) {
            return; // invalid input
        }

        const workObj = {
            _jv: {
                type: 'works',
                relationships: {
                    user: {data: {id: this.work.user._jv.id, type: 'users'}}
                }
            }
        };

        ['details', 'hours', 'est-hours',].forEach(el => {
            workObj[el] = this.work[el]
        });

        workObj['date'] = this.$moment(this.work.date).toISOString()

        try {
            if (this.work._jv) {
                // PATCH
                workObj._jv.id = this.work._jv.id
                await store.dispatch('jv/patch', workObj)
            } else {
                // POST
                await store.dispatch('jv/post', workObj)
            }
            this.$emit('updated')
        } catch (e) {
            console.log(e)
        }
        this.workDialog = false;
        this.work = {};
    }

    async deleteWork() {
        try {
            await store.dispatch('jv/delete', `works/${this.work._jv.id}`)
            this.$emit('updated')
        } catch (e) {
            console.log(e)
        }
        this.deleteWorkDialog = false;
        this.work = {};
    }

    async deleteSelectedWorks() {
        try {
            for (const deleteWork of this.selectedWorks) {
                await store.dispatch('jv/delete', `works/${deleteWork._jv.id}`)
            }
            this.$emit('updated')
        } catch (e) {
            console.log(e)
        }
        this.deleteWorksDialog = false;
        this.selectedWorks = [];
    }
}


</script>