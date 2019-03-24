<template>
  <v-container>
    <v-toolbar flat color="white">
      <v-toolbar-title>Diapers list</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click.stop="dialog = true" color="primary" dark class="mb-2">New diaper</v-btn>
      <v-btn @click.stop="buyDialog = true" color="primary" dark class="mb-2">Buy</v-btn>
    </v-toolbar>
    <v-data-table :headers="headers"  :items="diapers" :expand="expand" item-key="model">
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
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex xs12>
                <v-text-field v-model="editedItem.model" label="Model"></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-textarea auto-grow rows="1" v-model="editedItem.description" label="Description"></v-textarea>
              </v-flex>
              <v-flex xs12>
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
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close">Cancel</v-btn>
          <v-btn color="blue darken-1" flat @click="save">Save</v-btn>
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
            <v-layout wrap>
              <v-flex xs12>
                <v-autocomplete
                  v-model="buy.model"
                  item-text="model"
                  :items="diapers"
                  label="Model"
                ></v-autocomplete>
                <v-select
                  item-text="size"
                  v-model="buy.size"
                  :disabled="!buy.model"
                  :items="buyItems()"
                  label="Size"
                />

                <v-text-field
                  v-model="buy.quantity"
                  :disabled="!buy.size"
                  :rules="[ v => !!v || 'teste', v => v <= maxBuyQuantity() || 'oie']"
                  :suffix="'/' + maxBuyQuantity()"
                  label="Quantity"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="closeBuy">Cancel</v-btn>
          <v-btn color="blue darken-1" flat @click="buyDiaper">Buy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: "List",
  data: () => ({
    dialog: false,
    buyDialog: false,
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
    editedItem: {},
    defaultItem: {}
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.initialize();
  },

  methods: {
    buyItems() {
      if (this.buy.model) {
        let diaper = this.diapers.find(o => o.model == this.buy.model);
        return diaper.sizes;
      }
      return [];
    },
    maxBuyQuantity() {
      if (this.buy.model && this.buy.size) {
        let diaper = this.diapers.find(o => o.model == this.buy.model);
        let size = diaper.sizes.find(o => o.size == this.buy.size);
        return size.quantity;
      }
      return 0;
	 },
	 buyDiaper(){
		 if (this.buy.model && this.buy.size && this.buy.quantity){
			 let diaper = this.diapers.find(o => o.model == this.buy.model);
			 let size = diaper.sizes.find(o => o.size == this.buy.size);
			 size.quantity -= this.buy.quantity;
			 this.closeBuy();
		 }
	 },
    closeBuy() {
      this.buyDialog = false;
      setTimeout(() => {
        this.buy = {};
      }, 300);
    },
    models() {
      return this.diapers.map(o => o.model);
    },
    sizes() {
      if (buy.sizes) return item.sizes.map(o => o.size);
    },
    addSize(item) {
      item.quantity++;
    },
    removeSize(item) {
      if (item.quantity > 0) {
        item.quantity--;
      }
    },
    deleteSize(item) {
      const index = this.editedItem.sizes.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.editedItem.sizes.splice(index, 1);
    },

    asynceditItem(item) {
      this.editedIndex = this.diapers.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.sizes = JSON.parse(JSON.stringify(item.sizes));
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.diapers.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.diapers.splice(index, 1);
    },

    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },

    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.diapers[this.editedIndex], this.editedItem);
      } else {
        this.diapers.push(this.editedItem);
      }
      this.close();
    },
    initialize() {
      this.diapers = [
        {
          model: "Pampers",
          description: 159,
          sizes: [
            { size: "P", quantity: 6, sold: 10 },
            { size: "M", quantity: 6, sold: 10 },
            { size: "G", quantity: 6, sold: 10 }
          ]
        },
        {
          model: "Jhonsons baby",
          description: 159,
          sizes: [
{ size: "P", quantity: 6, sold: 10 },
            { size: "M", quantity: 6, sold: 10 },
            { size: "G", quantity: 6, sold: 10 }
          ]
        },
        {
          model: "Anjinho",
          description: 159,
          sizes: [
          { size: "P", quantity: 6, sold: 10 },
            { size: "M", quantity: 6, sold: 10 },
            { size: "G", quantity: 6, sold: 10 }
          ]
        },
        {
          model: "Turma da monica",
          description: 159,
          sizes: [
         { size: "P", quantity: 6, sold: 10 },
            { size: "M", quantity: 6, sold: 10 },
            { size: "G", quantity: 6, sold: 10 }
          ]
        },
        {
          model: "Huggies",
          description: 159,
          sizes: [
      { size: "P", quantity: 6, sold: 10 },
            { size: "M", quantity: 6, sold: 10 },
            { size: "G", quantity: 6, sold: 10 }
          ]
        },
        {
          model: "Cremer",
          description: 159,
          sizes: [
           { size: "P", quantity: 6, sold: 10 },
            { size: "M", quantity: 6, sold: 10 },
            { size: "G", quantity: 6, sold: 10 }
          ]
        }
      ];
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>