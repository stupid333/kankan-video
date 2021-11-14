import Vue from 'vue'
import uView from "uview-ui";
import App from './App'
import store from './store'
import './common/utils/ajax'

App.mpType = 'app'

Vue.config.productionTip = false
Vue.use(uView)

const app = new Vue({
  store,
  ...App
})
app.$mount()
