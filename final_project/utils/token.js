const jwt = require('jsonwebtoken');

const SECRET = "fingerprint_customer";

function createToken(payload, expiresIn = '1h') {
    return jwt.sign(payload, SECRET, { expiresIn });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
}

module.exports = { createToken, verifyToken };
