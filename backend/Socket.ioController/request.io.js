var RequestRepos =  require ('../repos/request-receiver');
var DriverRepos = require('../repos/driver');
var moment = require('moment');
const haversine = require('haversine')
const NUM_LOOP_FIND_USER = 5;
var eventGetAll = (io,client)=>{
    RequestRepos.getAll_Stt0()
    .then(rows=>{
        io.sockets.emit('event-request-reciever', JSON.stringify(rows));
    })
    .catch(err=>{
        io.sockets.emit('event-request-reciever', JSON.stringify({
            msg: 'error to get list request-reciever',
            err: err
        }));
    })
}
var eventGetAllReq = (io,client)=>{
    RequestRepos.getAll()
    .then(rows=>{
        io.sockets.emit('event-request-management', JSON.stringify(rows));
    })
    .catch(err=>{
        io.sockets.emit('event-request-management', JSON.stringify({
            msg: 'error to get list request-reciever',
            err: err
        }));
    })
}

var driverConnect = (io, client) =>{ 
    client.on('event-find-request-of-driver', (d)=>{
        var loop =  0;
        var fn = ()=> {
            console.log('find user -->' + loop)
            findRequest(client.u_id).then(user=>{
                if(user) {
                    client.emit("find-user-successfuly", JSON.stringify( user));
                }
                else {
                    loop++;
                    if(loop < NUM_LOOP_FIND_USER) {
                        setTimeout(fn, 2500);
                    }
                    else {
                        client.emit("find-user-fail", JSON.stringify("aa"));

                    }
                }
            })
            .catch(err => {
                client.emit("find-user-fail", JSON.stringify("aa"));
            });

        } // end fn()
        fn();
    });
    
    client.on('accept-user-request', d =>{
        var data = JSON.parse(d)
        DriverRepos.changeStt(1 , data.driverid).then(()=>{
            RequestRepos.updateRequestStt({
                status : 2,
                id : data.userid
            }).then(()=>{
                client.emit('event-driver-running',"");
            }).catch(err=>console.log(err));
        }).catch(err=>console.log(err));
       

    })

}
    
/**
 * Function find request for driver
 */
var findRequest= (id) =>{
    return new Promise((resolve, reject)=>{
        DriverRepos.getByIdStt0(id)
        .then(driver=>{
            if(driver){
                RequestRepos.getAll_Stt1().then(rows=>{
                    var min = null;
                    var user =null;
                    if(rows.length <0 ) {
                        resolve(null);
                    }
                    rows.forEach(element => {
                        req_location = {
                            latitude : element.lat,
                            longitude : element.lng
                        }
                        driver_location = {
                            latitude : driver.lat,
                            longitude : driver.lng
                        }                        
                        var long = haversine(driver_location, req_location);

                        if(!min || min >long) {
                            min=long;
                            user = element;
                        }
                    });
                    resolve(user);


                }).catch(err => reject(err));
            } else {
                reject( new Error("driver not founr !"));
            }
          
        }).catch(err => reject(err));
    });
   
}


module.exports.response = function(io, client){
    console.log(client.u_type)
    switch (client.u_type){
        case '2':
            driverConnect(io,client);
            break;
        case '0':
            eventGetAll(io,client);
            break;
        case '1':
            eventGetAllReq(io,client);
            break;    
    }

    client.on('disconnecting', (reason)=>{
        console.log('disconnecting, id = ' + client.id + reason);        
    });
    client.on('event-add-request', (obj)=>{
        var newReq = JSON.parse(obj);
        newReq.iat = moment().unix();
        RequestRepos.addRequest(newReq)
        .then(()=>{
            eventGetAll(io, client);
            eventGetAllReq(io,client);
        })
        .catch(err => console.log(err));
    });
    client.on('event-change-stt-to-1', (req)=>{
        var _req = JSON.parse(req);
        RequestRepos.locatedRequest(_req)
        .then(()=>{
            io.sockets.emit('event-change-stt-to-1-ok', req);
            eventGetAllReq(io,client);
        })
    });
    // client.on("event-driver-connecting", (req)=>{

    // });
}