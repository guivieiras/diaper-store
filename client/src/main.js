import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import store from './store'
import Notifications from 'vue-notification'

Vue.config.productionTip = false
Vue.use(Notifications)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
