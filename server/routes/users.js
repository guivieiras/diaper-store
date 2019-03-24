var express = require('express');
var router = express.Router();
const nano = require('nano')('https://couchdb-fa9597.smileupps.com');
const alice = nano.db.use('teste');

router.get('/a', function(req, res, next) {
  alice.get('72').then(body => {
    body.nome = 'Mudado';
    alice.insert(body).then(result => {
      console.log(result);
    })
    res.send('mudando')
  })
});
router.get('/b', function(req, res, next) {
  var randomId = Math.floor((Math.random() * 100) + 1);
  alice.insert({ nome: 'Douglas'}).then(result => {
    console.log(result);
  })
  res.send('adicionando')
});

router.get('/c', function(req, res, next) {
  alice.list({include_docs: true}).then(body => {
    body.rows.forEach((doc) => {
      console.log(doc.doc);
    });
  })
  res.send('listando')

});

router.get('/d', function(req, res, next) {
  alice.list({include_docs: true}).then(body => {
    body.rows.forEach((doc) => {
      doc.doc.batata = 'novo campo';
      alice.insert(doc.doc)
    });
  })
  res.send('updating todos')

});
module.exports = router;
