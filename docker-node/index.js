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
// mongoose.connect('mongodb://localhost:27017/oscar');
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
    name : String,
    reserveStart : Object,
    reserveEnd : Object
  },
  {
    autoIndex: true,
    timestamps: true
  }
);
var User = mongoose.model('remotelab', user);

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
  User.findOne({reserveStart : {$gt: new Date(Date.now()).toISOString(), 
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
                let remoteFile = remotePath + data.name + '.tar'; 
                let localFile = './'+data.name+'.tar';
                try{
                  if (fs.existsSync(localFile)) {
                    //console.log("file exists");
                  } else {
                    shell.exec('sh generation.sh ' + data.name + '.tar');
                    console.log("new file is created ", data.name+'.tar');
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
    User.findOne({reserveEnd : {$gte: new Date(Date.now()).toISOString(), 
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
                  let remoteFile = remotePath + data.name + '.tar'; 
                  let localFile = './'+data.name+'.tar';
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
  // }else if(resource == '/list'){
  //   User.find({reserveStart : {$gte: new Date(Date.now()).toISOString()}},
  //   null,{sort :{reserveStart : 1}}, function(error, users){
  //     console.log('--- Reservation list ---');
  //     console.log(new Date(Date.now()).toISOString());
  //     if(error){
  //         console.log(error);
  //     }else{
  //         console.log(users);
  //         response.writeHead(200, {'Content-Type':'text/html'});
  //         parsedList = querystring.parse(users,'&','=','{',',');
  //         console.log(parsedList.reserveStart)
  //         response.end(users.toString());
  //     }
  //   });
  }else if(resource == '/list'){
    User.find(null,null,{sort :{reserveStart : 1}}, function(error, users){
      console.log('--- Reservation list ---');
      console.log(new Date(Date.now()).toISOString());
      if(error){
          console.log(error);
      }else{
        console.log(users);
        response.writeHead(200, {'Content-Type':'text/html'});
        var parsedList = users.toString().split('}');
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
        response.end(res);
        // response.end(users.toString());
      }
    });
  }else if(resource == '/busy'){
    User.findOne({ reserveStart : {$lte :  new Date(Date.now()).toISOString()},
    reserveEnd : {$gte:  new Date(Date.now()).toISOString()}}, function(error,user){
      console.log('--- Reservation list ---');
      console.log(new Date(Date.now()).toISOString());
      if(error){
          console.log(error);
      }else{
          console.log(user);
          if(user != null){
            response.writeHead(200, {'Content-Type':'text/html'});
            var a = JSON.parse(user);
            console.log(a.toString())
            console.log(user.name)
            response.end(user.toString());
          }else{
            response.writeHead(200, {'Content-Type':'text/html'});
            response.end('System is not busy.');
          }
      }
    })
  }else if(resource == '/reserve'){
    var postdata = '';
    request.on('data', function (data) {
      postdata = postdata + data;
    });
    request.on('end', function () {
      var parsedQuery = querystring.parse(postdata);
      console.log('parsedQuery =',parsedQuery);
      response.writeHead(200, {'Content-Type':'text/html'});
      var newUser = new User({name:parsedQuery.name, 
        reserveStart: parsedQuery.reserveStart, 
        reserveEnd: parsedQuery.reserveEnd});
      User.findOne({reserveStart : {$gte: parsedQuery.reserveStart}, 
        reserveEnd : {$lte: parsedQuery.reserveEnd}}, function(error,user){
        if(error){
            console.log(error);
        }else{
          console.log('--- reserved user ---');
          console.log(user);
          if(user != null){
            console.log('--- Duplicate Reservation ---');
            response.end(user.reserveStart.replace('T',' ') + ' ~ ' + 
            user.reserveEnd.replace('T',' ') +
             ' is already reserved. Change the time!!');
          }else{
            newUser.save(function(error, data){
              if(error){
                  console.log(error);
              }else{
                  console.log('--- New Reservation Saved ---')
                  response.end(parsedQuery.name + ' reservation is started at ' + parsedQuery.reserveStart);
              }
            });
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