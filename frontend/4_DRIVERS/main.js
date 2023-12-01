var socket ;
var map, marker,infowindow, geocoder;
const ZOOM_SIZE = 16;

var app = new Vue({
    el : '#app',
    data : {
        msg : "no msg",
        requests : [],
        LATLNG : { lat:0, lng: 0},
        driver : {},
        statusType : { str : "driver-btn-offline", lb :'OFFLINE'},
        status_checked : false,
        found_user : false,
        user_wasfound : null
    },
    methods: {
        setMarker(latlng) {
            marker.setPosition( latlng);  
        },
        setLocation(){
            var self = this;
            address= document.getElementById("driver-address").value;
            self.geocodeAddress(geocoder,address,map);
        },
        geocodeLatLng(geocoder, map, latlng) {
            var self = this; 
            geocoder.geocode({'location': latlng}, function(results, status) {
                if (status === "OK") {
                    if (results[0]) {
                         self.setMarker(results[0].geometry.location);
                         map.setCenter(results[0].geometry.location); 
                         infowindow.setContent(results[0].formatted_address);
                         LATLNG = results[0].geometry.location;
        
                       } 
                } else {
                  alert(
                    "Geocode was not successful for the following reason: " + status
                  );
                }
              });
            },
        geocodeAddress(geocoder,address, map) {
          var self = this;
          geocoder.geocode({ address: address }, function(results, status) {
            if (status === "OK") {
                if (results[0]) {
                    var LNG = results[0].geometry.location;
                     self.setMarker(LNG);
                     map.setCenter(LNG); 
                     infowindow.setContent(results[0].formatted_address);
                     self.LATLNG = LNG;
                   } 
            } else {
              alert(
                "Geocode was not successful for the following reason: " + status
              );
            }
          });
        },        
        logout(){
            if(confirm('Do you wanna sign out ?')){
              localStorage.clear();
              location = 'index.html';
            }
          },
        DeclineUser(){
            var sefl = this;
            sefl.found_user = false;
            socket.emit('accept-user-request', JSON.stringify({                
                userid: sefl.user_wasfound.id,
                driverid : parseInt(localStorage.uid)
             }));
        },
        AcceptUser(){
            var sefl = this;
            sefl.found_user = false;

        },
        onClickChangStatus(){
            var self = this;
            // if(self.LATLNG.lat== 0 && self.LATLNG.lng == 0) {
            //     alert("Please set your location");
            //     return;
            // }
            setTimeout(function(){
                if(self.LATLNG.lat== 0 && self.LATLNG.lng == 0) {
                    alert("Please set your location");
                    self.status_checked = false;
                    return;
                }
                if(self.status_checked){
                    socket.emit("event-find-request-of-driver", "a");
                    self.statusType.str = 'driver-btn-online';  
                    self.statusType.lb = 'ONLINE';                    
                  
                }
                else {
                    self.statusType.str = 'driver-btn-offline';
                    self.statusType.lb = 'OFFLINE';                    

                }

            }, 0)
           
        
        }
        ,
        viewRide(){
            console.log('view ride');
        }
        ,
         timeConverter(UNIX_timestamp){
            var a = new Date(UNIX_timestamp * 1000);
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes() < 10 ? '0' + a.getMinutes() : a.getMinutes();
            var sec = a.getSeconds() < 10 ? '0' + a.getSeconds() : a.getSeconds();
            var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
            return time;
          },
          initialize() {
            var self = this;
        //     if (navigator.geolocation) {
        //       navigator.geolocation.getCurrentPosition(function(position) {
        //           var pos = {
        //               lat: position.coords.latitude,
        //               lng: position.coords.longitude
        //           };
        //             self.LATLNG =pos;
                  
        //       }, function() {
        //         alert("We need to see your location !");
        //         //window.location.href='index.html'
        //       });
        //   } else {
        //       // Browser doesn't support Geolocation
        //   }                 
          var mapProp = {
            center: new google.maps.LatLng(self.LATLNG.lat, self.LATLNG.lng),
            zoom: ZOOM_SIZE,
            mapTypeId: google.maps.MapTypeId.ROADMAP
            };
           geocoder = new google.maps.Geocoder();
           infowindow = new google.maps.InfoWindow();
     
            map = new google.maps.Map(
            document.getElementById("googleMap"),  mapProp);
            marker = new google.maps.Marker({
                position: self.LATLNG,
                map: map,
                draggable:true 
            });
            infowindow.open(map, marker); 
        },

        connect_to_server(){
            
        },
        get_new_access_token(rf, id){
          return  axios({
                method: "post",
               url: "http://127.0.0.1:1234/api/authen/new_token",
               data: {   
                ref_token : rf,
                id : id      
               }      
               })
        }, 
        loadData(token){
            var self = this;
            localStorage.token_key = token;
            var user_type = localStorage.user_type;
            var user_id = localStorage.uid;

            socket = io("http://localhost:1235", {
                query: {token: token, u_type: user_type, u_id : user_id} },{origins:"*"});
            socket.on('event-driver-connecting',function(data){
                console.log(data)
             });

           
             switch  (self.driver.status){
                    case 0:
                        self.statusType = "driver-btn-online";
                        break;
                    case 1:
                        self.statusType = "driver-btn-offline";
                        break;
             }
             // code event socket here ...
             socket.on('find-user-successfuly', function(user){
                var _user = JSON.parse(user);
                self.found_user = true;
                self.user_wasfound = _user;
            });
            socket.on('event-driver-running', function(d){
                self.statusType = {
                    str : 'driver-btn-have-user',
                    lb : 'Going to USER'
                }
                var x = (self.user_wasfound.lat);
                var y = (self.user_wasfound.lng);
                var directionsService = new google.maps.DirectionsService();
                var destination = {
                    lat : x,
                    lng : y
                }
                let request = {
                    origin: new google.maps.LatLng(self.LATLNG.lat(), self.LATLNG.lng()), //Điểm Start
                    destination: new google.maps.LatLng(destination), // Điểm Đích
                    travelMode: 'DRIVING' // Phương tiện giao thông
                  };
                  directionsService.route(request, function(response,status) {
                      console.log(response)
                    if (status === google.maps.DirectionsStatus.OK) {
                      new google.maps.DirectionsRenderer({
                        map: map,
                        directions: response,
                        suppressMarkers: true // Xóa marker default
                      });
                      self. geocodeLatLng(geocoder,map,destination )
                      setTimeout(function() {
                        map.setZoom(16); // Thay đổi tỉ lệ zoom
                      });
                    }
                  });
            });
            socket.on('find-user-fail', function(a){
                self.status_checked = false;
                self.statusType.str = 'driver-btn-offline';
                self.statusType.lb = 'OFFLINE'; 
            });

        }
    },
    beforeCreate() {
    
    },
    created() {
 
    },
    mounted() {
            var self = this;
            if(localStorage.token_key && localStorage.ref_token && localStorage.uid){
                axios({
                    method: "post",
                    url: "http://127.0.0.1:1234/api/user/auth",
                    data: {
                     
                    },
                    headers: {
                      "x-access-token" :  localStorage.token_key
                    }
                  }).then((data)=>{
                    self.loadData( localStorage.token_key);
                    self.driver.status =  parseInt( localStorage.driver_status);
                  })
                  .catch(err=>{
                      self.get_new_access_token(localStorage.ref_token, localStorage.uid)
                      .then(user=>{
                        self.loadData(user.data.access_token);
                        self.driver.status = user.data.status;
                      }).catch(err=>{
                          window.location.href = "index.html";
                      })
                  });
      
            }else{
                window.location.href = "index.html";
            }
            
        
      
         google.maps.event.addDomListener(window, "load", self.initialize);

    },
});