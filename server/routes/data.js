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
					var agora = new Date();
					var umDiaAtras = new Date();
					umDiaAtras.setHours(agora.getHours() - 48);
					umDiaAtras = new Date(1553548124735);

					var uteis = grusp[tamanho].filter(x=> new Date(x.timestamp) > umDiaAtras)		
					var compras = grusp[tamanho].reduce((a,b) => a + b.quantity, 0);
					console.log({compras, grup: grusp[tamanho], filtered: uteis })				

					
					var microSecondsDiff = Math.abs(agora.getTime() - umDiaAtras.getTime());
					var seconds =  microSecondsDiff / (1000);
					var minutes =  microSecondsDiff / (1000 * 60);
					var hours =  microSecondsDiff / (1000 * 60 * 60);
					var days =  microSecondsDiff / (1000 * 60 * 60 * 24);

					var size = diaper.sizes.find(o=> o.size == tamanho);
					var quantidadeTotal = size.quantity;


					var x = {
						quantidadeTotal, 
						compras, 
						seconds, 
						minutes, 
						hours, 
						days,
						'compras/seconds': compras/seconds,
						'compras/minutes': compras/minutes,
						'compras/hours': compras/hours,
						'compras/days': compras/days,
						'quantidadeTotal/(compras/minutes)': quantidadeTotal/(compras/minutes),
						'quantidadeTotal/(compras/seconds)': quantidadeTotal/(compras/seconds),
						'quantidadeTotal/(compras/hours)': quantidadeTotal/(compras/hours)
					}
					var myTimeSpan = x['quantidadeTotal/(compras/minutes)'] * 60 * 1000; // 5 minutes in milliseconds
					agora.setTime(agora.getTime() + myTimeSpan);

					var oie = new Date();
					var s = x['quantidadeTotal/(compras/seconds)'] * 1000;
					oie.setTime(oie.getTime() + s);

					x.quandoVaiAcabar = agora;
					x.quandoVaiAcabarIgual = oie;
					console.log(x);
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

