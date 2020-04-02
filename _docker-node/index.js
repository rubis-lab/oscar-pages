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
    selectedImage: String
  }]
},
{
  autoIndex: true,
  timestamps: true
}
);
// var reservation = mongoose.Schema(
// {
//   name : {type: String, required: true},
//   reserveStart : {type: Object, required: true},
//   reserveEnd : {type: Object, required: true},
//   selectedImage: String
// },
// {
//   autoIndex: true,
//   timestamps: true
// }
// );
var User = mongoose.model('user', user);
// var Reservation = mongoose.model('reservation', reservation);

///////////////Docker Image FTP Connection/////////////
var connSettings = {
  host: 'uranium.snu.ac.kr',
  port: 2222,
  username: 'rubis',
  password: '4542rubis'
};
var remotePath = '/home/rubis/remotelab/';


///////////////Scheduler/////////////
cron.schedule('*/1 * * * *', () => {
  console.log('--- Scheduler ---');
  console.log(new Date(Date.now()).toISOString());
  ///////////////IMAGE DEPLOY/////////////
  User.findOne({"reservations.reserveStart": {$gt: new Date(Date.now()).toISOString(),
    $lte: new Date(Date.now() + 70*1000).toISOString()}},
    function(error, data){
      if(error){
        console.log(error);
      }else{        
        if(data != null){
          console.log('--- Image Deploy---');
          console.log(data);
          var conn = new Client();
          conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
              if (err) throw err;
              let now = new Date(Date.now()).toISOString().split('T')[0]
              let filename = data.name + '_' + now + '.tar';
              let remoteFile = remotePath + data.selectedImage; 
              let localFile = './' + filename;
              try{
                if (fs.existsSync(localFile)) {
                  console.log("file exists");
                } else {
                  shell.exec('sh generation.sh ' + filename);
                  console.log("new file is created ", filename);
                }
              } catch(err) {
                console.error(err);
              }
              console.log('remoteFile', remoteFile);
              console.log('localFile', localFile);
              sftp.fastPut(localFile, remoteFile, (err) => {
                if (err) throw err;
                console.log('Deployed!');
                conn.end();
              });
            });
          }).connect(connSettings);
        }else{
          //console.log('--- Upload reservation is not exists. ---');
        }
      }
    });
  ///////////////IMAGE RETRIEVE/////////////
  User.findOne({"reservations.reserveEnd": {$gte: new Date(Date.now()).toISOString(),
    $lt: new Date(Date.now() + 70*1000).toISOString()}},
    function(error, data){
      if(error){
        console.log(error);
      }else{
        if(data != null){
          console.log('--- Image Retrieve---');
          console.log(data);
          var conn = new Client();
          conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
              if (err) throw err;
              if(data.selectedImage == 'default'){
                var filename = 'default.tar';
              }else{
                var filename = data.name + '_' + data.selectedImage + '.tar';
              }
              let remoteFile = remotePath + filename;
              let localFile = './' + filename;
              sftp.fastGet(remoteFile, localFile, (err) => {
                if (err) throw err;
                console.log('Retrieved!');
                conn.end();
              });
            });
          }).connect(connSettings);
        //shell.exec('sh test.sh ./');
      }else{
          //console.log('--- Download reservation is not exists. ---');
        }
      }
    });
});

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
          }else{
            User.findOne({"reservations.reserveStart" : {$gte: parsedQuery.reserveStart},
              "reservations.reserveEnd" : {$lte: parsedQuery.reserveEnd}}, function(error,reserved){
                if(error){
                  console.log(error);
                }else{
                  console.log('--- reservation ---');
                  console.log(reserved);
                  if(reserved != null){
                    console.log('--- Duplicate Reservation ---');
                    response.writeHead(200, {'Content-Type':'text/html'});
                    response.end(parsedQuery.reserveStart + ' ~ ' +
                      parsedQuery.reserveEnd +
                      ' is already reserved. Change the time!!');
                  }else{
                    User.findOneAndUpdate({name: user.name},
                      {'$push': {reservations: {name:parsedQuery.name,
                        reserveStart: parsedQuery.reserveStart,
                        reserveEnd: parsedQuery.reserveEnd,
                        selectedImage: 'default'}}},
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
            res = res.concat('{"reserveStart":"',user.reservations[i].reserveStart,'","reserveEnd":"',
              user.reservations[i].reserveEnd,'","selectedImage":"',user.reservations[i].selectedImage,'"},');
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
        {$pull:{reservations: {reserveStart: parsedQuery.reserveStart}}},function(error,data){
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
        console.log(JSON.stringify(users));
        let res = '';
        for(var i=0; i<users.length;i++){
          for(var j=0; j<users[i].reservations.length;j++){
            res = res.concat('{"name":"',users[i].reservations[j].name,
              '","reserveStart":"',users[i].reservations[j].reserveStart,
              '","reserveEnd":"',users[i].reservations[j].reserveEnd,'"},')
          }
        }
        if(res != ''){
          res = res.slice(0,-1);
        }
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
              for(var i=0;i<user.reservations.length;i++){
                if(user.reservations[i].reserveStart == parsedQuery.reserveStart){
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
                  console.log('--- Update selectedImage on reservation ---');
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
    User.findOne({"reservations.reserveStart": {$lte :  new Date(Date.now()).toISOString()},
      "reservations.reserveEnd" : {$gte:  new Date(Date.now()).toISOString()}}, function(error,data){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()).toISOString());
        if(error){
          console.log(error);
        }else{
          console.log(data);
          if(data != null){
            var user = JSON.parse(JSON.stringify(data));
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('System is reserved by '+user.name);
          }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('System is not busy.');
          }
        }
      });
  }else{
    response.writeHead(404, {'Content-Type':'text/html'});
    response.end('404 Page Not Found');
  }
});

server.listen(80, function(){
  console.log('Server is running...');
});
