var { CustomException } = require('./exceptions');
module.exports = function (error, res){
	console.log(error)

   if (error instanceof CustomException) {
      res.status(error.code)
      res.send({ message: error.message, status: error.status })
      return true;
   }
   return false;
}