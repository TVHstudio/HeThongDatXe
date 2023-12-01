var router = require("express").Router();
var UserRepos = require('../repos/user');
var AuthRepos = require('../repos/auth');

router.post('/auth', (req,res)=>{
    res.status(200).send({
        msg : 'verify ok !'
    });
})
module.exports = router;