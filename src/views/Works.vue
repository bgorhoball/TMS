<template>
    <div class="card">
        <Toolbar class="p-mb-4">
            <template slot="left">
                <Button label="New" icon="pi pi-plus" class="p-button-success p-m-1" @click="createWork"/>
                <Button label="Delete" icon="pi pi-trash" class="p-button-danger p-m-1"
                        @click="confirmDeleteSelectedWorks()"
                        :disabled="!selectedWorks || !selectedWorks.length"/>
                <Button label="Export" icon="pi pi-upload" class="p-button-help p-m-1"
                        @click="exportCSV(selectedWorks)"
                        :disabled="!selectedWorks || !selectedWorks.length"/>
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="works" :selection.sync="selectedWorks" dataKey="_jv.id" :filters="filters"
                   :rowClass="rowClass">
            <template #header>
                <div class="table-header">
                    Work Records
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="details" header="Details" sortable filterMatchMode="contains">
                <template #filter>
                    <InputText type="text" v-model="filters['details']" placeholder="Search by Details"
                               style="width: 100%"/>
                </template>
            </Column>
            <Column field="date" header="Date" sortable sortField="date" filterMatchMode="custom"
                    :filterFunction="filterDate">
                <template #body="slotProps">
                    {{ $formatDate(slotProps.data.date) }}
                </template>
                <template #filter>
                    <Calendar v-model="filters['date']" placeholder="Date" style="width: 100%"/>
                </template>
            </Column>
            <Column field="est-hours" header="Est Hours" sortable filterMatchMode="contains" headerStyle="width: 15%">
                <template #filter>
                    <InputText type="text" v-model="filters['est-hours']" placeholder="Search by Est Hours"
                               style="width: 100%"/>
                </template>
            </Column>
            <Column field="hours" header="Hours" sortable filterMatchMode="contains" headerStyle="width: 15%">
                <template #filter>
                    <InputText type="text" v-model="filters['hours']" placeholder="Search by Hours"
                               style="width: 100%"/>
                </template>
            </Column>
            <Column field="user.name" header="user" sortable filterMatchMode="contains">
                <template #filter>
                    <InputText type="text" v-model="filters['user.name']" placeholder="Search by User"
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

        <WorkDialog ref="workDialog" @updated="onItemsUpdated"/>
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

export default class Works extends Vue {
    works = [];
    filters = {};
    selectedWorks = [];

    async mounted() {
        const works = await this.$store.dispatch('jv/get', ['works', {params: {include: 'user'}}]);
        this.works = Object.values(works)
    }

    // custom filter date
    filterDate(value, filter) {
        return filter instanceof Date ? this.$moment(value).isSameOrAfter(this.$moment(filter)) : value.includes(filter);
    }

    rowClass(data) {
        if (!data.hours) return null
        return data.hours < data['est-hours'] ? 'row-red' : 'row-green'
    }

    createWork() {
        this.$refs.workDialog.createWork = true;
        this.$refs.workDialog.workDialog = true
    }

    editWork(work) {
        this.$refs.workDialog.work = {...work};
        this.$refs.workDialog.createWork = false;
        this.$refs.workDialog.workDialog = true
    }

    confirmDeleteWork(work) {
        this.$refs.workDialog.work = {...work};
        this.$refs.workDialog.deleteWorkDialog = true
    }

    confirmDeleteSelectedWorks() {
        this.$refs.workDialog.selectedWorks = this.selectedWorks;
        this.$refs.workDialog.deleteWorksDialog = true
    }

    exportCSV(selectedWorks) {
        const papaObj = {
            fields: ['Details', 'Date', 'Est Hours', 'Hours', 'User'],
            data: []
        };

        for (const selectedWork of selectedWorks) {
            const rowArr = []
            rowArr.push(selectedWork.details, this.$formatDate(selectedWork.date), selectedWork['est-hours'], selectedWork.hours, selectedWork.user.name)
            papaObj.data.push(rowArr)
        }
        const csvString = this.$papaparse.unparse(papaObj)
        this.$exportCsv(csvString, `Work-Records-Summary-${this.$moment().format('YYYY_MM_DD-HH_mm_ss')}`)
    }

    // listen to items updated
    async onItemsUpdated() {
        const works = await this.$store.dispatch('jv/get', ['works', {params: {include: 'user'}}]);
        this.works = Object.values(works)
    }
}
</script>

<style lang="scss" scoped>
/deep/ .row-red {
    background-color: palevioletred !important;
}

/deep/ .row-green {
    background-color: lightgreen !important;
}
</style>