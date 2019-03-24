<template>
  <v-app>
	  <notifications group="foo" />

    <Home></Home>
  </v-app>
</template>
<script>
import Home from "./views/Home";
import { mapState, mapActions } from 'vuex';
export default {
  components: {
    Home,
    
  },
  computed: mapState(['batata']),
  methods: mapActions(['hideLoading'])
};
</script>

<style>

#loading{
   position: absolute;
   width: 100%;
   height: 100%;
   background: #00000060;
   z-index: 100;


}

#ld{
   margin: auto;
   width: 100% !important;
   margin-top: 200px;
}
</style>
