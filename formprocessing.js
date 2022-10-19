//form processing.js

var myServer = new XMLHttpRequest();

$(document).ready(function(){

    //process the form data

    $('form').submit(function(event){
        event.preventDefault();

        window.location.assign(window.location.href.replace("reserve", "login"));


    });
});
