var express = require('express');
var router = express.Router();
var Diapers = require('../db/diapers');
var Sales = require('../db/sales');
var exceptionHandler = require('../utils/exceptionHandler')

//Create new diaper
router.post('/', async function (req, res, next) {
   try {
      let result = await Diapers.insert(req.body);
      res.send({ message: 'Diaper added', status: 'success', result: result })
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: 'Error inserting the diaper', status: 'error' })
      }
   }
});

//Get diaper
router.get('/:model', async function (req, res, next) {
   try {
      let result = await Diapers.find(req.params.model);
      if (result) {
         res.send(result)
      } else {
         res.status(404)
         res.send({ message: 'Resource not found', status: 'warn' })
      }

   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: 'Error finding the diaper', status: 'error' })
      }
   }
});

//Update diaper
router.put('/', async function (req, res, next) {
   try {
      let obj = req.body;
      let result = await Diapers.update(obj);
      res.send({ message: 'Diaper updated', status: 'success', result: result })
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: 'Error updating the diaper', status: 'error' })
      }
   }
});

//Get all diapers
router.get('/', async function (req, res, next) {
   try {
      res.send(await Diapers.listVisible())
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: 'Error listing the objects', status: 'error' })
      }
   }
});

//Buy diaper
router.post('/buy', async function (req, res, next) {
   try {
		let result = await Diapers.buy(req.body);
		
		await Sales.insert({diaper: result.id, size: req.body.size, timestamp: new Date().getTime(), quantity: req.body.quantity})
		
		let predictions = await Sales.predictions(req.body.model, req.body.size);

      res.send({ message: 'Diaper bought', status: 'success', result, predictions })
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: 'Error buying the diaper', status: 'error' })
      }
   }
});

//Hide diaper
router.delete('/:model', async function (req, res, next) {
   try {
      await Diapers.delete(req.params.model);
      res.send({ message: 'Diaper deleted succesfully', status: 'success' });
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});

module.exports = router;