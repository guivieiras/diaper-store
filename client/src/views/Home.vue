<template>
  <v-container>
    <List></List>
  </v-container>
</template>

<script>
// @ is an alias to /src
import List from "@/components/List.vue";

export default {
  name: "home",
  
  components: {
    List
  },
};
</script>
