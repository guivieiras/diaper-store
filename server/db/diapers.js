const nano = require('nano')(process.env.DB_URL);
const Diapers = nano.db.use('diapers');
var { DuplicatedException, NotFoundException, BadRequestException } = require('../utils/exceptions')

var cls = {};

cls.insert = async function (obj) {
	delete obj._id;
	delete obj._rev;
	cls.validate(obj);
	if (await cls.find(obj.model)) {
		throw new DuplicatedException(`Document with model '${obj.model}' already exists, this is a unique field`);
	}
	return await Diapers.insert(obj);
}

cls.validate = function (obj) {
	if (!obj.model) {
		throw new BadRequestException('Document does not have the \'model\' attribute');
	}
	if (!obj.description) {
		throw new BadRequestException('Document does not have the \'description\' attribute');
	}
	if (obj.sizes) {
		for (var size of obj.sizes) {
			if (!size.size){
				throw new BadRequestException('Size name cannot be empty');
			}
			if (obj.sizes.filter(o=> o.size == size.size).length > 1){
				throw new BadRequestException('Size name must be unique');
			}
			if (size.quantity == null || size.quantity < 0){
				throw new BadRequestException('Document has sizes that have negative quantity');
			}
		}
	}
}

cls.findById = async function (id) {
	return await Diapers.get(id);
}

cls.update = async function (obj) {
	if (obj._id == null || obj._rev == null) {
		throw new Error('Document does not have id or rev');
	}
	cls.validate(obj);
	return await Diapers.insert(obj);
}

cls.listAll = async function () {
	var list = await Diapers.list({ include_docs: true })
	return list.rows.map(o => o.doc);
}

cls.listVisible = async function () {
	var list = await Diapers.list({ include_docs: true })
	return list.rows.map(o => o.doc).filter(o => !o.hidden);
}

cls.find = async function (model) {
	var list = await cls.listVisible();
	return list.find(o => o.model == model && !o.hidden);
}

cls.deleteAll = async function () {
	var list = await cls.listAll();

	for (doc of list) {
		await cls.deleteDoc(doc);
	}
}

cls.deleteDoc = async function (doc) {
	return await Diapers.destroy(doc._id, doc._rev);
}

cls.delete = async function (model) {
	var item = await cls.find(model);

	if (!item || item.hidden)
		throw new NotFoundException('Diaper not found')

	item.hidden = true;

	return await cls.update(item);
}

cls.buy = async function (obj) {
	let document = await cls.find(obj.model)
	let size = document.sizes.find(o => o.size == obj.size)
	if (obj.quantity <= 0){
		throw new BadRequestException("Quantity can't be negative or 0")
	}
	if (size.quantity - obj.quantity < 0){
		throw new BadRequestException("Sold out")
	}
	size.quantity -= obj.quantity;
	size.sold += obj.quantity;
	return await cls.update(document)
}

module.exports = cls