class CustomException extends Error {
	constructor({internalMessage, message, code, inner, status}) {
		super();

		Error.captureStackTrace(this, this.constructor);

		this.name = this.constructor.name;

		this.message = message || 'Something went wrong, please try again later.';
		this.internalMessage = internalMessage || 'Something went wrong, please try again later.';

		this.status = status || 'error';
		this.code = code || 500;
		this.inner = inner;
	}
}

class DuplicatedException extends CustomException {
	constructor(message, internalMessage) {
		super({message: message, internalMessage: internalMessage, code: 409, status: 'warn'});
	}
}

class BadRequestException extends CustomException {
	constructor(message) {
		super({message: message, code: 400, status: 'warn'});
	}
}

class NotFoundException extends CustomException {
	constructor(message, internalMessage) {
		super({message: message, internalMessage: internalMessage, code: 404, status: 'warn'});
	}
}

module.exports = { DuplicatedException, CustomException, NotFoundException, BadRequestException };