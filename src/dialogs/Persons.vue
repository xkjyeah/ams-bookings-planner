<template>
  <StandardDialog name="persons"
    title="Manage people"
    >
    <!-- fixme: choose a better key -->
    <div v-for="(person, i) in personList"
      :key="i"
      :data-key="person.name"
      ref="personsGrid">

      <div class="persons-grid">
        <div class="action">
          <span @click="dropPerson(person)">
            <v-icon>delete</v-icon>
          </span>
        </div>

        <!-- name cannot be edited here -->
        <EditingCell class="cell" :disabled="true">
          {{person.name}}
        </EditingCell>
        <!-- telephone may be edited -->
        <EditingCell class="cell">
          <template v-if="person.telephone">
            {{person.telephone}}
          </template>
          <span v-else class="placeholder">(No telephone)</span>

          <template v-slot:editor="editor">
            <EditingTextField
              :value="person.telephone"
              @change="updatePerson(i, $event, 'telephone')"
              @blur="editor.blur()"
              />
          </template>
        </EditingCell>
        <EditingCell class="cell" :disabled="true">
          {{person.created && sAgo(person.created, 'DD MMM YYYY, hh:mm:ss')}}
          {{person.updated && sAgo(person.updated, 'DD MMM YYYY, hh:mm:ss')}}
        </EditingCell>
      </div>
      <v-alert
        v-if="errors[i]"
        :value="true"
        type="error"
      >
        {{errors[i]}}
      </v-alert>
    </div>
    <div class="persons-grid">

      <div class="action">
        (New)
      </div>

      <EditingCell class="cell">
        <template v-if="newPerson.name">
          {{newPerson.name}}
        </template>
        <span v-else class="placeholder">(Name)</span>
        <template v-slot:editor="editor">
          <EditingTextField
            v-model="newPerson.name"
            @change="maybeCreatePerson"
            @blur="editor.blur()"
          />
        </template>
      </EditingCell>
      <EditingCell class="cell">
      </EditingCell>
      <EditingCell class="cell">
      </EditingCell>
    </div>
    <v-alert
      v-if="errors['new']"
      :value="true"
      type="error"
    >
      {{errors['new']}}
    </v-alert>
  </StandardDialog>
</template>
<style scoped lang="scss">
.persons-grid {
  display: flex;
  flex-direction: row;
  height: 2em;

  & > div.action {
    border: dashed 1px #ccc;
    flex: 0 0 3em;
  }
  & > div.cell {
    border: dashed 1px #ccc;
    flex: 0 0 calc((100% - 3em) / 3);
  }
}
</style>
<script lang="ts">
import _ from 'lodash'
import Vue from 'vue'
import store from '@/store'
import { VehiclesState, Person, PersonList } from '@/store/vehicles';
import EditingCell from '@/dialogs/teams/EditingCell.vue';
import EditingTextField from '@/dialogs/teams/EditingTextField.vue';
import PersonView from '@/dialogs/teams/PersonView.vue';
import StandardDialog from '@/dialogs/StandardDialog.vue';
import assert from 'assert';
import sAgo from 's-ago';

export default Vue.extend({
  data () {
    return {
      reference: Date.now(),

      newPerson: {
        name: null as string | null,
        telephone: null as string | null,
      },

      errors: {} as {[k: string]: string}
    }
  },

  components: {
    EditingCell,
    EditingTextField,
    PersonView,
    StandardDialog
  },

  computed: {
    sAgo: () => (d: any): string => sAgo(new Date(d)),

    personList () {
      return _.sortBy(
        (store.getters['vehicles/personArray'] as Person[]),
        (p: Person) => p.created < this.reference
          ? [0, p.name, null]
          : [1, null, -p.created]
      )
    },

    personByLowercaseKey () {
      return _.keyBy(
        (store.getters['vehicles/personArray'] as Person[]),
        (p: Person) => p.name.toLowerCase()
      )
    }
  },

  watch: {
    dialogShown () {
      // Shuffle the list every time the dialog is shown
      this.reference = Date.now()
    }
  },

  methods: {
    handleDialogInput (inp: any) {
      if (!inp) {
        store.commit('dialogs/hideDialog')
      }
    },

    dropPerson(person: Person) {
      if (confirm(`Are you sure you want to delete ${person.name}?`)) {
        this.$store.commit('vehicles/deletePerson', person)
      }
    },

    updatePerson(index: number, value: string, field: 'telephone') {
      this.$store.commit('vehicles/updatePerson', {
        ...this.personList[index],
        [field]: value,
      })
    },

    // Argh hacky way of handling this. Dammit. How to prevent
    personExists(notInIndex: number | null, name: string): boolean {
      return name.toLowerCase() in this.personByLowercaseKey
    },

    flashError(index: number | 'new', message: string) {
      this.errors = {...this.errors, [index.toString()]: message}
      setTimeout(() => {
        if (this.errors[index.toString()] === message) {
          const {[index.toString()]: a, ...rest} = this.errors
          this.errors = rest
        }
      }, 4000)
    },

    maybeCreatePerson (): void {
      if (this.newPerson.name) {
        const {name, telephone} = this.newPerson

        if (this.personExists(null, name)) {
          return this.flashError('new', `This person (${name}) already exists`)
        }

        store.commit('vehicles/updatePerson', {name, telephone, created: Date.now(), updated: Date.now()} as Person)
        this.newPerson = {name: null, telephone: null}
        this.$nextTick(() => {
          const key = name
          const wrapper = (this.$refs.personsGrid as Element[] as HTMLElement[])
            .find(d => d.dataset.key === key)
          const inputs = wrapper &&
            [...wrapper.querySelectorAll('.cell')] as HTMLInputElement[] | null

          if (inputs) {
            inputs[1].focus()
          }
        })
      }
    }
  }
})
</script>

