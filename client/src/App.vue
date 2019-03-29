<template>
	<v-app>
		<v-toolbar color="blue darken-4" dark app fixed>
			<v-btn icon large>
				<v-avatar size="32px" tile>
					<img src="@/assets/diaper1.png" alt="Vuetify">
				</v-avatar>
			</v-btn>
			<v-toolbar-title>
				<span class="hidden-sm-and-down">Look After</span>
			</v-toolbar-title>
		</v-toolbar>
		<v-content>
			<v-container >
				<Home></Home>
			</v-container>
		</v-content>
	</v-app>
</template>
<script>
import Home from "./views/Home.vue"
import { mapState, mapActions } from "vuex"
export default {
	components: {
		Home
	},
	computed: mapState(["batata"]),
	methods: mapActions(["hideLoading"])
}
</script>

<style scoped>
	.v-content{
		background: white
	}
</style>
