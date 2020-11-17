<template>
    <div class="card">
        <Toolbar class="p-mb-4">
            <template slot="left">
                <Button label="New" icon="pi pi-plus" class="p-button-success p-m-1" @click="createUser"/>
                <Button label="Delete" icon="pi pi-trash" class="p-button-danger p-m-1"
                        @click="confirmDeleteSelectedUsers()"
                        :disabled="!selectedUsers || !selectedUsers.length"/>
            </template>
        </Toolbar>

        <DataTable ref="dt" :value="users" :selection.sync="selectedUsers" dataKey="_jv.id" :filters="filters">
            <template #header>
                <div class="table-header">
                    Users
                </div>
            </template>
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>

            <Column field="name" header="Name" sortable filterMatchMode="contains">
                <template #filter>
                    <InputText type="text" v-model="filters['name']" placeholder="Search by Name"
                               style="width: 100%"/>
                </template>
            </Column>

            <Column field="email" header="Email" sortable filterMatchMode="contains" >
                <template #filter>
                    <InputText type="text" v-model="filters['email']" placeholder="Search by Email"
                               style="width: 100%"/>
                </template>
            </Column>

            <Column>
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2"
                            @click="editUser(slotProps.data)"/>
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning p-mr-2"
                            @click="confirmDeleteUser(slotProps.data)"/>
                </template>
            </Column>
            <template #empty>
                No records found.
            </template>
        </DataTable>

        <UserDialog ref="userDialog" @updated="onItemsUpdated"/>
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

import UserDialog from "@/components/UserDialog.vue";

@Component({
    components: {
        UserDialog,
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

export default class Users extends Vue {
    users = [];
    filters = {};
    selectedUsers = [];

    async mounted() {
        const users = await this.$store.dispatch('jv/get', 'users');
        this.users = Object.values(users)
    }

    createUser() {
        this.$refs.userDialog.createUser = true;
        this.$refs.userDialog.userDialog = true
    }

    editUser(user) {
        this.$refs.userDialog.user = {...user};
        this.$refs.userDialog.createUser = false;
        this.$refs.userDialog.userDialog = true
    }

    confirmDeleteUser(user) {
        this.$refs.userDialog.user = {...user};
        this.$refs.userDialog.deleteUserDialog = true
    }

    confirmDeleteSelectedUsers() {
        this.$refs.userDialog.selectedUsers = this.selectedUsers;
        this.$refs.userDialog.deleteUsersDialog = true
    }

    // listen to items updated
    async onItemsUpdated() {
        const users = await this.$store.dispatch('jv/get', 'users');
        this.users = Object.values(users)
    }
}
</script>

<style scoped>

</style>