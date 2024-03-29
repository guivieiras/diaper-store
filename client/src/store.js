import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
	state: {
	},
	mutations: {},
	actions: {
		alert({state}, message, status){
			Vue.prototype.$notify({
				group: "foo",
				text: message,
				type: status,
				duration: 10000
			})
		},
		logResponse({state}, response){
			var title;
			switch (response.data.status){
				case 'success':
					title = 'Success!'
					break;
				case 'warn':
					title = 'Warning!'
					break;
				case 'error':
					title = 'Error!'
					break;
				default:
					title = 'Info';
					break;
			}
			Vue.prototype.$notify({
				group: "foo",
				text: response.data.message,
				type: response.data.status,
				title
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
