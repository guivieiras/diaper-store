<template>
	<div>
		<v-toolbar flat color="white">
			<v-toolbar-title>Diapers list</v-toolbar-title>
		</v-toolbar>
		<v-toolbar flat color="white">
			<v-layout justify-space-between row>
				<v-btn @click.stop="dialog = true" color="primary" class="mb-2">New diaper</v-btn>
				<v-btn @click.stop="buyDialog = true" :disabled="diapers.length == 0" column color="primary" class="mb-2">Buy</v-btn>
				<v-btn @click.stop="deleteDiapers" :disabled="diapers.length == 0" column color="error" class="mb-2">Delete diapers</v-btn>
				<v-btn
					@click.stop="deleteSaleHistory"
					column
					color="error"
					class="mb-2"
				>Delete sales history</v-btn>
				<v-btn @click.stop="createDbs" :disabled="diapers.length > 0" column color="success" class="mb-2">Create dbs</v-btn>
			</v-layout>
		</v-toolbar>
		<v-toolbar flat color="white">
			<v-switch
				hide-details
				v-model="localValidation"
				label="Local Validation"
				class="mb-2 shrink mr-4"
			></v-switch>
			<v-spacer></v-spacer>

			<v-radio-group row v-model="predictionType" class="shrink" hide-details>
				<v-radio label="Since first buy prediction" value="firstBuy"></v-radio>
				<v-radio label="24h prediction" value="24h"></v-radio>
			</v-radio-group>
		</v-toolbar>
		<v-data-table
			:headers="headers"
			:loading="loading"
			:items="diapers"
			:expand="expand"
			item-key="model"
		>
			<template v-slot:items="props">
				<tr>
					<td @click="props.expanded = !props.expanded" class="text-xs-left">{{ props.item.model }}</td>
					<td class="text-xs-left">{{ props.item.description }}</td>
					<td class="justify-center layout px-0">
						<v-icon small class="mr-2" @click="editItem(props.item)">edit</v-icon>
						<v-icon small @click="deleteItem(props.item)">delete</v-icon>
					</td>
				</tr>
			</template>
			<template v-slot:expand="props">
				<v-data-table
					:headers="sizesHeaders"
					:hide-actions="true"
					:items="props.item.sizes"
					item-key="size"
					class="overflow-hidden"
				>
					<template v-slot:items="props">
						<tr>
							<td class="text-xs-left">{{ props.item.size }}</td>
							<td class="text-xs-center">{{ props.item.quantity }}</td>
							<td class="text-xs-center">{{ props.item.sold }}</td>
						</tr>
					</template>
				</v-data-table>
			</template>
		</v-data-table>

		<v-dialog v-model="dialog" max-width="500px">
			<v-card>
				<v-card-title>
					<span class="headline">{{ formTitle }}</span>
				</v-card-title>

				<v-card-text>
					<v-container>
						<v-form ref="diaperForm">
							<v-text-field :rules="[v => !!v || 'Insert model']" v-model="editedItem.model" label="Model"></v-text-field>
							<v-textarea
								:rules="[v => !!v || 'Insert description']"
								auto-grow
								rows="1"
								v-model="editedItem.description"
								label="Description"
							></v-textarea>
							<v-layout row>
								<v-text-field v-model="tempSize" label="Size"></v-text-field>
								<v-text-field class="mx-3" v-model="tempQuantity" mask="####" label="Quantity"></v-text-field>
								<v-btn color="blue darken-1" flat @click="createSize">Add</v-btn>
							</v-layout>
							<v-data-table
								:headers="sizesHeadersEditing"
								:items="editedItem.sizes"
								item-key="size"
								:hide-actions="true"
							>
								<template v-slot:items="props">
									<tr>
										<td class="text-xs-left">{{ props.item.size }}</td>
										<td class="text-xs-center">{{ props.item.quantity }}</td>
										<td class="justify-center layout px-0">
											<v-icon small class="mr-2" @click="removeSize(props.item)">remove</v-icon>
											<v-icon small class="mr-2" @click="addSize(props.item)">add</v-icon>
											<v-icon small @click="deleteSize(props.item)">delete</v-icon>
										</td>
									</tr>
								</template>
							</v-data-table>
						</v-form>
					</v-container>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
					<v-btn color="blue darken-1" flat :loading="createLoading" @click="save">Save</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-dialog v-model="buyDialog" max-width="500px">
			<v-card>
				<v-card-title>
					<span class="headline">Buy diapers</span>
				</v-card-title>

				<v-card-text>
					<v-container grid-list-md>
						<v-form ref="buyForm">
							<v-autocomplete
								v-model="buy.model"
								:rules="[v => !!v || 'Select a model']"
								item-text="model"
								:items="diapers"
								label="Model"
							></v-autocomplete>
							<v-select
								item-text="size"
								v-model="buy.size"
								:rules="[v => !!v || 'Select a size']"
								:disabled="!buy.model"
								:items="buyItems()"
								label="Size"
							/>

							<v-text-field
								v-model="buy.quantity"
								:disabled="!buy.size"
								:rules="[ v => !!v && v > 0 || 'Insert a valid value ', v => v <= maxBuyQuantity() || 'Quantity exceeds store count']"
								:suffix="'/' + maxBuyQuantity()"
								label="Quantity"
							></v-text-field>
						</v-form>
					</v-container>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="blue darken-1" flat @click="closeBuy">Cancel</v-btn>
					<v-btn color="blue darken-1" :loading="buyLoading" flat @click="buyDiaper">Buy</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import axios from "axios"
import { mapState, mapActions } from "vuex"

export default {
	name: "List",
	data: () => ({
		localValidation: true,
		predictionType: "firstBuy",
		apiUrl: process.env.VUE_APP_API_URL,
		dialog: false,
		loading: true,
		buyDialog: false,
		buyLoading: false,
		createLoading: false,
		expand: false,
		headers: [
			{ text: "Model", align: "left", value: "model" },
			{ text: "Description", value: "description" },
			{ text: "Actions", value: "model", align: "center", sortable: false }
		],
		buy: {},
		sizesHeaders: [
			{ text: "Size", align: "left", value: "size" },
			{ text: "Quantity", align: "center", value: "quantity" },
			{ text: "Sold", align: "center", value: "sold" }
		],
		sizesHeadersEditing: [
			{ text: "Size", align: "left", value: "size" },
			{ text: "Quantity", align: "center", value: "quantity" },
			{ text: "Actions", align: "center", value: "size", sortable: false }
		],
		diapers: [],
		editedIndex: -1,
		editedItem: { sizes: [] },
		defaultItem: { sizes: [] },
		tempSize: "",
		tempQuantity: ""
	}),
	computed: {
		formTitle() {
			return this.editedIndex === -1 ? "New Diaper" : "Edit Diaper"
		}
	},

	watch: {
		dialog(val) {
			val || this.close()
		},
		buyDialog(val) {
			val || this.closeBuy()
		}
	},

	created() {
		this.initialize()
		console.log(process.env)
	},

	methods: {
		buyItems() {
			if (this.buy.model) {
				let diaper = this.diapers.find(o => o.model == this.buy.model)
				return diaper.sizes
			}
			return []
		},
		maxBuyQuantity() {
			if (this.buy.model && this.buy.size) {
				let diaper = this.diapers.find(o => o.model == this.buy.model)
				let size = diaper.sizes.find(o => o.size == this.buy.size)
				return size.quantity
			}
			return 0
		},
		async createSize() {
			if (this.tempSize && this.tempQuantity) {
				this.editedItem.sizes.push({
					size: this.tempSize,
					quantity: this.tempQuantity
				})
				this.tempSize = null
				this.tempQuantity = null
			}
		},
		async buyDiaper() {
			if ((this.$refs.buyForm.validate() && this.localValidation) || !this.localValidation) {
				try {
					this.buy.quantity = parseInt(this.buy.quantity)

					this.buyLoading = true
					let response = await axios.post(`${this.apiUrl}/diapers/buy`, this.buy)
					this.logResponse(response)
					let diaper = this.diapers.find(o => o.model == this.buy.model)
					let size = diaper.sizes.find(o => o.size == this.buy.size)
					size.quantity -= this.buy.quantity
					size.sold += this.buy.quantity

					if (this.predictionType == "24h") {
						this.alert(response.data.predictions.prediction24h)
					} else if (response.data.predictions.sinceFirstBuyPrediction) {
						this.alert(response.data.predictions.sinceFirstBuyPrediction)
					}

					diaper._id = response.data.result.id
					diaper._rev = response.data.result.rev
					this.closeBuy()
				} catch (error) {
					console.log(error)
					this.logResponse(error.response)
				}
				this.buyLoading = false
			}
		},
		async closeBuy() {
			this.buyDialog = false
			setTimeout(() => {
				this.buy = {}
				this.$refs.buyForm.reset()
			}, 300)
		},
		models() {
			return this.diapers.map(o => o.model)
		},
		sizes() {
			if (buy.sizes) return item.sizes.map(o => o.size)
		},
		async addSize(item) {
			item.quantity++
		},
		async removeSize(item) {
			if (item.quantity > 0) {
				item.quantity--
			}
		},
		async deleteSize(item) {
			const index = this.editedItem.sizes.indexOf(item)
			confirm("Are you sure you want to delete this item?") && this.editedItem.sizes.splice(index, 1)
		},

		async editItem(item) {
			this.editedIndex = this.diapers.indexOf(item)
			this.editedItem = Object.assign({}, item)
			this.editedItem.sizes = JSON.parse(JSON.stringify(item.sizes))
			this.dialog = true
		},

		async deleteItem(item) {
			const index = this.diapers.indexOf(item)
			if (confirm("Are you sure you want to delete this item?")) {
				try {
					let result = await axios.delete(`${this.apiUrl}/diapers/${item.model}`)
					this.diapers.splice(index, 1)
				} catch (error) {}
			}
		},

		async close() {
			this.dialog = false
			setTimeout(() => {
				this.editedItem = Object.assign({}, this.defaultItem)
				this.editedIndex = -1
				this.$refs.diaperForm.reset()
			}, 300)
		},

		async save() {
			if ((this.$refs.diaperForm.validate() && this.localValidation) || !this.localValidation) {
				try {
					this.createLoading = true
					if (this.editedIndex > -1) {
						let response = await axios.put(`${this.apiUrl}/diapers`, this.editedItem)
						this.logResponse(response)
						this.editedItem._id = response.data.result.id
						this.editedItem._rev = response.data.result.rev
						Object.assign(this.diapers[this.editedIndex], this.editedItem)
					} else {
						let response = await axios.post(`${this.apiUrl}/diapers`, this.editedItem)
						this.logResponse(response)
						this.editedItem._id = response.data.result.id
						this.editedItem._rev = response.data.result.rev
						this.diapers.push(this.editedItem)
					}
					this.close()
				} catch (error) {
					this.logResponse(error.response)
				}
				this.createLoading = false
			}
		},

		async deleteDiapers() {
			try {
				let response = await axios.get(`${this.apiUrl}/test/deleteDiapers`)
				this.logResponse(response)
				this.diapers = []
			} catch (error) {
				this.logResponse(error.response)
			}
		},
		async deleteSaleHistory() {
			try {
				let response = await axios.get(`${this.apiUrl}/test/deleteSaleHistory`)
				this.logResponse(response)
			} catch (error) {
				this.logResponse(error.response)
			}
		},

		...mapActions(["showLoading", "hideLoading", "logResponse", "alert"]),
		async initialize() {
			this.loading = true
			let ab = await axios.get(`${this.apiUrl}/diapers`)
			this.diapers = ab.data

			this.loading = false
		},
		async createDbs() {
			let response = await axios.get(`${this.apiUrl}/test/createDatabases`)

			let diapers = [
				{
					model: "Pampers",
					description: 'Soft and cheap diapers',
					sizes: [
						{ size: "S", quantity: 6, sold: 10 },
						{ size: "M", quantity: 6, sold: 10 },
						{ size: "B", quantity: 6, sold: 10 }
					]
				},
				{
					model: "Jhonsons baby",
					description: 'More confort to your baby!',
					sizes: [
						{ size: "S", quantity: 6, sold: 10 },
						{ size: "M", quantity: 6, sold: 10 },
						{ size: "B", quantity: 6, sold: 10 }
					]
				},
				{
					model: "Anjinho",
					description: 'Description',
					sizes: [
						{ size: "S", quantity: 6, sold: 10 },
						{ size: "M", quantity: 6, sold: 10 },
						{ size: "B", quantity: 6, sold: 10 }
					]
				},
				{
					model: "Turma da monica",
					description: "I'm out of creativity",
					sizes: [
						{ size: "S", quantity: 6, sold: 10 },
						{ size: "M", quantity: 6, sold: 10 },
						{ size: "B", quantity: 6, sold: 10 }
					]
				},
				{
					model: "Huggies",
					description: 'Description',
					sizes: [
						{ size: "S", quantity: 6, sold: 10 },
						{ size: "M", quantity: 6, sold: 10 },
						{ size: "B", quantity: 6, sold: 10 }
					]
				},
				{
					model: "Cremer",
					description: "Best diapers in the world",
					sizes: [
						{ size: "S", quantity: 6, sold: 10 },
						{ size: "M", quantity: 6, sold: 10 },
						{ size: "B", quantity: 6, sold: 10 }
					]
				}
			]
			this.loading = true

			for (let doc of diapers) {
				await axios.post(`${this.apiUrl}/diapers`, doc)
			}
			let ab = await axios.get(`${this.apiUrl}/diapers`)
			this.diapers = ab.data

			this.loading = false
		}
	}
}
</script>
<style scoped>
</style>