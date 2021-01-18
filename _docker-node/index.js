#!/usr/bin/env node
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var jsftp = require('jsftp');
var Client = require('ssh2').Client;
var mime = require('mime');
var shell = require('shelljs');
var cron = require('node-cron');
var mongoose = require('mongoose');
var fs = require('fs');
const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');

var nodemailer = require('nodemailer');


///////////////Database Connection/////////////
//local mongodb connection
// mongoose.connect('mongodb://localhost:27017/oscar-db');
//docker mongodb connection
mongoose.connect('mongodb://oscar-db/oscar');
var db = mongoose.connection;
db.on('error', function(){
  console.log('Connection Failed!');
});
db.once('open', function() {
  console.log('Connected!');
});
var user = mongoose.Schema(
{
  name : {type: String, required: true, unique: true},
  password : {type: String, required: true},
  images : [{type: String}],
  reservations: [{
    name : {type: String},
    reserveStart : {type: Object},
    reserveEnd : {type: Object},
    selectedImage: {type: String},
    status: {type: String},
    vnc_password: {type: String}
  }],
  notifications: [{
      notif_type: {type: String},
      body: {type: String}  
  }]
},
{
  autoIndex: true,
  timestamps: true
}
);
var User = mongoose.model('user', user);


function getTimeStringfromObject(object){
  var pieces = object.split(':');
  var last = pieces[3];
  var first = pieces[0]+":"+pieces[1]+":"+pieces[2];
  return first+"."+last;
}

///////////////Server/////////////
var server = http.createServer(function(request,response){
  console.log('url = ' + request.url);
  var parsedUrl = url.parse(request.url);
  var resource = parsedUrl.pathname;

  //console.log('--- log start ---');
  var parsedUrl = url.parse(request.url);
  //console.log(parsedUrl);
  var parsedQuery = querystring.parse(parsedUrl.query,'&','=');
  console.log('query = ', parsedQuery);
  //console.log('--- log end ---');

  console.log('resource path=%s',resource);

  if(resource == '/post'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log(parsedQuery);
      response.writeHead(200, {'Content-Type':'text/html'});
      result = parsedQuery.var1;
      response.end('var1 is ' + result);
    });
  }else if(resource == '/signup'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log('parsedQuery =',parsedQuery);
      response.writeHead(200, {'Content-Type':'text/html'});
      var newUser = new User({name:parsedQuery.name,
        password: parsedQuery.password, images: ['default']});
      User.findOne({name:parsedQuery.name}, function(error,user){
        if(error){
          console.log(error);
        }else{
          console.log('--- signup user ---');
          console.log(user);
          if(user != null){
            console.log('--- Duplicate Username ---');
            response.end('existing email');
          }else{
            newUser.save(function(error, data){
              if(error){
                console.log(error);
              }else{
                console.log('--- New User Created ---')
                response.end('signup success');
              }
            });
          }
        }
      });
    });
  }else if(resource == '/login'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log('parsedQuery =',parsedQuery);
      response.writeHead(200, {'Content-Type':'text/html'});
      var newUser = new User({name:parsedQuery.name,
        password: parsedQuery.password});
      User.findOne({name:parsedQuery.name}, function(error,user){
        if(error){
          console.log(error);
        }else{
          console.log('--- login user ---');
          console.log(user);
          if(user != null){
            if(user.password == parsedQuery.password){
              console.log('--- Login success ---');
              response.end('login success');
            }else{
              console.log('--- Wrong password ---');
              response.end('wrong password');
            }
          }else{
            console.log('--- Account does not exist ---');
            response.end('account does not exist');
          }
        }
      });
    });
  }else if(resource == '/reserve'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      User.findOne({name:parsedQuery.name},function(error,user){
        if(error){
          console.log(error);
        }else{
          if(user == null){
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('account does not exist');
          }else if(parsedQuery.reserveStart <= new Date(Date.now()).toISOString()){
            console.log("Reservations cannot be made for the past.");
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end(parsedQuery.reserveStart + ' is in the past. Cannot reserve. Try again.');

          }else{
              User.find(null,null,{sort :{'reservations.reserveStart.orderIndex' : 1}}, function(error, data){
                if(error){
                  console.log(error);
                }else{
                  let users = JSON.parse(JSON.stringify(data));
                  var reserve_accepted = 0;
                  for(var i=0; i<users.length;i++){
                    for(var j=0; j<users[i].reservations.length;j++){
                        if ((users[i].reservations[j].reserveEnd > parsedQuery.reserveEnd) &&
                        (users[i].reservations[j].reserveStart < parsedQuery.reserveEnd)){
                          reserve_accepted = 1;
                        }else if((users[i].reservations[j].reserveEnd > parsedQuery.reserveStart) && 
                        (users[i].reservations[j].reserveStart < parsedQuery.reserveStart)){
                          reserve_accepted = 1;
                        }else if ((users[i].reservations[j].reserveStart > parsedQuery.reserveStart) && 
                        (users[i].reservations[j].reserveEnd < parsedQuery.reserveEnd)){
                          reserve_accepted = 1;
                        }
                        else{
                          console.log('No conflict.');
                        }
                    }
                  }
                    if(reserve_accepted == 0){
                        User.findOneAndUpdate({name: user.name},
                          {'$push':{reservations: {name:parsedQuery.name,
                            reserveStart: parsedQuery.reserveStart,
                            reserveEnd: parsedQuery.reserveEnd,
                            selectedImage: 'default',
                            status: 'Pending',
                            vnc_password: Math.random().toString(36).substring(7)},
                          }},
                            {new: true}
                            , function(error, data){
                              if(error){
                                console.log(error);
                              }else{
                                console.log('--- New Reservation Saved ---')
                                response.writeHead(200, {'Content-Type':'text/html'});
                                response.end(parsedQuery.name + ' reservation is started at ' + parsedQuery.reserveStart);
                              }
                            });
                            var transporter = nodemailer.createTransport({
                              service: 'gmail',
                              auth: {
                                user: 'openlab.notification@gmail.com',
                                pass: 'welcometoopenlab'
                              }
                            });
                            
                            var mailOptions = {
                              from: 'openlab.notifications@gmail.com',
                              to: 'openlab.notifications@gmail.com',
                              subject: 'New Open Lab Reservation  -- Accept or Deny',
                              text: 'An open lab reservation has been made. \n Accept or deny here: https://rubis-lab.github.io/oscar-pages/admin'
                            };
                            
                            transporter.sendMail(mailOptions, function(error, info){
                              if (error) {
                                console.log(error);
                              } else {
                                console.log('Email sent: ' + info.response);
                              }
                            });
                        } else {
                          console.log('--- Duplicate Reservation ---');
                          response.writeHead(200, {'Content-Type':'text/html'});
                          response.end( parsedQuery.reserveStart + ' ~ ' +
                            parsedQuery.reserveEnd +
                            ' is already reserved. Change the time!!');
                  }
                }
              });
          }
        }
      });    
    });
  }else if(resource == '/readReservation'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      User.findOne({"name":parsedQuery.name}, function(error, data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()).toISOString());
        if(error){
          console.log(error);
        }else{
          var res = '';
          var user = JSON.parse(JSON.stringify(data).replace(/ /g, ''));
          for(var i=0;i<user.reservations.length;i++){
            res = res.concat('{"reserveStart":"',user.reservations[i].reserveStart,
                             '","reserveEnd":"',user.reservations[i].reserveEnd,
                             '","selectedImage":"',user.reservations[i].selectedImage,
                             '","status":"',user.reservations[i].status,
                             '","vnc_password":"',user.reservations[i].vnc_password,'"},');
          }
          if(res != ''){
            res = res.slice(0,-1);
          }
          console.log(res);
          response.writeHead(200, {'Content-Type':'text/html'});
          response.end(res);
        }
      });
    });
  }else if(resource == '/cancelReservation'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      User.findOneAndUpdate({name:parsedQuery.name},
        {$pull:{reservations: {vnc_password: parsedQuery.vnc_password}}},function(error,data){
          if(error){
            console.log(error);
          }else{
            var user = JSON.parse(JSON.stringify(data));
            if(user == null){
              console.log('user does not exists');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('user does not exists');
            }
            else{
              console.log('--- delete reservation success ---');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('delete success');
            }
          }
        });
    });
  }else if(resource == '/denyReservation'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      var bodyMessage = "Your reservation at " + parsedQuery.reserveStart + " ~ " + parsedQuery.reserveEnd + " was denied.";
      User.findOneAndUpdate({name:parsedQuery.name},
        {$pull:{reservations: {vnc_password: parsedQuery.vnc_password}}, 
         $push:{notifications:{notif_type: "deny", body: bodyMessage}}},function(error,data){
          if(error){
            console.log(error);
          }else{
            var user = JSON.parse(JSON.stringify(data));
            if(user == null){
              console.log('user does not exists');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('user does not exists');
            }
            else{
              console.log('--- delete reservation success ---');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('delete success');
            }
          }
        });
    });
  }else if(resource == '/list'){
    User.find(null,null,{sort :{'reservations.reserveStart.orderIndex' : 1}}, function(error, data){
      console.log('--- Reservation list ---');
      console.log(new Date(Date.now()).toISOString());
      if(error){
        console.log(error);
      }else{
        // console.log(data);
        // const user = JSON.parse(JSON.stringify(data).split("[").join("{").split("]").join("}"));
        let users = JSON.parse(JSON.stringify(data));
        // console.log(JSON.stringify(users));
        var res = '';
        for(var i=0; i<users.length;i++){
          for(var j=0; j<users[i].reservations.length;j++){
            res = res.concat('{"name":"',users[i].reservations[j].name,
              '","reserveStart":"',users[i].reservations[j].reserveStart,
              '","reserveEnd":"',users[i].reservations[j].reserveEnd,
              '","selectedImage":"',users[i].reservations[j].selectedImage,
              '","status":"',users[i].reservations[j].status,
              '","vnc_password":"',users[i].reservations[j].vnc_password,'"},')
          }
        }
        if(res!=''){
          res = res.slice(0,-1);
        }
        console.log(res);
        response.writeHead(200, {'Content-Type':'text/html'});
        response.end(res);
      }
    });
  }else if(resource == '/pendinglist'){
    User.find({"reservations.status": "Pending" },null,{sort :{'reservations.reserveStart.orderIndex' : 1}}, function(error, data){
      console.log('--- Reservation list ---');
      console.log(new Date(Date.now()).toISOString());
      if(error){
        console.log(error);
      }else{
        let users = JSON.parse(JSON.stringify(data));
        var res = '';
        for(var i=0; i<users.length;i++){
          for(var j=0; j<users[i].reservations.length;j++){
            if(users[i].reservations[j].status == "Pending"){
              res = res.concat('{"name":"',users[i].reservations[j].name,
                '","reserveStart":"',users[i].reservations[j].reserveStart,
                '","reserveEnd":"',users[i].reservations[j].reserveEnd,
                '","selectedImage":"',users[i].reservations[j].selectedImage,
                '","status":"',users[i].reservations[j].status,
                '","vnc_password":"',users[i].reservations[j].vnc_password,'"},')
            }
          }
        }
        if(res!=''){
          res = res.slice(0,-1);
        }
        console.log(res);
        response.writeHead(200, {'Content-Type':'text/html'});
        response.end(res);
      }
    });
  }else if(resource == '/approvelist'){
      User.find({"reservations.status": "Approved" },null,{sort :{'reservations.reserveStart.orderIndex' : 1}}, function(error, data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()).toISOString());
        if(error){
          console.log(error);
        }else{
          let users = JSON.parse(JSON.stringify(data));
          var res = '';
          for(var i=0; i<users.length;i++){
            for(var j=0; j<users[i].reservations.length;j++){
              if(users[i].reservations[j].status == "Approved"){
                res = res.concat('{"name":"',users[i].reservations[j].name,
                  '","reserveStart":"',users[i].reservations[j].reserveStart,
                  '","reserveEnd":"',users[i].reservations[j].reserveEnd,
                  '","selectedImage":"',users[i].reservations[j].selectedImage,
                  '","status":"',users[i].reservations[j].status,
                  '","vnc_password":"',users[i].reservations[j].vnc_password,'"},')
                }
              }
          }
          if(res!=''){
            res = res.slice(0,-1);
          }
          console.log(res);
          response.writeHead(200, {'Content-Type':'text/html'});
          response.end(res);
        }
      });
  }else if(resource == '/readImage'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log('parsedQuery =',parsedQuery);

      // get image list from (mounted) registry and update the user's image 
      var tag_dir = '/docker-registry/repositories/'+parsedQuery.name.replace('@','.')+'/_manifests/tags/';
      var tags_ary = ['default'];
      var images = [];
      
      try{
        if(fs.existsSync(tag_dir)){
          images = fs.readdirSync(tag_dir);
          images.forEach(tag => tags_ary.push(tag));
        }else{
          console.log("User image list is empty.");
        }
      }catch(e){
        console.log(e);
      }

      User.findOneAndUpdate({name:parsedQuery.name},{"$set": {images: tags_ary}},null,function(error, user){
        console.log('--- imagelist User ---');
        if(error){
          console.log(error);
          response.writeHead(200, {'Content-Type':'text/html'});
          response.end(error);
        }else{
          if(user==null){
            console.log('account does not exist');
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('account does not exist');
          }else{
            console.log(user.toString());
            parsedUser = '{'+user.toString().split('[')[1].split(']')[0].replace(new RegExp('\n','g'),'').replace(new RegExp(' ','g'),'')+'}';
            console.log("parsedUser: ",parsedUser);
            response.end(parsedUser);
          }
        }
      });
    });
  }else if(resource == '/assignImage'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log(parsedQuery);
      User.findOne({name:parsedQuery.name},function(error,user){
        if(error){
          console.log(error);
        }else{
          if(user == null){
            console.log('reservation does not exist');
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('reservation does not exist');
          }else{
              // console.log(user);
              var parsedUser = JSON.parse(JSON.stringify(user));
              let startTime = parsedQuery.reserveStart;
              startTime = new Date(Date.parse(getTimeStringfromObject(startTime))).toISOString().slice(0, 16);
              
              for(var i=0;i<user.reservations.length;i++){
                let reserveStart = user.reservations[i].reserveStart;
                reserveStart = new Date(Date.parse(getTimeStringfromObject(reserveStart))+(60*60*1000*9)).toISOString().slice(0, 16);
                if(reserveStart == startTime){
                  console.log('selected image is changed');
                  user.reservations[i].selectedImage = parsedQuery.selectedImage;
                }
              }
              user.save(function (err,res){
                if(err){
                  console.log(err);
                  response.writeHead(200, {'Content-Type':'text/html'});
                  response.end(err);
                }else{
                  console.log(res);
                  console.log('--- Update selectedImage on reservation ---', res);
                  response.writeHead(200, {'Content-Type':'text/html'});
                  response.end('assign success');
                }
              });
            }
          }
        });
    });
  }else if(resource == '/addImage'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log('parsedQuery =',parsedQuery);
      var now = new Date(Date.now()).toISOString().replace('T','_').replace(new RegExp(':','g'),'-').substring(0,19);
      User.findOneAndUpdate({name:parsedQuery.name},{"$push": {images: now.toString()}},null,function(error, user){
        console.log('--- imagelist User ---');
        if(error){
          console.log(error);
          response.end(error);
        }else{
          if(user==null){
            console.log('account does not exist');
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('account does not exist');
          }else{
            console.log(now);
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('add image success');
          }
        }
      });
    });
  }else if(resource == '/busy'){
    User.find({$and: [{"reservations.reserveStart": {$lte :  new Date(Date.now()).toISOString()}},
      {"reservations.reserveEnd" : {$gte:  new Date(Date.now()).toISOString()}}]}, function(error,data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()).toISOString());
        if(error){
          console.log(error);
        }else{
          console.log(data);
          if(data != null){
            var flag = 0;
            var user = JSON.parse(JSON.stringify(data));
            var now = new Date(Date.now());
            var startTime, endTime, pwd, selImage;
            for (var j=0;j<user.length;j++){
                for(var i=0;i<user[j].reservations.length;i++){
                  start = Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveStart));
                  end = Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveEnd));
                  if(start < now && now < end && (user[j].reservations[i].status == "Approved")){
                    // convert to KST
                    startTime = new Date(Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveStart))+(60*60*1000*9)).toISOString().slice(11, 16); 
                    endTime = new Date(Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveEnd))+(60*60*1000*9)).toISOString().slice(11, 16);
                    selImage = user[j].reservations[i].selectedImage;
                    pwd = user[j].reservations[i].vnc_password; 
                    console.log(startTime, endTime, pwd);
                    response.writeHead(200, {'Content-Type':'text/html'});
                    response.end('System is reserved by '+user[j].name+'_'+startTime+'_'+endTime+'_'+pwd+'_'+selImage+'\n');
                    flag = 1;
                }
            }}
            if(flag == 0){
                response.writeHead(200, {'Content-Type':'text/html'});
                response.end('System is not busy.\n');
            }
          }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('System is not busy.\n');
          }
        }
      });
  }else if(resource == '/soon'){
    //Same as busy function but is true five minutes before
    User.find({$and: [{"reservations.reserveStart":{ $gte : new Date(Date.now()).toISOString()}}, {"reservations.reserveStart": { $lte: new Date(Date.now() + 120000).toISOString()}}]}
                 , function(error,data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()+ 120000).toISOString());
        //300000 is 5 minutes
        if(error){
          console.log(error);
        }else{
          console.log(data);
          if(data != null){
            var flag = 0;
            var user = JSON.parse(JSON.stringify(data));
            console.log(user);
            var now_plus_five = new Date(Date.now() + 120000);  //300000
            var now = new Date(Date.now());
            var startTime, endTime, pwd, selImage;
            for (var j=0;j<user.length;j++){
                for(var i=0;i<user[j].reservations.length;i++){
                      start = Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveStart));
                      end = Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveEnd));
                      if(start >= now && (start <= now_plus_five) && user[j].reservations[i].status == "Approved"){
                        // convert to KST
                        startTime = new Date(Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveStart))+(60*60*1000*9)).toISOString().slice(11, 16); 
                        endTime = new Date(Date.parse(getTimeStringfromObject(user[j].reservations[i].reserveEnd))+(60*60*1000*9)).toISOString().slice(11, 16);
                        selImage = user[j].reservations[i].selectedImage;
                        pwd = user[j].reservations[i].vnc_password; 
                        console.log(startTime, endTime, pwd);
                        response.writeHead(200, {'Content-Type':'text/html'});
                        response.end('System will be reserved by '+user[j].name+'_'+startTime+'_'+endTime+'_'+pwd+'_'+selImage+' soon.\n');
                        flag = 1;
                  }
            }}
            if (flag == 0){
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('There are no reservations for the next 1 minutes.\n');
            }
          }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('There are no reservations for the next 1 minutes.\n');
          }
        }

    });
  }else if(resource == '/removeReservation'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      User.findOneAndUpdate({name:parsedQuery.name},
        {$set:{reservations: []}},function(error,data){
          if(error){
            console.log(error);
          }else{
            var user = JSON.parse(JSON.stringify(data));
            if(user == null){
              console.log('user does not exists');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('user does not exists');
            }
            else{
              console.log('--- delete reservation success ---');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('remove success');
            }
          }
        });
    });
  }else if (resource == '/notifs'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function (){
        var parsedQuery = querystring.parse(postdata);
        User.findOne({"name":parsedQuery.name}, function(error, data){
            console.log('--- User Notifications ---');
            if(error){
                console.log(error);
            }else{
                var notifs = '';
                var user = JSON.parse(JSON.stringify(data));
                for(var i=0;i<user.notifications.length;i++){
                    notifs = notifs.concat('{"notif_type":"',user.notifications[i].notif_type,
                                     '","body":"',user.notifications[i].body,'"},');
                }
                if(notifs != ''){
                notifs = notifs.slice(0,-1);
                }
                console.log(notifs);
                response.writeHead(200, {'Content-Type':'text/html'});
                response.end(notifs);
            }
            
            
        });
      });
  }else if(resource == '/approve'){
    //Changes status from pending to approved
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      var bodyMessage = "Your reservation at " + parsedQuery.reserveStart + " ~ " + parsedQuery.reserveEnd + " is approved.";
      User.findOneAndUpdate({$and: [{name:parsedQuery.name}, {"reservations.vnc_password": parsedQuery.vnc_password}]},
        {$set:{"reservations.$.status": "Approved"}
         , $push:{notifications:{notif_type: "accept", body: bodyMessage}
        }},function(error,data){
          //reservations is an array and it must be access through the elements of the area -- reservations[5] == status field
          if(error){
            console.log(error);
          }else{
            var user = JSON.parse(JSON.stringify(data));
            if(user == null){
              console.log('user does not exists');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('user does not exists');
            }
            else{

              console.log('--- status changed to approve success ---');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('Reservation by ' + parsedQuery.name+ ' is approved!');
            }
          }
        });
    });
  }else if(resource == '/clearNotif'){
    //Clears the selected notification
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      var index = parsedQuery.index;

      User.findOneAndUpdate({name:parsedQuery.name}, {$pull: {notifications:{notif_type: {$in: ["accept", "deny", "info"]}}}},function(error,data){
          //reservations is an array and it must be access through the elements of the area -- reservations[5] == status field
          if(error){
            console.log(error);
          }else{
            var user = JSON.parse(JSON.stringify(data));
            if(user == null){
              console.log('user does not exists');
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('user does not exists');
            }
            else{
              console.log('--- One Notification Cleared ---');
              console.log(user.notifications);
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('Notification removed...');
            }
          }
        });
    });
  }else if(resource == '/addannouncement'){
    //Clears the selected notification
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      var bodyMessage = parsedQuery.text;

      User.updateMany({}, {$push: {notifications:{notif_type: "info", body: bodyMessage}}},function(error,data){
          if(error){
            console.log(error);
          }else{
              console.log('--- New Announcement Posted ---');
              console.log(bodyMessage);
              response.writeHead(200, {'Content-Type':'text/html'});
              response.end('Announcement successfully posted.');
          }
        });
    });
  }else if(resource == '/generateCode'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      var image_name = 'uranium.snu.ac.kr:5000/' + parsedQuery.name.replace('@','.') + ':'+ parsedQuery.image_name;
      var code_str = parsedQuery.code;

      var code_str_to = 'op_common_params.launch' //filename
      var code_dir = '/home/autoware/catkin_ws/minicar_autorunner/scripts/lane_keeping_autorunner/step4/'
      var base_image = 'uranium.snu.ac.kr:5000/openlab:default';

      var shared_dir = '/home/node/';
      var run_script = '.' + shared_dir + 'run.sh';

      // Save a Dockerfile in shared_dir
      var Dockerfile_str = 'FROM ' + base_image + ' \\' + 
                           'RUN echo' + code_str + '>>' + code_dir + code_str_to;
      const fs = require('fs');
      fs.writeFile(shared_dir + 'Dockerfile', Dockerfile_str, function(err){
        if(err){
          return console.log(err);
        }
        console.log("Dockerfile is saved to "+shared_dir);
      });

      // Run the script
      const exec = require('child_process').exec, child;
      const bashScript = exec(run_script + ' ' + image_name);
      bashScript.stdout.on('data', (data) => {
        console.log(data);
      });
      bashScript.stderr.on('data', (data) => {
        console.error(data);
      });      

    });
    
  }else if(resource == '/removeAll'){
    //Clear db
      User.deleteMany({});
  }else{
    response.writeHead(404, {'Content-Type':'text/html'});
    response.end('404 Page Not Found');
    
  }
});

server.listen(80, function(){
  console.log('Server is running...');
});
