import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
		batata: true
	},
	mutations: {},
	actions: {
		showLoading({ state }) {
			state.batata = true;
		},
		hideLoading({ state }) {
			state.batata = false;
		},
		logResponse({state}, response){
			Vue.prototype.$notify({
				group: "foo",
				title: "Success!",
				text: response.data.message,
				type: response.data.status
			})
		},
		exceptionHandler({ state, dispatch }, { error }) {
			console.log(error);
			if (error.message == "Network Error") {
				dispatch("showAlert", {
					message: "Servidor está indisponível, tente novamente mais tarde",
					type: "error"
				});
				return true;
			}
			if (
				error.response &&
				error.response.data &&
				error.response.data.message
			) {
				dispatch("showAlert", {
					message: error.response.data.message,
					type: error.response.data.status
				});
				return true;
			}
			return false;
		}
	}
});
