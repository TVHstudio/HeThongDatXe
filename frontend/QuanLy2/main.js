
var map, marker,infowindow, geocoder;
const ZOOM_SIZE = 16;

var app = new Vue({
    el : '#app',
    data : {
        msg : "no msg",
        requests : [],
        socket: null
    },
    methods: {
      logout(){
        if(confirm('Do you wanna sign out ?')){
          localStorage.clear();
          location = 'index.html';
        }
      },
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
            var mapProp = {
              center: new google.maps.LatLng(10.762467, 106.682751),
              zoom: ZOOM_SIZE,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };
             geocoder = new google.maps.Geocoder();
             infowindow = new google.maps.InfoWindow();
            document.getElementById("submit").addEventListener("click", function() {
             
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

                    self.socket = io("http://localhost:1235", {
                      query: {token: token, u_type: user_type, u_id : user_id} },{origins:"*"});

                      self.socket.on('event-request-management', function(rows){
                        self.requests = JSON.parse(rows);
                        console.log(rows);
            
                        self.requests.sort(function(a, b) {
                          return b.iat - a.iat;
                        });
                        self.requests.forEach(e => {
                          e.date = self.timeConverter(e.iat);
                          e.note_trim = e.note.substr(0, 30);
                          switch(e.status){
                            case 0:
                            e.status_string = 'Chưa định vị'; 
                            break;
                            case 1:
                            e.status_string = 'Đã định vị'; 
                            break;
                            case 2:
                            e.status_string = 'Đã có xe nhận'; 
                            break;
                            case 3:
                            e.status_string = 'Đang di chuyển'; 
                            break;
                            case 4:
                            e.status_string = 'Hoàn thành'; 
                            break;
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
                self.loadData(localStorage.token_key );
            })
            .catch(err=>{
                self.get_new_access_token(localStorage.ref_token, localStorage.uid)
                .then(user=>{
                  self.loadData(user.data.access_token);
                }).catch(err=>{
                    window.location.href = "index.html";
                })
            });

      } else {
        window.location.href = "index.html";
      }

        google.maps.event.addDomListener(window, "load", self.initialize);

    },
});