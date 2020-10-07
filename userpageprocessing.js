// userpageprocessing.js

var myServer = new XMLHttpRequest();

// Displays user's email on the userpage
var email = localStorage.getItem("email");
document.getElementById('username').innerHTML += email + '.';

// Two AJAX requests to load user's docker images & reservations
// "async: false" option allows the images and reservations to load before the
// page loads. Please do not edit.

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

            var timeStart = reservationList[count]['reserveStart'].replace('T', " ").replace(/:00:002Z/g, "");
            var timeEnd = reservationList[count]['reserveEnd'].replace('T', " ").replace(/:00:002Z/g, "");
      
            var date = timeStart.substring(0,11);
            
            timeStart = timeStart.substring(11);
            timeEnd = timeEnd.substring(11);

            var hourStart = parseInt(timeStart.substring(0,2));
            var hourEnd = parseInt(timeEnd.substring(0,2));
      
            hourStart = hourStart + 9;
            hourEnd = hourEnd + 9 ;
      
            if (hourStart < 10){
                //Append 0 to hour if it is less than 10
                var hourStart_str = '0'.concat(hourStart);
            }
            if (hourEnd < 10){
                var hourEnd_str = '0'.concat(hourEnd);
            }
            else{
                var hourStart_str = hourStart.toString();
                var hourEnd_str = hourEnd.toString();
            }

            var UTC_timeStart = hourStart_str.concat(timeStart.substring(2));
            var UTC_timeEnd = hourEnd_str.concat(timeEnd.substring(2));
            //Add back the date
            var UTC_reserveStart = date.concat(UTC_timeStart);
            var UTC_reserveEnd = date.concat(UTC_timeEnd);

          var reservation = '<button type="button" class="reservation list-group-item list-group-item-action">'+
            '<div><b>Start: </b>' + UTC_reserveStart + '</div>' +
            '<div><b>End: </b>' + UTC_reserveEnd + '</div>' +
            '<div><b>Selected Image: </b>' + reservationList[count]['selectedImage'] + '</div>' +
              '<div><b>Reservation Password: </b>' + reservationList[count]['vnc_password'] + '</div>'
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

      var timeStart = $('input[id=inputTimeStart]').val();
      var timeEnd = $('input[id=inputTimeEnd]').val();

      var hourStart = parseInt(timeStart.substring(0,2));
      var hourEnd = parseInt(timeEnd.substring(0,2));

      hourStart = hourStart - 9;
      hourEnd = hourEnd - 9 ;

      if (hourStart < 10){
          //Append 0 to hour if it is less than 10
          var hourStart_str = '0'.concat(hourStart);
      }
      if (hourEnd < 10){
          var hourEnd_str = '0'.concat(hourEnd);
      }
      else{
        var hourStart_str = hourStart.toString();   //ex: 09
        var hourEnd_str = hourEnd.toString();

      }


      var UTC_timeStart = hourStart_str.concat(timeStart.substring(2));
      var UTC_timeEnd = hourEnd_str.concat(timeEnd.substring(2));


      //Get form data from userpage.html
      var formData = {
          //Setting the input to be the id
          'name'          :email,
          'reserveStart'  :$('input[id=inputDate]').val() + "T" +
          UTC_timeStart + ":00:002Z",
          'reserveEnd'    :$('input[id=inputDate]').val() + "T" +
          UTC_timeEnd + ":00:002Z",
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
                alert(data);

            }else if (data.includes("reservation is started")== true ){
                if(!alert("Reservation successfully created.")){
                                  window.location.reload();
                }
            }else if (data.includes("Reservations cannot be made for the past") == true){
                alert("Reservations cannot be made for the past. Please try again.");
            }else {
                alert("ERROR");
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
        
        var reserveSplit = $('.reservation.active').text().split(": ");
        var vnc_password = reserveSplit[4];
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

});
