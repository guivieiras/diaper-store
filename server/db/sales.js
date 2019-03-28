const nano = require('nano')(process.env.DB_URL);
const Sales = nano.db.use('sales');
var Diapers = require('../db/diapers');
var _ = require('lodash');

var { DuplicatedException, NotFoundException, BadRequestException } = require('../utils/exceptions')

var cls = {};

cls.listAll = async function () {
	var list = await Sales.list({ include_docs: true })
	return list.rows.map(o => o.doc);
}

cls.predictions = async function () {
	let result = await cls.listAll();

	let diapers = _.groupBy(result, 'diaper');

	result = {}

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
			var seconds = microSecondsDiff / (1000);
			var minutes = microSecondsDiff / (1000 * 60);
			var hours = microSecondsDiff / (1000 * 60 * 60);
			var days = microSecondsDiff / (1000 * 60 * 60 * 24);

			var size = diaper.sizes.find(o => o.size == sizeName);

			var myTimeSpan = size.quantity / (sales / minutes) * 60 * 1000; // 5 minutes in milliseconds
			now.setTime(now.getTime() + myTimeSpan);

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
			var seconds = microSecondsDiff / (1000);
			var minutes = microSecondsDiff / (1000 * 60);
			var hours = microSecondsDiff / (1000 * 60 * 60);
			var days = microSecondsDiff / (1000 * 60 * 60 * 24);

			var size = diaper.sizes.find(o => o.size == sizeName);

			var myTimeSpan = size.quantity / (sales / minutes) * 60 * 1000; // 5 minutes in milliseconds
			now.setTime(now.getTime() + myTimeSpan);

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


module.exports = cls