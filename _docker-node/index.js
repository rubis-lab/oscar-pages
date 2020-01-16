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
mongoose.connect('mongodb://localhost:27017/oscar');
//docker mongodb connection
// mongoose.connect('mongodb://oscar-db/oscar');
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
    images : [{type: String, unique: true}]
  },
  {
    autoIndex: true,
    timestamps: true
  }
);
var reservation = mongoose.Schema(
  {
    name : {type: String, required: true},
    reserveStart : {type: Object, required: true},
    reserveEnd : {type: Object, required: true},
    selectedImage: String
  },
  {
    autoIndex: true,
    timestamps: true
  }
);
var User = mongoose.model('user', user);
var Reservation = mongoose.model('reservation', reservation);

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
  ///////////////File Upload/////////////
  Reservation.findOne({reserveStart : {$gt: new Date(Date.now()).toISOString(), 
    $lte: new Date(Date.now() + 70*1000).toISOString()}}, 
    function(error, data){
      if(error){
          console.log(error);
      }else{        
        if(data != null){
          console.log('--- File Upload---');
          console.log(data);
          var conn = new Client();
            conn.on('ready', function() {
              conn.sftp(function(err, sftp) {
                if (err) throw err;
                let filename = data.name + '_' + data.selectedImage + '.tar';
                let remoteFile = remotePath + filename; 
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
                  console.log('Uploaded!');
                  conn.end();
                });
              });
            }).connect(connSettings);
        }else{
          //console.log('--- Upload reservation is not exists. ---');
        }
      }
  });
  ///////////////File Download/////////////
  Reservation.findOne({reserveEnd : {$gte: new Date(Date.now()).toISOString(), 
    $lt: new Date(Date.now() + 70*1000).toISOString()}}, 
    function(error, data){
      if(error){
          console.log(error);
      }else{
        if(data != null){
          console.log('--- File Download---');
          console.log(data);
          var conn = new Client();
          conn.on('ready', function() {
            conn.sftp(function(err, sftp) {
              if (err) throw err;
              let filename = data.name + '_' + data.selectedImage + '.tar';
              let remoteFile = remotePath + filename; 
              let localFile = './' + filename;
              sftp.fastGet(remoteFile, localFile, (err) => {
                if (err) throw err;
                console.log('Downloaded!');
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
            var newReservation = new Reservation({name:parsedQuery.name,  
              reserveStart: parsedQuery.reserveStart, 
              reserveEnd: parsedQuery.reserveEnd,
              selectedImage: 'default'});
            Reservation.findOne({reserveStart : {$gte: parsedQuery.reserveStart}, 
              reserveEnd : {$lte: parsedQuery.reserveEnd}}, function(error,reservation){
              if(error){
                  console.log(error);
              }else{
                console.log('--- reservation ---');
                console.log(reservation);
                if(reservation != null){
                  console.log('--- Duplicate Reservation ---');
                  response.writeHead(200, {'Content-Type':'text/html'});
                  response.end(reservation.reserveStart.replace('T',' ') + ' ~ ' + 
                  reservation.reserveEnd.replace('T',' ') +
                   ' is already reserved. Change the time!!');
                }else{
                  newReservation.save(function(error, data){
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
  }else if(resource == '/list'){
    Reservation.find(null,null,{sort :{reserveStart : 1}}, function(error, reservations){
      console.log('--- Reservation list ---');
      console.log(new Date(Date.now()).toISOString());
      if(error){
          console.log(error);
      }else{
        console.log(reservations);
        var parsedList = reservations.toString().split('}');
        var i;
        var res = '';
        var temp_a;
        var temp_b;
        var temp_c;
        for (i=0; i < parsedList.length-1; i++) {
          if (i!=0) {res = res + ','};
          // console.log(i, parsedList[i]);
          parsedColumn = querystring.parse(parsedList[i].toString(),',\n  ',':',{});
          // console.log(parsedColumn);
          // console.log(parsedColumn.name);
          // console.log(parsedColumn.reserveStart);
          temp_a = parsedColumn.name.replace(',','').replace("'",'').replace("'",'').trim();
          temp_b = parsedColumn.reserveStart.replace(',','').replace("'",'').replace("'",'').trim();
          temp_c = parsedColumn.reserveEnd.replace(',','').replace("'",'').replace("'",'').trim();
          // console.log(parsedColumn);
          // console.log(temp_a);
          // console.log(temp_b);
          // console.log(temp_c);
          res = res.concat('{"name":"',temp_a,'","reserveStart":"',temp_b,'","reserveEnd":"',temp_c,'"}');
        }
        // parsedList = querystring.parse(users.toString(),'\n  ',':',{});
        response.writeHead(200, {'Content-Type':'text/html'});
        response.end(res);
        // response.end(users.toString());
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
  }else if(resource == '/readReservation'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      Reservation.find({name:parsedQuery.name, reserveStart : {$gte: new Date(Date.now()).toISOString()}},null,{sort :{reserveStart : 1}}, function(error, reservations){
        console.log('--- Reservation list ---');
        console.log(new Date(Date.now()).toISOString());
        if(error){
            console.log(error);
        }else{
          console.log(reservations);
          var parsedList = reservations.toString().split('}');
          var i;
          var res = '';
          var _name;
          var _reserveStart;
          var _reserveEnd;
          var _selectedImage;
          for (i=0; i < parsedList.length-1; i++) {
            if (i!=0) {res = res + ','};
            
            parsedColumn = querystring.parse(parsedList[i].toString(),',\n  ',':',{});
            
            _reserveStart = parsedColumn.reserveStart.replace(',','').replace("'",'').replace("'",'').trim();
            _reserveEnd = parsedColumn.reserveEnd.replace(',','').replace("'",'').replace("'",'').trim();
            _selectedImage = parsedColumn.selectedImage.replace(',','').replace("'",'').replace("'",'').trim();
            
            res = res.concat('{"reserveStart":"',_reserveStart,'","reserveEnd":"',
              _reserveEnd,'","selectedImage":"',_selectedImage,'"}');
          }
          response.writeHead(200, {'Content-Type':'text/html'});
          response.end(res);
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
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('account does not exist');
          }else{
            Reservation.findOneAndUpdate({name:parsedQuery.name, reserveStart:parsedQuery.reserveStart},
              {selectedImage:parsedQuery.reserveStart.replace('T','_').replace(new RegExp(':','g'),'-').substring(0,19)},null,function(error,reservation){
                if(error){
                  console.log(error);
                }
                else{
                  if(reservation!=null){
                    console.log('--- Update selectedImage on reservation ---');
                  }else{
                    console.log('no reservation exists');
                  }
                }
              });
            console.log(now);
            response.end(now);
          }
        }
      });
    });
  }else if(resource == '/busy'){
    Reservation.findOne({ reserveStart : {$lte :  new Date(Date.now()).toISOString()},
    reserveEnd : {$gte:  new Date(Date.now()).toISOString()}}, function(error,reservation){
      console.log('--- Reservation list ---');
      console.log(new Date(Date.now()).toISOString());
      if(error){
          console.log(error);
      }else{
          console.log(reservation);
          if(reservation != null){
            response.writeHead(200, {'Content-Type':'text/html'});
            var a = JSON.parse(reservation);
            console.log(a.toString())
            console.log(reservation.name)
            response.end(reservation.toString());
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