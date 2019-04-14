<template>
  <v-menu offset-y bottom allow-overflow :value="showMenu"
      :close-on-click="false"
      :close-on-content-click="false"
      >
    <template v-slot:activator="activator">
      <v-layout class="layout"
        ref="inputParent">
        <input
          type="text"
          ref="myinput"
          v-model="searchInput"
          @input="handleShowMenu"
          @blur="handleBlur"
          @focus="handleFocus"
          @keydown.down="selectNext"
          @keydown.down.alt="handleShowMenu"
          @keydown.up="selectPrev"
          @keydown.enter="selectCurrent"
          @keydown.esc="showMenu = false"
          v-bind="$attrs"
        />
        <!-- Make the following focusable, so that we
        can check the `relatedTarget` of the blur event
        and cancel the blur if this is clicked -->
        <v-icon class="menu-chevron"
          tabindex="-1"
          @click.native="handleShowMenu">expand_more</v-icon>
      </v-layout>
    </template>
    <v-list class="list"
        tabindex="-1"
        ref="selectionItems">
      <div v-for="item in listItems" :key="item.value"
          :class="{active: isSelected(item)}"
          class="list-tile"
          @click.prevent="handleClick(item)">
        {{item.value}}
      </div>
    </v-list>
  </v-menu>
</template>
<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
  input {
    flex: 1 1 auto;
    align-self: stretch;
    border: solid 1px red;
    box-sizing: border-box;
  }
  .menu-chevron {
    flex: 0 0 auto;
    user-select: none;
    padding: 0;
    margin: 0;
    box-sizing: border-box;
  }
}
.list {
  max-height: 200px;
  overflow-y: scroll;

  .active {
    background-color: #90CAF9;
  }
}
.list-tile {
  padding: 0.25em;
}
</style>
<script lang="ts">
import Vue from 'vue'
import _ from 'lodash'

export default Vue.extend({
  props: {
    items: {},
    value: {},
    // Somehow required for typechecking to succeed
    // value: {type: String},
    // items: {
    //   type: Array,
    //   required: true,
    // },
    // value: {
    //   // validator: (prop: any): boolean => typeof prop === 'string' || prop === null,
    //   required: true,
    // }
  },

  computed: {
    listItems (): {text: string, value: string}[] {
      const searchInput = this.searchInput as string
      const searchLowerCase = (searchInput || '').toLowerCase()
      const entries = (this.lowerCaseItems as string[])
      .map((s: string, index: number): [string, number] => [s, index])
      .filter((si: [string, number]): boolean => {
        const [s, i] = si
        if (!searchLowerCase) return true
        return s.indexOf(searchLowerCase) !== -1
      })
      .map((si: [string, number]) => {
        const [s, index] = si
        return {
          text: (this.items as string[])[index],
          value: (this.items as string[])[index],
        }
      })

      if (!(searchLowerCase in this.itemsByValue)) {
        return entries
          .concat([{
            text: searchInput || '',
            value: searchInput || '',
          }])
      } else {
        return entries
      }
    },

    lowerCaseItems(): string[]{
      return (this.items as any as string[]).map((s: string) => s.toLowerCase())
    },

    itemsByValue (): {[k: string]: string} {
      return _.keyBy(this.lowerCaseItems, i => i)
    },
  },

  data () {
    return {
      searchInput: null as string | null,
      showMenu: false as boolean,
      selection: -1,
      blurTimeout: null as number | null,
    }
  },

  mounted (): void {
    this.$watch('value', (v: any) => {
      this.searchInput = this.value as string;
    }, {immediate: true})

    this.$watch('listItems', (v: any) => {
      this.selection = -1
    })

    this.$watch('selection', (v: any) => {
      // This is super hacky, but it's because
      // Vue doesn't honour the v-for order
      // when creating an array-based ref
      const r = (this.$refs.selectionItems as Vue).$el.children[v]
      if (r) {
        r.parentElement!.scrollTo(
          0,
          (r as HTMLElement).offsetTop
        )
      }
    })
  },

  methods: {
    handleClick(item: {text: any, value: any}): void {
      this.handleSelect(item)
      this.focusBack()

      setTimeout(() => {
        this.focusBack()
      }, 1)
    },

    handleSelect(item: {text: any, value: any}): void {
      console.log('handleSelect')
      this.$emit('input', item.value)
      this.showMenu = false
      this.searchInput = item.text
      this.selection = -1
    },

    handleBlur(e: FocusEvent): void {
      // user may have clicked on a list item -- so don't
      // hide the menu immediately
      const target = e.relatedTarget
      if (target &&
        target instanceof HTMLElement &&
        (
          isDescendentOf(
            target,
            this.$refs.inputParent as Element as HTMLElement) ||
          isDescendentOf(
            target,
            (this.$refs.selectionItems as Vue).$el as Element as HTMLElement)
        )
      ) {
        return
      }

      console.log('handleBlur', e.relatedTarget)
      this.blurTimeout = setTimeout(() => {
        console.log('blurTimeout')
        this.$emit('input', (
          (this.selection !== -1 && this.listItems[this.selection].value) ||
          this.searchInput ||
          ''
        ).trim() || null)

        this.showMenu = false
        this.blurTimeout = null
        this.$emit('blur')
      }, 1)
    },

    // If we programmatically bring back focus,
    // clear the blur timeout
    handleFocus(e?: FocusEvent): void {
      if (this.blurTimeout !== null) {
        console.log('clearing timeout')
        clearTimeout(this.blurTimeout)
        this.blurTimeout = null
      } else {
        console.log('nothing to clear!')
      }
    },

    handleShowMenu(): void {
      console.log('handleShowMenu')
      this.showMenu = true
      this.focusBack()

      setTimeout(() => {
        this.focusBack()
      }, 1)
    },

    focusBack() {
      this.handleFocus()
      ; (this.$refs.myinput as HTMLInputElement).focus()
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

    selectCurrent(event: KeyboardEvent): void {
      event.preventDefault()
      if (this.selection < this.listItems.length &&
        this.selection >= 0) {
        this.handleSelect(this.listItems[this.selection])
        this.focusBack()
      }
    },

    isSelected(item: {text: string, value: string}): boolean {
      return this.listItems[this.selection] === item
    },

    notify(message: string) {
      console.log(message)
    }
  }
})

function isDescendentOf(e: HTMLElement, f: HTMLElement): boolean {
  let current: HTMLElement | null = e

  console.log('isDescendentOf BEGIN', f)
  while (current) {
    console.log(current)
    if (current === f) return true
    current = current.parentElement
  }
  console.log('isDescendentOf END')
  return false
}
</script>

