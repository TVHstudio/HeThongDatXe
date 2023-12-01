var router = require("express").Router();
var RequestRepos =  require ('../repos/request-receiver');
var moment = require('moment');



router.get('/', (req,res)=>{
    const reqObj = {
     name : req.query.name,
     address : req.query.address,
     phone : req.query.phone,
     note : req.query.note,
     iat: moment().unix()
    }
    RequestRepos.addRequest(reqObj).then(()=>{

        res.status(201).send(JSON.stringify({
            stt : 'success',
            msg : 'add new request booking',
            booking_info : reqObj,
        }));

    }).catch(err=>{
        res.status(404).send(JSON.stringify({
            sst: 'error',
            err : err,
            booking_info : reqObj
        }));
    });

});

module.exports = router;