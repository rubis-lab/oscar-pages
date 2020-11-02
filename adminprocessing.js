// adminprocessing.js
// Log into the admin page.

var myServer = new XMLHttpRequest();

String.prototype.hashCode = function (){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i=0; i < this.length; i++){
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return hash;
}


$(document).ready(function(){

    $("button").click(function(event){
        event.preventDefault();

        //Get form data from calendar.html
        var formData = {
            'name'          :$('input[id=inputUsername]').val(),
            'password'      :$('input[id=inputPassword]').val(),
        };
        localStorage.setItem("name", formData['name']);

        // if one of the fields are not filled in
        if (formData['name'] == '' || formData['password']==''){
            alert("Both fields are required to login.");
            window.location.reload();
        }

        // check whether the login or the signup button is pressed
        if ($(this).val() == 'login') {
            var hash_name = formData.name.toString().hashCode();
            var hash_pass = formData.password.toString().hashCode();
            console.log(hash_name + '**********' + hash_pass);

            if ((hash_name == 108864489)&&(hash_pass == 481733867)){
                localStorage.setItem("hash_name", hash_name);
                localStorage.setItem("hash_pass", hash_pass);
                alert("Admin login success.");
                window.location.assign(window.location.href.replace("admin", "adminpage"));

            }
            else{
                alert("Incorrect login. Try again.");
                window.location.reload();
            }
        }

    });

    $('#addAnnouncement').submit(function(event){

        event.preventDefault();

        var message = $('input[id=announcement_text]').toString();

        //Get form data from userpage.html
        var formData = {
            //Setting the input to be the id
            'text'          :message,
        };

        console.log(formData['text']);
        alert("I am here?");

        $.ajax({

            async         :true,
            type          :'post',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/addannouncement',
            data          : {
                                text        : formData.message,
                },
            dataType      :'text',
            encode        :true,
            success       : function(response){
                               },
            error         : function(req,err){
                            console.log(err);
                               }
        })
        .done(function(data){
            if (data.includes("Announcement successfully posted")){
                alert("Announcement has been successfully posted.");
            }
            else {
                alert("ERROR");
            }
        });

    });






});

