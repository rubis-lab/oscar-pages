// loginprocessing.js
// Sends login/signup data to server and recieves confirmation

var myServer = new XMLHttpRequest();
var url='';

$(document).ready(function(){

    $("button").click(function(event){
        event.preventDefault();

        //Get form data from calendar.html
        var formData = {
            'name'          :$('input[id=inputEmail]').val(),
            'password'      :$('input[id=inputPassword]').val(),
        };
        localStorage.setItem("email", formData['name']);

        // if one of the fields are not filled in
        if (formData['name'] == '' || formData['password']==''){
            alert("Both fields are required for login/sign up.");
            window.location.reload();
        }

        // check whether the login or the signup button is pressed
        if ($(this).val() == 'login') {
            url = 'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/login';
        }
        else if ($(this).val() == 'signup') {
            url = 'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/signup'
        }
        else {
            alert('URL: ' + url);
        }

        // POST through ajax, email and password is sent to server
        $.ajax({
            async         :true,
            type          :'POST',
            url           :url,
            data          : {
                                name        : formData.name,
                                password    : formData.password,
                },
            dataType      :'text',
            encode        :true,
            success       :function(response){
                               },
            error         :function(req,err){
                               }

        })

        .done(function(data){

            if (data.includes("login success")){
                alert("login success");
                window.location = "https://rubis-lab.github.io/oscar-pages/userpage";
            }

            else if (data.includes("wrong password")){
                alert("Wrong pasword; please try again. Note that passwords are case sensitive.");
                window.location.reload();
            }

            else if (data.includes("account does not exist")){
                alert("There seems to be no account under this email. If you do not have an account, please sign up.");
                window.location.reload();
            }

            else if (data.includes("signup success")){
                alert("signin success");
                window.location = "https://rubis-lab.github.io/oscar-pages/userpage";
            }

            else if (data.includes("existing email")){
                alert("There seems to be an account that already exists under this email. Please try logging in.");
                window.location.reload();
            }
            else {
                alert("ERROR");
            }
        });

    });
});
