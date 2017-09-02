/* Libraries/Modules */

var express = require("express");
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* Server setup */

app.use(express.static(__dirname + '/assets/'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

http.listen(3000, function(){
  console.log('\n[Server live @ localhost:3000]');
  console.log("\nUsernames are one off, restart server to clear usernames");
  console.log("\n---Chat Shows Here---");
});

/* Sockets Logic */

var maxSockets = 10;
var currentConnected = 0;

var messageLimit = 8;
var messageSizeLimit = 200;
var messageBuffer = [];
var usedUserNames = [];

io.on('connection', function(socket){
	
	if(canConnect()){

		connected(0);

		io.emit('message', messageBuffer);

		socket.on('disconnect', function(){
	    	connected(1);
		});

		socket.on('registerUser', function(username){

			if(username != ""){
        		
        		for(var i = 0; i < usedUserNames.length; i++){

        			if(username.toUpperCase() == usedUserNames[i].toUpperCase()){
        				
        				io.emit('registerUser', false);
        				return false;
        			}
        		}
        	}

        	usedUserNames.push(username);
        	console.log("\n-Registered- [" + username + "]\n");
        	io.emit('registerUser', true);
		});

		socket.on('message', function(msg){

			if(msg != ""){

				msg = msg.substr(0, messageSizeLimit);

				if(messageBuffer.length == messageLimit)
					messageBuffer.splice(0, 1);

				msg = "[" + getDateStr() + "]" + msg;

				console.log(msg);
				messageBuffer.push(msg);
				io.emit('message', messageBuffer);
			}
		});
	}

});

function getDateStr(){
	var dt = new Date();
	return dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
}

/* Validation */

function canConnect(){
	if((currentConnected + 1) > maxSockets)
		return false;
	else 
		return true;
}

function connected(flag){
	if(flag == 0)
		currentConnected += 1;
	else
		currentConnected -= 1;
}