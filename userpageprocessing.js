// userpageprocessing.js

var myServer = new XMLHttpRequest();

// Displays user's email on the userpage
var email = localStorage.getItem("email");
document.getElementById('username').innerHTML += email + '.';

// Two AJAX requests to load user's docker images & reservations
// "async: false" option allows the images and reservations to load before the
// page loads. Please do not edit.

// Load user reservation
$.ajax({
  type          :'POST',
  url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/notifs',
  data          :{
                    name: email,
                 },
  dataType      :'text',
  async         :false,
  encode        :true,
  error         :function(req, err){
                    console.log(err);
                 }
})

.done(function(response){

    if (response){
        // Parse the input into an array of json elements
        var data_split = response.split("},");
        for (var i = 0; i < data_split.length-1; i++) {
            data_split[i] = data_split[i] + "}";
        }

        var notifList = new Array();
        data_split.forEach(function(item){
            notifList.push(JSON.parse(item));
        });
        console.log(response);

        // Insert the (parsed) notifications into userpage.html
        for (var count = 0; count < notifList.length; count++){
            
            var type = notifList[count]['notif_type'];
            var body = notifList[count]['body'];
            
            if (type == "accept"){
              var notif = '<button type="button" class = "notification_box notification-accept">'+
                '<div><b>Success: </b>' + body + '\n</div>'
              '</button>'                
                
            }else if (type == "deny"){
              var notif = '<button type="button" class = "notification_box notification-deny">'+
                '<div><b>Denied: </b>' + body + '\n</div>'
              '</button>'                  
                
            }
            else if (type == "info"){
              var notif = '<button type="button" class = "notification_box notification-announce">'+
                '<div><b>Notice: </b>' + body + '\n</div>'
              '</button>'                  
            }
            else{
                console.log("i dont know");
            }
          document.getElementById('notification_box').innerHTML += notif;
        }
        document.getElementById('notification_box').innerHTML += '<button type="button" class="notification_box clear_button" id= "clear_button"><div><u>Clear<u></div></button>';
    }

    else {
        document.getElementById('notification_box').innerHTML += "<div>No notifications. </div>";
    }

});

// loading user's docker images
$.ajax({
  type          :'POST',
  url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/readImage',
  data          :{
                    name: email,
                 },
  dataType      :'text',
  encode        :true,
  async         :false,
  error         :function(req, err){
                    console.log(err);
                 }
})

.done(function(response){

  // Parse the input into an array of json elements
  var data_split = response.replace("{","").replace("}","").split("',");
  for (var i = 0; i < data_split.length; i++) {
      data_split[i] = data_split[i].replace(/'/g,"");
  }
  var imageList = new Array();
  data_split.forEach(function(item){
    imageList.push(item);
  });

  // Insert the (parsed) reservations into userpage.html
  for (var count = 0; count < imageList.length; count++){

    var image = '<button type="button" class="dockerimage list-group-item list-group-item-action">'+ imageList[count] +
    '</button>'
    document.getElementById('imageList').innerHTML += image;
    }

});


// Load user reservation
$.ajax({
  type          :'POST',
  url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/readReservation',
  data          :{
                    name: email,
                 },
  dataType      :'text',
  async         :false,
  encode        :true,
  error         :function(req, err){
                    console.log(err);
                 }
})

.done(function(response){

    if (response){
        
        // Parse the input into an array of json elements
        var data_split = response.split("},");
        for (var i = 0; i < data_split.length-1; i++) {
            data_split[i] = data_split[i] + "}";
        }

        var reservationList = new Array();
        data_split.forEach(function(item){
            reservationList.push(JSON.parse(item));
        });

        // Insert the (parsed) reservations into userpage.html
        for (var count = 0; count < reservationList.length; count++){
            
            //Time conversion
            var UTC_reserveStart = timeUTCtoKST(reservationList[count]['reserveStart'].replace(/:00:002Z/g, ""));
            var UTC_reserveEnd = timeUTCtoKST(reservationList[count]['reserveEnd'].replace(/:00:002Z/g, ""));

          var reservation = '<button type="button" class="reservation list-group-item list-group-item-action">'+
            '<div><b>Start: </b>' + UTC_reserveStart + '\n</div>' +
            '<div><b>End: </b>' + UTC_reserveEnd + '\n</div>' +
            '<div><b>Selected Image: </b>' + reservationList[count]['selectedImage'] + '\n</div>' +
            '<div><b>Reservation Password: </b>' + reservationList[count]['vnc_password'] + '\n</div>' +
            '<div><b>Status: </b>' + reservationList[count]['status'] + '\n</div>'
          '</button>'

          // "Select Docker Image" page
          document.getElementById('reservationList_docker').innerHTML += reservation;
          // "Make/Cancel Reservations" Page
          document.getElementById('reservationList_reserve').innerHTML += reservation;

        }
    }

    else {
        // "Select Docker Image" page
        document.getElementById('reservationList_docker').innerHTML += "<div>You have no upcoming reservations.</div>";
        // "Make/Cancel Reservations" Page
        document.getElementById('reservationList_reserve').innerHTML += "<div>You have no upcoming reservations.</div>";
    }

});


$(document).ready(function(){

  // Make scroll lists 'clickable'
    $(".clear_button").click(function(event) { 
        $.ajax({

            async         :true,
            type          :'post',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/clearNotif',
            data          : {
                                name            : email,
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
            if (data.includes("removed")){
                alert("Notifications removed.");
                window.location.reload();
            }else {
                alert("ERROR");
            }
        });             
    });

  $(".dockerimage").click(function(event) {

      // Select all list items
      var listItems = $(".dockerimage");

      // Remove 'active' tag for all list items
      for (let i = 0; i < listItems.length; i++) {
          listItems[i].classList.remove("active");
      }

      // Add 'active' tag for currently selected item
      this.classList.add("active");
  });

  $(".reservation").click(function(event) {

      // Select all list items
      var listItems = $(".reservation");

      // Remove 'active' tag for all list items
      for (let i = 0; i < listItems.length; i++) {
          listItems[i].classList.remove("active");
      }

      // Add 'active' tag for currently selected item
      this.classList.add("active");
  });

  // Add reservation
  $('#addReservation').submit(function(event){

      event.preventDefault();

      //Time conversion
      var reserveStart = $('input[id=inputDate]').val() + "T" + $('input[id=inputTimeStart]').val() + ":00"
      var reserveEnd = $('input[id=inputDate]').val() + "T" + $('input[id=inputTimeEnd]').val() + ":00"

      var UTC_reserveStart = timeKSTtoUTC(reserveStart);
      var UTC_reserveEnd = timeKSTtoUTC(reserveEnd);


      //Get form data from userpage.html
      var formData = {
          //Setting the input to be the id
          'name'          :email,
          'reserveStart'  : UTC_reserveStart + ":00:002Z",
          'reserveEnd'    : UTC_reserveEnd + ":00:002Z",
      };

      console.log(formData['reserveStart']);
      console.log(formData['reserveEnd']);

      $.ajax({
          async         :true,
          type          :'post',
          url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/reserve',
          data          : {
                              name        : formData.name,
                              reserveStart: formData.reserveStart,
                              reserveEnd  : formData.reserveEnd
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
            if (data.includes("duplicate")== true ){
                if(!alert("There is currently an active reservation under this email. Please wait until after your appointment date to reserve again.")){
                    window.location.reload();
                }
            }else if (data.includes("Change the time")== true ){
                alert("This time slot is taken. Check the calendar and choose a new time slot.");

            }else if (data.includes("reservation is started")== true ){
                if(!alert("Reservation successfully created.")){
                    window.location.reload();
                }
            }else if (data.includes("past") == true){
                alert("Reservations cannot be made for the past. Please try again.");
            }else {
                alert("Some error has occurred!");
                window.location.reload();
            }
          });
     });

    $('#assignImage').click(function(event){

        event.preventDefault();

        var reserveSplit = $('.reservation.active').text().split(": ");
        var reserveStart = reserveSplit[1].replace("End","").replace(" ", "T") + ":00:002Z";

        var selectedImage = $('.dockerimage.active').text();

        //Get form data from userpage.html
        var formData = {
            //Setting the input to be the id
            'name'          :email,
            'reserveStart'  :reserveStart,
            'selectedImage' :selectedImage
        };

        $.ajax({

            async         :true,
            type          :'post',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/assignImage',
            data          : {
                                name        : formData.name,
                                reserveStart    : formData.reserveStart,
                                selectedImage   : formData.selectedImage
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
            if (data.includes("reservation does not exist")){
                alert("There seems to be an error. Please contact RUBIS Lab.");
            }
            else if (data.includes("assign success")){
                alert("Image was successfully assigned.");
                window.location.reload();
            }
            else {
                alert("ERROR");
            }
        });

    });

    $('#cancelReservation').click(function(event){

        event.preventDefault();
        var reserveSplit = [];
        
        $('.reservation.active').text().split(": ").forEach(function(value){
        reserveSplit.push(value.split("\n"));
        });
        
        var vnc_password = reserveSplit[4][0];
        console.log(vnc_password);

        //Get form data from userpage.html
        var formData = {
            //Setting the input to be the id
            'name'          :email,
            'vnc_password'  :vnc_password,
        };

        $.ajax({

            async         :true,
            type          :'post',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/cancelReservation',
            data          : {
                                name            : formData.name,
                                vnc_password    : formData.vnc_password,
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
            if (data.includes("reservation does not exists")){
                alert("There seems to be an error. Please contact RUBIS Lab.");
            }
            else if (data.includes("success")){
                alert("Reservation was successfully deleted.");
                window.location.reload();
            }
            else {
                alert("ERROR");
            }
        });

    });

    $('#launchReserve').click(function(event){

        event.preventDefault();

        //Get form data from userpage.html
        var formData = {
            //Setting the input to be the id
            'name'          :email,
        };

        $.ajax({

            async         :true,
            type          :'GET',
            url           :'https://cors-anywhere.herokuapp.com/uranium.snu.ac.kr:7780/busy',
            dataType      :'text',
            encode        :true,
            success       : function(response){
                               },
            error         : function(req,err){
                            console.log(err);
                               }
        })
        .done(function(data){
            if (data.includes("System is not busy.")){
                alert("No active VNC session. Check your reservation time.");
            }
            else if ((data.includes(formData.name))&& (data.includes("reserved"))){
                //If the '.../busy' request returns the user's name then it means it is currently their reservation time
                //Opens new tab with VNC session
                //alert(formData.name);
                alert("You will be redirected to your VNC session.");
                window.location.reload();
                window.open('https://rubis-lab.github.io/oscar-pages/monitor');
            }
            else if (data.includes("reserved")){
                alert("Active VNC session by another user. OscarLab cannot be accessed at this time.");
                window.location.reload();
            }
            else {
                alert("ERROR");
            }
        });

    });

    // $( "#edit" ).on( 'click', function() {
    //   $(window).triggerHandler("resize");
    // } );
    
});


function timeUTCtoKST(object){
    //Takes server time
    //Input is 00-00-00T00:00:00

    var time = new Date(object);
    //console.log("Not converted yet:"+ time);
    time.setHours(time.getHours()+9); //sets time to +9 hours
    var time_str = new Date(Date.parse(time)+(60*60*1000*9)).toISOString().slice(0, 16);
    time_str = time_str.replace("T"," ");
    //console.log("Converted:"+ time_str);

    return time_str;    //2020-12-24T10:00

}

function timeKSTtoUTC(object){
    //Takes time from html form
    //Input is 00-00-00T00:00:00

    var time = new Date(object);
    var time_str = new Date(Date.parse(time)).toISOString().slice(0, 16); //when the date is parsed it automatically changes to UTC?

    return time_str;    //2020-12-24T10:00

}

