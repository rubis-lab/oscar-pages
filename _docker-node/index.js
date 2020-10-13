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
  }]
},
{
  autoIndex: true,
  timestamps: true
}
);
var User = mongoose.model('user', user);


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
                        selectedImage: user.name+':default',
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
          var res = ''
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
  }else if(resource == '/readImage'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log('parsedQuery =',parsedQuery);

      User.findOne({name:parsedQuery.name},null,null,function(error, user){
        console.log('--- imagelist User ---');
        if(error){
          console.log(error);
          response.writeHead(200, {'Content-Type':'text/html'});
          response.end(error);
        }else{
          if(user==null){
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('account does not exist');
          }else{
            console.log(user.toString());
            parsedUser = '{'+user.toString().split('[')[1].split(']')[0].replace(new RegExp('\n','g'),'').replace(new RegExp(' ','g'),'')+'}';
            console.log(parsedUser);
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
    User.findOne({$and: [{"reservations.reserveStart": {$lte :  new Date(Date.now()).toISOString()}},
      {"reservations.reserveEnd" : {$gte:  new Date(Date.now()).toISOString()}}]}, function(error,data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()).toISOString());
        if(error){
          console.log(error);
        }else{
          console.log(data);
          if(data != null){
            var user = JSON.parse(JSON.stringify(data));
            var now = new Date(Date.now());
            var startTime, endTime, pwd, selImage;
            for(var i=0;i<user.reservations.length;i++){
              start = Date.parse(getTimeStringfromObject(user.reservations[i].reserveStart));
              end = Date.parse(getTimeStringfromObject(user.reservations[i].reserveEnd));
              if(start < now && now < end){
                // convert to KST
                startTime = new Date(Date.parse(getTimeStringfromObject(user.reservations[i].reserveStart))+(60*60*1000*9)).toISOString().slice(11, 16); 
                endTime = new Date(Date.parse(getTimeStringfromObject(user.reservations[i].reserveEnd))+(60*60*1000*9)).toISOString().slice(11, 16);
                selImage = user.reservations[i].selectedImage;
                pwd = user.reservations[i].vnc_password; 
                console.log(startTime, endTime, pwd);
                response.writeHead(200, {'Content-Type':'text/html'});
                response.end('System is reserved by '+user.name+'_'+startTime+'_'+endTime+'_'+pwd+'_'+selImage+'\n');
              }
            }
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('System is not busy.\n');
          }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('System is not busy.\n');
          }
        }
      });
  }else if(resource == '/soon'){
    //Same as busy function but is true five minutes before
    User.findOne({$and: [{"reservations.reserveStart":{ $gte : new Date(Date.now()).toISOString()}}, {"reservations.reserveStart": { $lte: new Date(Date.now() + 300000).toISOString()}}]}
                 , function(error,data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()+ 300000).toISOString());
        if(error){
          console.log(error);
        }else{
          console.log(data);
          if(data != null){
            var user = JSON.parse(JSON.stringify(data));
            var now_plus_five = new Date(Date.now() + 300000);
            var now = new Date(Date.now());
            var startTime, endTime, pwd, selImage;
            for(var i=0;i<user.reservations.length;i++){
              start = Date.parse(getTimeStringfromObject(user.reservations[i].reserveStart));
              end = Date.parse(getTimeStringfromObject(user.reservations[i].reserveEnd));
              if(start >= now && (start <= now_plus_five)){
                // convert to KST
                startTime = new Date(Date.parse(getTimeStringfromObject(user.reservations[i].reserveStart))+(60*60*1000*9)).toISOString(); 
                endTime = new Date(Date.parse(getTimeStringfromObject(user.reservations[i].reserveEnd))+(60*60*1000*9)).toISOString().slice(11, 16);
                selImage = user.reservations[i].selectedImage;
                pwd = user.reservations[i].vnc_password; 
                console.log(startTime, endTime, pwd);
                response.writeHead(200, {'Content-Type':'text/html'});
                response.end('System will be reserved by '+user.name+'_'+startTime+'_'+endTime+'_'+pwd+'_'+selImage+' soon.\n');
              }
            }
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('There are no reservations for the next 5 minutes.\n');

          }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('There are no reservations for the next 5 minutes.\n');
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
  }else if(resource == '/approve'){
    //Changes status from pending to approved
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      User.findOneAndUpdate({name:parsedQuery.name},
        {$set:{"reservations.status": "Approved"}},function(error,data){
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
              response.end('Reservation by ' + parsedQuery.name+ ' at '+ startTime+'-'+endTime+' is approved!');
            }
          }
        });
    });

  }else{
    response.writeHead(404, {'Content-Type':'text/html'});
    response.end('404 Page Not Found');
  }
});

server.listen(80, function(){
  console.log('Server is running...');
});
