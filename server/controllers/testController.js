var express = require('express');
var router = express.Router();
var Diapers = require('../db/diapers');
var Sales = require('../db/sales');

const nano = require('nano')(process.env.DB_URL);
var exceptionHandler = require('../utils/exceptionHandler')

// Create databases
router.get('/createDatabases', async function (req, res, next) {
	try {
		await nano.db.create('sales')
		await nano.db.create('diapers');

      res.send({ message: 'Databases created', status: 'success' });
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});

//Delete all diapers
router.get('/deleteAll', async function (req, res, next) {
	try {
      await Diapers.deleteAll()
      res.send({ message: 'Diapers deleted', status: 'success' });
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});

//Delete sale history
router.get('/deleteSaleHistory', async function (req, res, next) {
	try {
      await Sales.deleteSaleHistory()
      res.send({ message: 'Sales deleted', status: 'success' });
   } catch (error) {
      if (!exceptionHandler(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});
