const nano = require('nano')(process.env.DB_URL);
const Sales = nano.db.use('sales');
var Diapers = require('../db/diapers');
var _ = require('lodash');

var cls = {};

cls.listAll = async function () {
	var list = await Sales.list({ include_docs: true })
	return list.rows.map(o => o.doc);
}

cls.predictions = async function (model, sizeName) {
	let allSales = await cls.listAll();

	let diapers = _.groupBy(allSales, 'diaper');

	var result = {}

	var diaper = await Diapers.find(model);

	var diaperId = diaper._id;

	var sizes = _.groupBy(diapers[diaperId], 'size');

	{
		var now = new Date();

		var begin = new Date();
		begin.setHours(now.getHours() - 12);

		var salesAfterBegin = sizes[sizeName].filter(x => new Date(x.timestamp) > begin)
		var sales = salesAfterBegin.reduce((a, b) => a + b.quantity, 0);

		var microSecondsDiff = Math.abs(now.getTime() - begin.getTime());
		var minutes = microSecondsDiff / (1000 * 60);

		var size = diaper.sizes.find(o => o.size == sizeName);

		if (size) {
			var timeSpan = size.quantity / (sales / minutes) * 60 * 1000;
			var prediction = new Date();
			prediction.setTime(now.getTime() + timeSpan);

			result.prediction24h = calculateTimeSinceNow(prediction);
		}
	}

	{		
		//ascending
		var sortedSizes = sizes[sizeName].sort((a, b) => a.timestamp - b.timestamp);
		var now = new Date();
		var begin = new Date(sortedSizes[0].timestamp);

		var sales = sortedSizes.reduce((a, b) => a + b.quantity, 0);

		var microSecondsDiff = Math.abs(now.getTime() - begin.getTime());
		var minutes = microSecondsDiff / (1000 * 60);

		var size = diaper.sizes.find(o => o.size == sizeName);

		if (size) {
			var timeSpan = size.quantity / (sales / minutes) * 60 * 1000;
			var prediction = new Date();
			prediction.setTime(now.getTime() + timeSpan);

			if (sortedSizes.length > 1) {
				result.sinceFirstBuyPrediction = calculateTimeSinceNow(prediction);
			}
		}

	}
	return result;
}

function calculateTimeSinceNow(dateFuture) {
	var dateNow = new Date();

	if (!dateFuture || dateFuture <= dateNow)
		return 'Sold out!';

	var seconds = Math.floor((dateFuture - (dateNow)) / 1000);
	var minutes = Math.floor(seconds / 60);
	var hours = Math.floor(minutes / 60);
	var days = Math.floor(hours / 24);

	hours = hours - (days * 24);
	minutes = minutes - (days * 24 * 60) - (hours * 60);
	seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

	var x = []
	if (days > 0) {
		x.push(`${days} day` + (days > 1 ? 's' : ''))
	}
	if (hours > 0) {
		x.push(`${hours} hour` + (hours > 1 ? 's' : ''))
	}
	if (minutes > 0 && !days) {
		x.push(`${minutes} minute` + (minutes > 1 ? 's' : ''))
	}
	if (seconds > 0 && !days && !hours) {
		x.push(`${seconds} second` + (seconds > 1 ? 's' : ''))
	}

	x = x.reduce((acc, cur, indx, arr) => {
		if (indx == arr.length - 1)
			return acc + ' and ' + cur;
		if (indx == arr.length - 2)
			return acc + ', ' + cur;
	});

	return `This item will sold out in ${x}.`
}

cls.insert = Sales.insert;

cls.deleteSaleHistory = async function () {
	var list = await cls.listAll()

	for (doc of list) {
		Sales.destroy(doc._id, doc._rev);
	}
}

module.exports = cls