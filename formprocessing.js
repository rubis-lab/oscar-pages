//form processing.js

//var myServer = new XMLHttpRequest();

$(document).ready(function(){
    
    //process the form data
    
    $('form').submit(function(event){
        event.preventDefault();
        
        //Get form data from calendar.html
        var formData = {
            //Setting the input to be the id
            'name'          :$('input[id=inputEmail]').val(),
            'reserveStart'  :$('input[id=inputTimeStart]').val(),
            'reserveEnd'    :$('input[id=inputTimeEnd]').val(),  
        };
        
        //alert(formData.name + formData.reserveEnd + formData.reserveStart);
        
        //myServer.open("POST", "https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/reserve", true);
        
        //do i have to parse the data? in what form should i parse it?
        //myServer.send(formData);
        
        //Process the form.
        $.ajax({
            async         :true,   
            type          :'POST',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/reserve',
            data          :"name=" + formData.name + 
                           "reserveStart=" + formData.reserveStart + 
                           "reserveEnd=" + formData.reserveEnd,
            dataType      :'json', //what type of data do we expect back from the server?
            encode        :true,
            success: function(formData){
                               alert(formData);
                               }
            
       
        })
        
        .done(function(data){
              //log data to the console so we can see
              console.log(data); //idk what this does
              
              });
    
        //stop the form from submitting the normal way and refreshing the page
                   
    });
});
