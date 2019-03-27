const nano = require('nano')('https://couchdb-fa9597.smileupps.com');
const sales = nano.db.use('sales');
var { DuplicatedException, NotFoundException, BadRequestException } = require('../utils/exceptions')

var cls = {};

cls.listAll = async function (){
	var list = await sales.list({ include_docs: true })
	return list.rows.map(o => o.doc);
}


module.exports = cls