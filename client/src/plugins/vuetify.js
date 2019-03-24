import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import 'vuetify/src/stylus/app.styl'
import en from 'vuetify/es5/locale/en'

Vue.use(Vuetify, {
  options: {
    customProperties: true
  },
  iconfont: 'md',
  lang: {
    locales: { en },
    current: 'en'
  },
})
