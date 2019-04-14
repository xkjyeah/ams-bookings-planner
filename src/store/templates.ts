import Vuex, { ActionContext } from 'vuex';
import _ from 'lodash'
import {db} from '@/lib/firebase'
import assert from 'assert'
import { deserializeArray } from '@/store/trips';
import uniqueId from '@/lib/uniqueId';


export interface TemplateMetadata {
  name: string,
  id: string,
  created: number,
}

export interface TemplatesState {
  templates: {[k: string]: TemplateMetadata}
}

export default {
  namespaced: true,

  state: {
    templates: {} as {[k: string]: TemplateMetadata},
  },

  mutations: {
    _setTemplates(state: TemplatesState, t: {[k: string]: TemplateMetadata}) {
      state.templates = t
    },

    _updateTemplate(state: TemplatesState, t: TemplateMetadata) {
      state.templates = {
        ...state.templates,
        [t.id]: t,
      }
    },

    _deleteTemplate(state: TemplatesState, t: TemplateMetadata) {
      const {[t.id]: template, ...rest} = state.templates
      state.templates = rest
    },
  },

  actions: {
    readTemplates(context: ActionContext<TemplatesState, any>): Promise<void> {
      return readTemplates().then((t: {[k: string]: TemplateMetadata}) => {
        context.commit('_setTemplates', t)
      })
    },

    updateTemplate(context: ActionContext<TemplatesState, any>, t: TemplateMetadata): void {
      if (context.rootState.trips.savesDisabled) {
        return
      }

      context.commit('_updateTemplate', t)
      syncTemplate(t)
    },

    deleteTemplate(context: ActionContext<TemplatesState, any>, t: TemplateMetadata): void {
      if (context.rootState.trips.savesDisabled) {
        return
      }

      context.commit('_deleteTemplate', t)
      syncDeleteTemplate(t)
    }
  }
}

export function readTemplates(): Promise<{[k: string]: TemplateMetadata}> {
  return db.ref('/templates')
  .once('value')
  .then((v) => {
    const raw = v.val()

    return _.values(raw)
      .map(r => {
        return {
          name: r.name || r.id,
          id: r.id || uniqueId(),
          created: parseFloat(r.created) || Date.now(),
        }
      })
      .reduce(
        (acc, v) => {
          acc[v.id] = v
          return acc
        },
        {} as {[k: string]: TemplateMetadata}
      )
  })
}

export function syncTemplate(template: TemplateMetadata): Promise<void> {
  assert(template.id)
  return db.ref(`/templates/${template.id}`)
    .set(template)
}

export function syncDeleteTemplate(template: TemplateMetadata): Promise<void> {
  assert(template.id)
  return db.ref(`/templates/${template.id}`)
    .set(null)
}