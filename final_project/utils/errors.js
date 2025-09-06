class HttpError extends Error {
    constructor(statusCode = 400, message = 'Bad Request') {
        super(message);
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            message: this.message,
        }
    }
}


class BadRequestError extends HttpError {
    constructor(message = 'Bad Request') {
        super(400, message);
    }
}

class InternalServerError extends HttpError {
    constructor(message = 'Internal Server Error') {
        super(500, message);
    }
}

class NotFoundError extends HttpError {
    constructor(message = 'Not Found') {
        super(404, message);
    }
}

class AlreadyExistsError extends HttpError {
    constructor(message = 'Already exists') {
        super(409, message);
    }
}

class UnauthorizedError extends HttpError {
    constructor(message = 'Unauthorized') {
        super(401, message);
    }
}


module.exports = {
    HttpError,
    BadRequestError,
    InternalServerError,
    NotFoundError,
    AlreadyExistsError,
    UnauthorizedError
};