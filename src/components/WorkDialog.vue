<template>
    <div>
        <!--Edit Work Dialog-->
        <Dialog :visible.sync="workDialog" :style="{width: '450px'}" header="Work Qualifications Details"
                :modal="true" :maximizable="true" class="p-fluid">

            <div class="p-field" v-if="createWork">
                <label for="staff">Staff</label>
                <Dropdown id="staff" v-model="work.staff"
                          :options="staffs" optionLabel="name" :filter="true"
                          :class="{'p-invalid': submitted && $v.work.staff.$invalid}"/>
                <small class="p-invalid" v-if="submitted && $v.work.staff.$invalid">Staff is
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
                <Calendar id="date" v-model="work.date"/>
                <small class="p-invalid" style="margin-right: 1em" v-if="submitted && !$v.work.date.required">
                    Date is required.
                </small>
                <small class="p-invalid" v-if="submitted && !$v.work.date.dateFormat">
                    Date is in wrong format.
                </small>
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
                <span v-if="work">Are you sure you want to delete <b>{{ work.title }}</b>?</span>
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
                <span v-if="work">Are you sure you want to delete the selected Work Qualifications?</span>
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
import {required} from 'vuelidate/lib/validators'
import Toast from 'primevue/toast';
import Dialog from "primevue/dialog";
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import InputSwitch from 'primevue/inputswitch';
import Calendar from 'primevue/calendar';
// import WorkService from "@/service/WorkService";
// import StaffService from "@/service/StaffService";
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
    // staffService = new StaffService();
    staffs = [];
    // workService = new WorkService();
    workDialog = false;
    @Prop(Boolean) deleteWorkDialog;
    @Prop(Boolean) deleteWorksDialog;
    toggleWorksDialog = false;
    verifyWorks = false;
    work = {};
    submitted = false;
    selectedWorks = [];

    validations() {
        const dateFormat = value => {
            if (typeof value === 'string' && !value.match(/^\d{1,2}\/\d{4}$/g)) return false
            return this.$moment(value, "MM/YYYY").isSameOrBefore(this.$moment())
        }
        return {
            work: {
                // staff: {required},
                // level: {required},
                // discipline: {required},
                // title: {required},
                // institution: {required},
                // date: {required, dateFormat}
            }
        }
    }

    @Watch('createWork')
    async onCreateWorkChanged() {
        if (this.createWork) {
          const users = await store.dispatch('jv/get', 'users');
          this.staffs = Object.values(users)
        }
    }

    @Watch('work')
    async onWorkChanged() {
        if (this.work.date) this.work.date = this.$formatDate(this.work.date)
    }

    hideDialog() {
        this.workDialog = false;
        this.submitted = false;
    }

    async saveWork() {
        this.submitted = true;

        if (this.$v.$invalid) {
            return; // invalid input
        }

        const workObj = {
            'verified': 0,
            _jv: {
                type: 'works',
                relationships: {
                    staff: {data: {id: this.work.staff._jv.id, type: 'staffs'}}
                }
            }
        };

        ['level', 'discipline', 'title', 'description', 'institution'].forEach(el => {
            workObj[el] = this.work[el]
        });

        workObj['date'] = this.$moment(this.work.date, "MM/YYYY").toISOString()

        try {
            if (this.work._jv) {
                // PATCH
                workObj._jv.id = this.work._jv.id
                await this.workService.updateWork(workObj)
            } else {
                // POST
                await this.workService.createWork(workObj);
            }
            this.$emit('updated')
            this.toastSuccess.detail = 'Work Qualifications Updated'
            this.$toast.add(this.toastSuccess);
        } catch (e) {
            this.toastError.detail = e.message
            this.$toast.add(this.toastError);
            this.workService.logError(e).forEach(err => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Details',
                    detail: err
                });
            })
        }

        this.workDialog = false;
        this.work = {};
    }

    async deleteWork() {
        try {
            await this.workService.deleteWork(this.work._jv.id)
            this.$emit('updated')
            this.toastSuccess.detail = 'Work Qualifications Deleted'
            this.$toast.add(this.toastSuccess);
        } catch (e) {
            this.toastError.detail = e.message
            this.$toast.add(this.toastError);
            this.workService.logError(e).forEach(err => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Details',
                    detail: err
                });
            })
        }

        this.deleteWorkDialog = false;
        this.work = {};
    }

    async deleteSelectedWorks() {
        try {
            for (const deleteWork of this.selectedWorks) {
                await this.workService.deleteWork(deleteWork._jv.id)
            }
            this.$emit('updated')
            this.toastSuccess.detail = 'Work Qualifications Deleted'
            this.$toast.add(this.toastSuccess);
        } catch (e) {
            this.toastError.detail = e.message
            this.$toast.add(this.toastError);
            this.workService.logError(e).forEach(err => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Details',
                    detail: err
                });
            })
        }
        this.deleteWorksDialog = false;
        this.selectedWorks = [];
    }

    async toggleSelectedWorks() {
        try {
            if (this.verifyWorks) {
                // verify
                for (const verifyWork of this.selectedWorks) {
                    const workObj = {
                        'verified': 1,
                        'verified-by': store.state.staffId,
                        'verified-at': this.$moment().toISOString(),
                        _jv: {
                            id: verifyWork._jv.id,
                            type: 'works',
                            relationships: {
                                staff: {data: {id: verifyWork.staff._jv.id, type: 'staffs'}}
                            }
                        }
                    };
                    await this.workService.updateWork(workObj)
                }
            }

            if (!this.verifyWorks) {
                // unverify
                for (const verifyWork of this.selectedWorks) {
                    const workObj = {
                        'verified': 0,
                        'verified-by': null,
                        'verified-at': null,
                        _jv: {
                            id: verifyWork._jv.id,
                            type: 'works',
                            relationships: {
                                staff: {data: {id: verifyWork.staff._jv.id, type: 'staffs'}}
                            }
                        }
                    };
                    await this.workService.updateWork(workObj)
                }
            }

            this.$emit('updated')
            this.toastSuccess.detail = 'Work Qualifications Updated'
            this.$toast.add(this.toastSuccess);
        } catch (e) {
            this.toastError.detail = e.message
            this.$toast.add(this.toastError);
            this.workService.logError(e).forEach(err => {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Details',
                    detail: err,
                });
            })
        }

        this.toggleWorksDialog = false;
        this.selectedWorks = [];
    }
}


</script>