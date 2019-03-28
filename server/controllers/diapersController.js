var express = require('express');
var router = express.Router();
var Diapers = require('../db/diapers');
var Sales = require('../db/sales');
var { DuplicatedException, CustomException } = require('../utils/exceptions')

//Create new diaper
router.post('/', async function (req, res, next) {
   try {
      let result = await Diapers.insert(req.body);
      res.send({ message: 'Diaper added', status: 'success', result: result })
   } catch (error) {
      if (!handleException(error, res)) {
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
      if (!handleException(error, res)) {
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
      if (!handleException(error, res)) {
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
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: 'Error listing the objects', status: 'error' })
      }
   }
});

//Buy diaper
router.post('/buy', async function (req, res, next) {
   try {
		let result = await Diapers.buy(req.body);
		let predictions = await Sales.predictions();
		predictions = predictions[result.id][req.body.size];

      res.send({ message: 'Diaper bought', status: 'success', result, predictions })
   } catch (error) {
      if (!handleException(error, res)) {
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
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});

//Test only methods
router.get('/test/deleteAll', async function (req, res, next) {
	try {
      await Diapers.deleteAll()
      res.send({ message: 'Diapers deleted', status: 'success' });
   } catch (error) {
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});

router.get('/test/deleteSalesHistory', async function (req, res, next) {
	try {
      await Diapers.deleteSales()
      res.send({ message: 'Sales deleted', status: 'success' });
   } catch (error) {
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
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
