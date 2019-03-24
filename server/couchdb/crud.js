const nano = require('nano')('https://couchdb-fa9597.smileupps.com');
const alice = nano.db.use('teste');
var { DuplicatedException, NotFoundException } = require('../utils/exceptions')

var cls = {};
cls.insert = async function (obj) {
   delete obj._id;
   delete obj._rev;
   if (obj.model == null){
      throw new Error('Document does not have the \'model\' attribute');
   }
   if (await cls.find(obj.model)){
      throw new DuplicatedException(`Document with model '${obj.model}' already exists, this is a unique field`);
   }
   return await alice.insert(obj);
}

cls.findById = async function (id) {
   return await alice.get(id);
}

cls.update = async function (obj) {
   if (obj._id == null || obj._rev == null) {
      if (obj.model == null) {
         throw new Error('Document does not have any type of identification');
      }
      console.log(await cls.find(obj.model))
      let original = await cls.find(obj.model);

      if (original == null) {
         throw new Error('Document does not exist to be updated');
      }

      obj._id = original._id;
      obj._rev = original._rev;
   }
   return await alice.insert(obj);
}

cls.listAll = async function () {
   var list = await alice.list({ include_docs: true })
   return list.rows.map(o => o.doc);
}

cls.find = async function (model) {
   var list = await cls.listAll();
   return list.find(o => o.model == model);
}

cls.deleteAll = async function () {
   var list = await cls.listAll();

   for (doc of list) {
      await cls.deleteDoc(doc);
   }
}

cls.deleteDoc = async function (doc) {  
   return await alice.destroy(doc._id, doc._rev);
}

cls.delete = async function (model) {
   var item = await cls.find(model);
   
   if (!item || item.hidden)
      throw new NotFoundException('Diaper not found')

   item.hidden = true;

   return await cls.update(item);
}

module.exports = cls