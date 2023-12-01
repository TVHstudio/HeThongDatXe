var jwt = require('jsonwebtoken');
var rndToken = require('rand-token');
var moment = require('moment');

var DbFunction = require('../fn/sqlite3-db');

const SECRET = 'ABCDEF';
const AC_LIFETIME = 1800; // seconds

class AuthRepos {
    generateAccessToken(userEntity) {
        var payload = {
            user: userEntity,
            info: 'more info'
        }

        var token = jwt.sign(payload, SECRET, {
            expiresIn: AC_LIFETIME
        });

        return token;
    }

    verifyAccessToken(req, res, next) {
        var token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, SECRET, (err, payload) => {
                if (err) {
                    res.statusCode = 401;
                    res.json({
                        msg: 'INVALID TOKEN',
                        error: err
                    })
                } else {
                    req.token_payload = payload;
                    next();
                }
            });
        } else {
            res.statusCode = 403;
            res.json({
                msg: 'NO_TOKEN'
            })
        }
    }

    generateRefreshToken() {
        const SIZE = 80;
        return rndToken.generate(SIZE);
    }

    updateRefreshToken (userId, rfToken)  {  
        var time_ = moment().unix();
        var sql = `Update users set rfToken = '${rfToken}', iat = ${time_} where ID = ${userId}`;           
        return DbFunction.runQuery(sql);   
    }
}

module.exports = new AuthRepos();