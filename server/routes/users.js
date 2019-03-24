var express = require('express');
var router = express.Router();
var crud = require('../couchdb/crud');
var { DuplicatedException, CustomException } = require('../utils/exceptions')


router.post('/', async function (req, res, next) {
   try {
      let result = await crud.insert(req.body);
      res.send({ message: 'Diaper added', status: 'success', result: result })
   } catch (error) {
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: 'Error inserting the diaper', status: 'error' })
      }
   }
});

router.get('/:model', async function (req, res, next) {
   try {
      let result = await crud.find(req.params.model);
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

router.put('/', async function (req, res, next) {
   try {
      let obj = req.body;
      let result = await crud.update(obj);
      res.send({ message: 'Diaper updated', status: 'success', result: result })
   } catch (error) {
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: 'Error updating the diaper', status: 'error' })
      }
   }
});

router.get('/', async function (req, res, next) {
   try {
      res.send(await crud.listAll())
   } catch (error) {
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: 'Error listing the objects', status: 'error' })
      }
   }
});

//Hide
router.delete('/', async function (req, res, next) {
   try {
      await crud.delete(req.query.model);
      res.send({ message: 'Diaper deleted succesfully', status: 'success' });
   } catch (error) {
      if (!handleException(error, res)) {
         res.status(500);
         res.send({ message: error.message, status: 'error' });
      }
   }
});


router.get('/test/deleteAll', async function (req, res, next) {
   res.send(await crud.deleteAll())
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
