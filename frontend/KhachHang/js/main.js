(function ($) {
    "use strict";
    if(!(localStorage.token_key && localStorage.ref_token && localStorage.uid)){
        location='index.html';
    }

    hideError();
    var token = window.localStorage.token_key ;
    var user_id = localStorage.uid;
    var user_type = localStorage.user_type;

    var socket = io("http://localhost:1235", {
      query: {token: token, u_type: user_type, u_id : user_id} },{origins:"*"});


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('click',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
        }     

        return check;
    });
    $('#form-request').on('submit', function(){
        var name = $('#name').val();
        var phone = $('#phone').val();
        var address = $('#address').val();
        var note = $('#note').val();
        var newReq = {
            name : name,
            phone : phone,
            address : address,
            note : note
        } 
        socket.emit('event-add-request', JSON.stringify(newReq));
    })

    $('#btn-signup').on('click', function(){
        hideError();
        var username = $('#username').val();
        var password = $('#password').val();
        var cfpasswrd = $('#confirmpassword').val();

        var newReq = {
            username : username,
            password : password,
        } 
        if(username == '' || password == '' || cfpasswrd !=  password)
        {
            $('#unvalid-fields').show();

        } else {
            newReq.type = -1;
            $.ajax({
                method: "POST",
                url: "http://localhost:1234/api/authen/signup",
                data: newReq
              })
                .done(function( msg, txt, xhr ) {
                    console.log('ok111')
                    if(xhr.status == 200 ){
                        $('#success-signup').show();
                    }
                }).fail(function (jqXHR, xhr) {
                    showError(jqXHR.status);
                });;
        }        
       
    });
    function hideError(hide = true) {
        if(hide) {
            $('#unvalid-fields').hide();
            $('#success-signup').hide();
            $('#error-login').hide();
            $('#error-username').hide();
        }     

    }
    function showError(code ) {
        switch (code) {
            case 400:  
                $('#error-username').show();
                break;
            case 401:           
                $('#error-login').show();   
                break;
        }
    }
    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    $("#btn-logout").on('click', function (){
        if(confirm('Do you wanna sign out ?')){
            localStorage.clear();
            location = 'index.html';
        }
    });
    function validate (input) {
        if($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
        
        return true;
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    

})(jQuery);