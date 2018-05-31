var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;
// ======================================================================
// Verificar Token
// ======================================================================

exports.verifyToken = function (req, res, next) {
    let token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                errors: {mensaje: 'Token no valido'}
            });
        } else {
            req.user = decoded.user;
            next();
        }
    });
}



