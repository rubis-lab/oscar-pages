//form processing.js

var myServer = new XMLHttpRequest();

$(document).ready(function(){
    
    //process the form data
    
    $('form').submit(function(event){
        event.preventDefault();
        
        //Get form data from calendar.html
        var formData = {
            //Setting the input to be the id
            'name'          :$('input[id=inputEmail]').val(),
            'reserveStart'  :$('input[id=inputTimeStart]').val() + ":00:002Z",
            'reserveEnd'    :$('input[id=inputTimeEnd]').val() + ":00:002Z",  
        };
        
        // Base Url: https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/reserve
        
        //Process the form.
        $.ajax({
            async         :true,   
            type          :'POST',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/reserve',
            data          : {
                                name:  formData.name,
                                reserveStart: formData.reserveStart,
                                reserveEnd: formData.reserveEnd        
                },
            dataType      :'text', //what type of data do we expect back from the server?
            encode        :true,
            success       : function(response){
                               alert("hi");
                               },
            error         : function(req,err){
                               //var r = jQuery.parseJSON(response.responseText);
                               alert("Message:" + err);
                               }
            
       
        })
        
        .done(function(data){
              //log data to the console so we can see
              console.log(data); //idk what this does
              if (data.includes("duplicate")== true ){
                  if(!alert("There is currently an active reservation under this email. Please wait until after your appointment date to reserve again.")){window.location.reload();}
              }else if (data.includes("Change the time")== true ){
                  alert("This time slot is taken. Check the calendar and choose a new time slot.");
              }
              else if (data.includes("reservation is started")== true ){

                  
                  $.get({
                            url         : 'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/list',
                            dataType    :'text',
                            success     : function(response) {
                                                console.log(response);
                                                var try = Papa.unparse(response);
                                                console.log(try);
                                                //currentData = JSON.stringify(response);
                                                //console.log(currentData);
                                          }
                  });
                  
                  if(!alert("Reservation successfully created")){       //window.location.reload();
                  }
              }
              else {
                  alert("this shouldn't be triggered");
              }
             });
    
        //stop the form from submitting the normal way and refreshing the page
                   
    });
});
