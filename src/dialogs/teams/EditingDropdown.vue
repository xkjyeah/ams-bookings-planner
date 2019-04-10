<template>
  <v-menu offset-y :value="showMenu" :close-on-click="false"
     :close-on-content-click="false">
    <template v-slot:activator="activator">
      <input
        type="text"
        ref="myinput"
        v-model="searchInput"
        @input="showMenu = true"
        @blur="handleBlur"
        @keydown.down="selectNext"
        @keydown.up="selectPrev"
        @keydown.enter="selectCurrent"
        v-bind="$attrs"
      />
    </template>
    <v-list class="list"
        ref="selectionItems">
      <v-list-tile v-for="item in listItems" :key="item.value"
          :class="{active: isSelected(item)}"
          @click.native.prevent="handleSelect(item)">
        {{item.value}}
      </v-list-tile>
    </v-list>
  </v-menu>
</template>
<style lang="scss" scoped>
input {
  display: block;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  border: solid 1px red;
}
.list {
  max-height: 300px;
  overflow-y: scroll;

  .active {
    background-color: #90CAF9;
  }
}
</style>
<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'

export default Vue.extend({
  props: {
    items: {
      type: Array,
      required: true,
    },
    value: {
      validator: (prop: any) => typeof prop === 'string' || prop === null,
      required: true,
    }
  },

  computed: {
    listItems (): {text: string, value: string}[] {
      const search = (this.searchInput || '').toLowerCase()
      return (this.lowerCaseItems as string[])
      .map((s: string, index: number): [string, number] => [s, index])
      .filter((si: [string, number]): boolean => {
        const [s, i] = si
        if (!search) return true
        return s.indexOf(search) !== -1
      })
      .map((si: [string, number]) => {
        const [s, index] = si
        return {
          text: (this.items as string[])[index],
          value: (this.items as string[])[index],
        }
      })
    },

    lowerCaseItems(): string[]{
      return (this.items as any as string[]).map((s: string) => s.toLowerCase())
    },

    itemsByValue (): {[k: string]: string} {
      return _.keyBy(this.items, i => i)
    },
  },

  data () {
    return {
      searchInput: null as string | null,
      showMenu: false as boolean,
      selection: 0,
    }
  },

  mounted (): void {
    this.$watch('value', (v) => {
      this.searchInput = this.value;
    }, {immediate: true})

    this.$watch('listItems', (v) => {
      this.selection = 0
    })

    this.$watch('selection', (v) => {
      // This is super hacky, but it's because
      // Vue doesn't honour the v-for order
      // when creating an array-based ref
      const r = this.$refs.selectionItems.$el.children[v]
      if (r) {
        r.parentElement.scrollTo(
          0,
          r.offsetTop
        )
      }
    })
  },

  methods: {
    handleSelect(item: {text: any, value: any}): void {
      this.$emit('input', item.value)
      this.showMenu = false
      this.searchInput = item.text
      this.$refs.myinput.focus()
    },

    handleBlur(e: FocusEvent): void {
      // user may have clicked on a list item -- so don't
      // hide the menu immediately
      setTimeout(() => {
        this.showMenu = false
        this.$emit('blur')
      }, 1)
    },

    selectNext(): void {
      if (this.selection < this.listItems.length - 1) {
        this.selection += 1
      }
    },

    selectPrev(): void {
      if (this.selection > 0) {
        this.selection -= 1
      }
    },

    selectCurrent(): void {
      if (this.selection < this.listItems.length ) {
        this.handleSelect(this.listItems[this.selection])
      }
    },

    isSelected(item: {text: string, value: string}): boolean {
      return this.listItems[this.selection] === item
    }
  }
})
</script>

