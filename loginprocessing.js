// // loginprocessing.js
// // Sends login/signup data to server and recieves confirmation
//
// var myServer = new XMLHttpRequest();
//
// $(document).ready(function(){
//
//     //process the form data
//
//     $("button").click(function(event){
//         event.preventDefault();
//
//         //Get form data from calendar.html
//         var formData = {
//             //Setting the input to be the id
//             'access'        :$(this).val(), // Whether it's login or sign up
//             'name'          :$('input[id=inputEmail]').val(),
//             'password'      :$('input[id=inputPassword]').val(),
//         };
//
//         // if one of the fields are not filled in
//         if (formData['name'] == '' || formData['password']==''){
//             alert("Both fields are required for login/sign up.");
//         }
//
//         console.log(formData);
//
//         //Process the form.
//         $.ajax({
//             async         :true,
//             type          :'POST',
//             url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/login',
//             data          : {
//                                 access      : formData.access,
//                                 name        : formData.name,
//                                 password    : formData.password,
//                 },
//             dataType      :'json',
//             encode        :true,
//             success       :function(response){
//                                },
//             error         :function(req,err){
//                                }
//
//         })
//
//         .done(function(data){
//             if (data.includes("login success")){
//                 // load straight to home page
//             }
//
//             else if (data.includes("wrong password")){
//                 alert("Wrong pasword; please try again. Note that passwords are case sensitive.");
//             }
//
//             else if (data.includes("account does not exist")){
//                 alert("There seems to be no account under this email. If you do not have an account, please sign up.");
//             }
//
//             else if (data.includes("signup success")){
//                 // load straight to home page
//             }
//
//             else if (data.includes("existing email")){
//                 alert("There seems to be an account that already exists under this email. Please try logging in.");
//             }
//             else {
//                 alert("ERROR");
//             }
//         });
//
//     });
// });

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
                // load straight to home page
            }

            else if (data.includes("wrong password")){
                alert("Wrong pasword; please try again. Note that passwords are case sensitive.");
            }

            else if (data.includes("account does not exist")){
                alert("There seems to be no account under this email. If you do not have an account, please sign up.");
            }

            else if (data.includes("signup success")){
                alert("signin success");
            }

            else if (data.includes("existing email")){
                alert("There seems to be an account that already exists under this email. Please try logging in.");
            }
            else {
                alert("ERROR");
            }
        });

    });
});
