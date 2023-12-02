var map, marker,infowindow, geocoder;
const ZOOM_SIZE = 16;
var LATLNG;
var app = new Vue({
  el: "#app",
  data: {
    msg: "no msg",
    requests: [],
    socket: null
  },
  methods: {
    logout(){
      if(confirm('Do you wanna sign out ?')){
        localStorage.clear();
        location = 'index.html';
      }
    },
    searchAddress(address){
      var self = this;
      document.getElementById("address").value = address;
      self.geocodeAddress(geocoder,address,map);
    },
    changeStt(_id) {
      var self = this;
        console.log(LATLNG)
      var r = confirm(`Định vị id: ${_id} ?`);
      if(r){
        self.socket.emit('event-change-stt-to-1', JSON.stringify({
           id : _id,
           lat: LATLNG.lat(),
           lng: LATLNG.lng()
       }));

      }      
    },
    timeConverter(UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = ["Jan", "Feb", "Mar", "Apr", "May","Jun","Jul","Aug", "Sep", "Oct",  "Nov", "Dec"];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
      var sec = a.getSeconds() < 10 ? "0" + a.getSeconds() : a.getSeconds();
      return (
        date + " " + month + " " + year + " " + hour + ":" + min + ":" + sec
      );
    },
    geocodeAddress(geocoder,address, map) {
        var self = this;
      geocoder.geocode({ address: address }, function(results, status) {
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
    geocodeLatLng(geocoder, map, latlng) {
    var self = this; 
    geocoder.geocode({'location': latlng}, function(results, status) {
        if (status === "OK") {
            if (results[0]) {
                 self.setMarker(results[0].geometry.location);
                 map.setCenter(results[0].geometry.location); 
                 infowindow.setContent(results[0].formatted_address);
                document.getElementById("address").value=results[0].formatted_address;
                LATLNG = results[0].geometry.location;

               } 
        } else {
          alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    },
     handleEvent() {
    } ,
    setMarker(latlng) {
        marker.setPosition( latlng);  
    }
    ,
    initialize() {
      var self = this;
      var mapProp = {
        center: new google.maps.LatLng(10.762467, 106.682751),
        zoom: ZOOM_SIZE,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
       geocoder = new google.maps.Geocoder();
       infowindow = new google.maps.InfoWindow();
      document.getElementById("submit").addEventListener("click", function() {
        var address = document.getElementById("address").value;
        self.geocodeAddress(geocoder,address, map);
        
      });
        map = new google.maps.Map(
        document.getElementById("googleMap"),  mapProp);
        marker = new google.maps.Marker({
            position: {
                lat : 10.762467, 
                lng: 106.682751
            },
            map: map,
            draggable:true 
        });
        infowindow.open(map, marker);

        marker.addListener('dragend', function(){
            console.log('rever')
            self.geocodeLatLng(geocoder, map, {
                lat: marker.position.lat(),
                lng: marker.position.lng()
            } );
        });
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
          window.localStorage.token_key = token;
          var user_id = localStorage.uid;
          var user_type = localStorage.user_type;

          self.socket = io("http://localhost:1235", {
            query: {token: token, u_type: user_type, u_id : user_id} },{origins:"*"});

        self.socket.on("event-request-reciever", function(rows) {
        self.requests = JSON.parse(rows);
        self.requests.sort(function(a, b) {
          return b.iat - a.iat;
        });
        self.requests.forEach(e => {
          e.date = self.timeConverter(e.iat);
          e.note_trim = e.note.substr(0, 30);
          e.status_string = 'Chưa định vị';
        });
      });

      self.socket.on("event-change-stt-to-1-ok", function(req) {
        var _req = JSON.parse(req);
        self.requests.forEach((e, index, object) => {
          if (e.id == _req.id) {
            object.splice(index, 1);
          }
        });
      });
    }
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
                    self.loadData(localStorage.token_key);
                  })
                  .catch(err=>{
                      self.get_new_access_token(localStorage.ref_token, localStorage.uid)
                      .then(user=>{
                        self.loadData(user.data.access_token);
                      }).catch(err=>{
                          window.location.href = "index.html";
                      })
                  });
      
            }else{
                window.location.href = "index.html";
            }
            
 
    google.maps.event.addDomListener(window, "load", self.initialize);
  }
});
