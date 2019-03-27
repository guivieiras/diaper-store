var express = require('express');
var router = express.Router();
var Sales = require('../db/sales');
var Diapers = require('../db/diapers');
var { DuplicatedException, CustomException } = require('../utils/exceptions')
var _ = require('lodash');

router.get('/', async function (req, res, next) {
	try {
		let result = await Sales.listAll();

		let diapers = _.groupBy(result, 'diaper');

		result = {}

		var allDiapers = await Diapers.listAll();

		for (var diaperId in diapers) {
			let diaper = allDiapers.find(o=> o._id == diaperId);

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

				if (!result[diaperId][sizeName]){
					result[diaperId][sizeName] = {}
				}
				result[diaperId][sizeName].quandoVaiAcabar48H = now;
			}
		}

		for (var diaperId in diapers) {
			let diaper = allDiapers.find(o=> o._id == diaperId);

			var sizes = _.groupBy(diapers[diaperId], 'size');
			for (var sizeName in sizes) {

				//ascending
				var sortedSizes = sizes[sizeName].sort((a,b) => a.timestamp - b.timestamp);
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

				if (!result[diaperId][sizeName]){
					result[diaperId][sizeName] = {}
				}
				result[diaperId][sizeName].predictionSinceFirtsSale = now;
			}
		}

		res.send(result)
	} catch (error) {
		if (!handleException(error, res)) {
			res.status(500);
			res.send({ message: 'Error returning the datagram', status: 'error' })
		}
	}
});



function handleException(error, res) {
	console.log(error)

	if (error instanceof CustomException) {
		res.status(error.code)
		res.send({ message: error.message, status: error.status })
		return true;
	}
	return false;
}

module.exports = router;

