<template>
    <div class="card">
        <!--        <Toolbar class="p-mb-4" >-->
        <!--            <template slot="left">-->
        <!--                <Button label="New" icon="pi pi-plus" class="p-button-success p-m-1" @click="createWork"/>-->
        <!--                <Button label="Delete" icon="pi pi-trash" class="p-button-danger p-m-1"-->
        <!--                        @click="confirmDeleteSelectedWorks(selectedWorks)"-->
        <!--                        :disabled="!selectedWorks || !selectedWorks.length"/>-->
        <!--            </template>-->
        <!--            <template slot="right" v-if="adminMode">-->
        <!--                <Button label="Verify" icon="pi pi-check" class="p-button-help p-m-1"-->
        <!--                        @click="toggleWorks(selectedWorks, true)"-->
        <!--                        :disabled="!selectedWorks || !selectedWorks.length"/>-->
        <!--                <Button label="Unverify" icon="pi pi-times" class="p-button-warning p-m-1"-->
        <!--                        @click="toggleWorks(selectedWorks, false)"-->
        <!--                        :disabled="!selectedWorks || !selectedWorks.length"/>-->
        <!--            </template>-->
        <!--        </Toolbar>-->

        <DataTable ref="dt" :value="works" :selection.sync="selectedWorks" dataKey="_jv.id" :filters="filters">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="details" header="Details" sortable filterMatchMode="contains">
                <template #filter>
                    <InputText type="text" v-model="filters['details']" placeholder="Search by Details"
                               style="width: 100%"/>
                </template>
            </Column>
            <Column field="date" header="Date" sortable sortField="date"
                    filterMatchMode="custom" :filterFunction="filterDate">
                <template #body="slotProps">
                    {{ $formatDate(slotProps.data.date) }}
                </template>
                <template #filter>
                    <Calendar v-model="filters['date']" view="month" dateFormat="mm/yy"
                              :yearNavigator="true" :yearRange="`1950:${new Date().getFullYear()}`"
                              placeholder="MM/YYYY (After)"/>
                </template>
            </Column>
            <Column field="hours" header="Hours" sortable filterMatchMode="contains">
                <template #filter>
                    <InputText type="text" v-model="filters['hours']" placeholder="Search by Hours"
                               style="width: 100%"/>
                </template>
            </Column>
            <Column field="est-hours" header="Est Hours" sortable filterMatchMode="contains">
                <template #filter>
                    <InputText type="text" v-model="filters['est-hours']" placeholder="Search by Est Hours"
                               style="width: 100%"/>
                </template>
            </Column>

            <Column>
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2"
                            @click="editWork(slotProps.data)"/>
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning p-mr-2"
                            @click="confirmDeleteWork(slotProps.data)"/>
                </template>
            </Column>
            <template #empty>
                No records found.
            </template>
        </DataTable>

        <WorkDialog ref="workDialog"
                    :work-dialog="workDialog"
                    :delete-work-dialog="deleteWorkDialog"
                    :delete-works-dialog="deleteWorksDialog"/>
    </div>
</template>

<script lang="ts">
import {Component, Prop, Emit, Vue} from 'vue-property-decorator'
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Calendar from 'primevue/calendar';

Component.registerHooks(['validations']);
import {required, email, minLength, sameAs} from 'vuelidate/lib/validators'
import axios from 'axios';
import Message from 'primevue/message';
import WorkDialog from "@/components/WorkDialog.vue";

@Component({
    components: {
        WorkDialog,
        Accordion: Vue.extend(Accordion),
        AccordionTab: Vue.extend(AccordionTab),
        Toolbar: Vue.extend(Toolbar),
        DataTable: Vue.extend(DataTable),
        Column: Vue.extend(Column),
        Button: Vue.extend(Button),
        InputText: Vue.extend(InputText),
        MultiSelect: Vue.extend(MultiSelect),
        Calendar: Vue.extend(Calendar),
    },
})
export default class Dashboard extends Vue {
    works = [];
    login = true;
    submitted = false;
    showMessage = false;
    message = {
        status: '',
        message: ''
    }
    filters = {};
    selectedWorks = [];

    workDialog = false;
    deleteWorkDialog = false;
    deleteWorksDialog = false;

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

    async mounted() {
        const user = await this.$store.dispatch('jv/get', [`users/${this.$store.state.userId}`, {params: {include: 'works'}}]);
        this.works = Object.values(user.works)
    }

    // custom filter date
    filterDate(value, filter) {
        return filter instanceof Date ? this.$moment(value).isSameOrAfter(this.$moment(filter)) : value.includes(filter);
    }

    editWork(work) {
        this.workDialog = true
        this.$refs.workDialog.work = {...work};
        console.log(work)
    }

    confirmDeleteWork(work) {
        console.log(work)
    }
}
</script>

