/**
 * 公共 store
 * 所有接口返回的数据，及公共 state，都保存于此
 */

import Vue from 'vue'
import Vuex from 'vuex'
import _ from '@/common/utils/lodash'
import modules from './modules'

Vue.use(Vuex)

const store = new Vuex.Store({
  strict: process.env.NODE_ENV === 'development',

  state: {},

  modules,

  mutations: {
    test (state) {

    }
  },

  plugins: [

  ],

  actions: {

  },

  getters: {}
})

export default store
