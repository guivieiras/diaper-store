const nano = require('nano')(process.env.DB_URL);
const Sales = nano.db.use('sales');
var Diapers = require('../db/diapers');
var _ = require('lodash');

var cls = {};

cls.listAll = async function () {
	var list = await Sales.list({ include_docs: true })
	return list.rows.map(o => o.doc);
}

cls.predictions = async function () {
	let allSales = await cls.listAll();

	let diapers = _.groupBy(allSales, 'diaper');

	var result = {}

	var allDiapers = await Diapers.listAll();

	for (var diaperId in diapers) {
		let diaper = allDiapers.find(o => o._id == diaperId);

		var sizes = _.groupBy(diapers[diaperId], 'size');
		result[diaperId] = { model: diaper.model }

		for (var sizeName in sizes) {
			var now = new Date();

			var begin = new Date();
			begin.setHours(now.getHours() - 48);

			var salesAfterBegin = sizes[sizeName].filter(x => new Date(x.timestamp) > begin)
			var sales = salesAfterBegin.reduce((a, b) => a + b.quantity, 0);

			var microSecondsDiff = Math.abs(now.getTime() - begin.getTime());
			var minutes = microSecondsDiff / (1000 * 60);

			var size = diaper.sizes.find(o => o.size == sizeName);

			var timeSpan = size.quantity / (sales / minutes) * 60 * 1000;
			now.setTime(now.getTime() + timeSpan);

			if (!result[diaperId][sizeName]) {
				result[diaperId][sizeName] = {}
			}
			result[diaperId][sizeName].prediction24h = now;
		}
	}

	for (var diaperId in diapers) {
		let diaper = allDiapers.find(o => o._id == diaperId);

		var sizes = _.groupBy(diapers[diaperId], 'size');
		for (var sizeName in sizes) {

			//ascending
			var sortedSizes = sizes[sizeName].sort((a, b) => a.timestamp - b.timestamp);
			var now = new Date();
			var begin = new Date(sortedSizes[0].timestamp);

			var sales = sortedSizes.reduce((a, b) => a + b.quantity, 0);

			var microSecondsDiff = Math.abs(now.getTime() - begin.getTime());
			var minutes = microSecondsDiff / (1000 * 60);

			var size = diaper.sizes.find(o => o.size == sizeName);

			var timeSpan = size.quantity / (sales / minutes) * 60 * 1000;
			now.setTime(now.getTime() + timeSpan);

			if (!result[diaperId][sizeName]) {
				result[diaperId][sizeName] = {}
			}
			if (sortedSizes.length > 1){
				result[diaperId][sizeName].sinceFirstBuyPrediction = now;
			}
		}
	}
	return result;
}

cls.insert = Sales.insert;

cls.deleteSaleHistory = async function(){
	var list = await cls.list({ include_docs: true })

	for (doc of list.rows.map(o => o.doc)) {
		Sales.destroy(doc._id, doc._rev);
	}
}

module.exports = cls