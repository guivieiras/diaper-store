<template>
	<!-- <v-app>
	  <v-content>
	  <notifications group="foo" />

			<Home></Home>
	 </v-content>
	</v-app>-->
	<v-app id="inspire">
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
			<v-container>
				<v-layout>
					<Home></Home>
				</v-layout>
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

<style>
#loading {
	position: absolute;
	width: 100%;
	height: 100%;
	background: #00000060;
	z-index: 100;
}

#ld {
	margin: auto;
	width: 100% !important;
	margin-top: 200px;
}
</style>
