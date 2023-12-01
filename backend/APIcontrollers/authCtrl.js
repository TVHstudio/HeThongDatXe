var router = require("express").Router();
var UserRepos = require('../repos/user');
var AuthRepos = require('../repos/auth');

router.post('/new_token', (req,res)=>{
    var user_ref_token = req.body.ref_token;
    var user_id = req.body.id;
    if(user_ref_token && user_id){
        UserRepos.getByToken(user_id, user_ref_token)
        .then(user=>{
            var acToken = AuthRepos.generateAccessToken(user);
            var user_res = {
                auth: true,
                access_token: acToken,
                type: user.type
            };
            if(user.type == 2) {
                user_res.status = user.status;
            }
            res.json(user_res);
        }).catch(err=>{
                   
            res.statusCode = 500;
            res.end('View error log on console');
        });
    } else {
        res.status(404).send({
            msg : "not found",
        }); 
    }
});

router.post('/login', (req, res)=>{
    var usrname = req.body.username;
    var passw = req.body.password;
    var type = req.body.type;
    UserRepos.login(usrname, passw, type)
       .then(user =>{
           if(user){             
               var acToken = AuthRepos.generateAccessToken(user);
               var rfToken = AuthRepos.generateRefreshToken();
               
               AuthRepos.updateRefreshToken(user.id, rfToken)
               .then(()=>{
                   var user_res = {
                        auth: true,
                        user: {
                            uid :user.id,
                            username: user.username,
                            type: user.type
                        },
                        access_token: acToken,
                        refresh_token : rfToken
                    };
                    if(user.type == 2) {
                        user_res.user.status = user.status;
                    }
                   res.json(user_res);
               })
               .catch(err=>{
                   
                   res.statusCode = 500;
                   res.end('View error log on console');
               });
           } else{
              // UserRepos.addUser(usrname, 0).then(()=>{
                   res.status(404).send({
                       msg : "not found",
                   });
              // })
               
           }
           
       }).catch(err => res.end(err));

});

router.post('/signup', (req, res)=>{
    var username = req.body.username;
    var password = req.body.password;
    var type = req.body.type;
    if(!username || !password || !type) {
        return;
    } else {
        UserRepos.getByUserName(username).then(user =>{
            if(!user) {
                UserRepos.addNewUser(username, password, type)
                .then(()=>{                    
                        res.status(200).send({
                            msg : "OK",
                        });   
                }).catch(err => {
                   res.status(401).send({
                       msg : "not found",
                   });
                });
            }
            else {
                res.status(400).send({
                    msg : "user name is exist",
                });
            }
        }).catch(err=>{

        })
        
    }
})


module.exports = router;