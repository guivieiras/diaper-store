var express = require('express');
var router = express.Router();
var crud = require('../couchdb/crud');
var { DuplicatedException, CustomException } = require('../utils/exceptions')
var _ = require('lodash');

router.get('/', async function (req, res, next) {
	try {
		let result = await crud.buyDatagram();

		let grouped = _.groupBy(result, 'diaper');

		var t = {}
		// console.log(grouped)

		for (var group in grouped) {
			if (grouped[group].length < 2) {
				t[group] = "not enought data";
			} else {
				let diaper = await crud.findById(group);

				var grusp = _.groupBy(grouped[group], 'size');
				//a cada tamanho em cada fralda
				for (var tamanho in grusp)
				{
					//quantidade de compras do tamanho especifico da fralda					
					var compras = grusp[tamanho].reduce((a,b) => a + b.quantity, 0);
					console.log(`Compras: ${compras}`)				

					
					var seconds = Math.abs(new Date().getTime() - (new Date().getTime() - 2000000) ) / 1000 / 60;

					var size = diaper.sizes.find(o=> o.size == tamanho);
					var quantidadeTotal = size.quantity;

					console.log({quantidadeTotal, compras, seconds})
					console.log(compras/seconds)

					var agora = new Date()
					var y = (quantidadeTotal/(compras/seconds)); //quantidade de minutos para esgotar
					console.log (y);

					var myTimeSpan = y*60*1000; // 5 minutes in milliseconds
					agora.setTime(agora.getTime() + myTimeSpan);
					
					


					

					console.log(agora)
					console.log('\n')
				}
				continue;

				console.log(diaper)
				console.log('\n')
				for (var s of grouped[group]){
					console.log(s)
					var size = diaper.sizes.find(o=> o.size == s.size);
					
					var inicio = 1553544622704;
					var compras = grouped[group].reduce((a,b)=> a.quantity + b.quantity)
					var agora = new Date().getTime();
					size.quantity = 100;
					var x = agora + (size.quantity/(compras/agora-inicio));

					console.log('\n')
					console.log(compras)
					console.log(size.quantity)
					console.log(x);
					console.log('inicio: '+new Date(inicio));
					console.log('quando vai acabar: ' + new Date(x));
				}
				
			}
		}

		res.send(t)
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
