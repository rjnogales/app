/*
 * Server-related tasks
 *
 */

 // Dependencies
 const http = require('http');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const config = require('./config');
 const fs = require('fs');
 const handlers = require('./handlers');
 const initializeDB = require('./db');
 const utils = require('./utils');
 let db;


// Instantiate the server module object
let server = {};

 // Instantiate the HTTP server
server.httpServer = http.createServer(function(req,res){
   server.unifiedServer(req,res);
 });

 // All the server logic for both the http and https server
server.unifiedServer = function(req,res){

   // Parse the url
   let parsedUrl = url.parse(req.url, true);

   // Get the path
   let path = parsedUrl.pathname;
   let trimmedPath = path.replace(/^\/+|\/+$/g, '');

   let basePath = trimmedPath.split('/')[0].replace('?','');

   // Get the query string as an object
   let queryStringObject = parsedUrl.query;

   // Get the HTTP method
   let method = req.method.toLowerCase();

   //Get the headers as an object
   let headers = req.headers;

   // Get the payload,if any
   let decoder = new StringDecoder('utf-8');
   let buffer = '';
   req.on('data', function(data) {
       buffer += decoder.write(data);
   });
   req.on('end', function() {
       buffer += decoder.end();

       // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
       let chosenHandler = typeof(server.router[basePath]) !== 'undefined' ? server.router[basePath] : handlers.notFound;

       // Construct the data object to send to the handler
       let data = {
         'parsedUrl':    parsedUrl,
         'method' : method,
         'headers' : headers,
         'payload' : utils.parseJsonToObject(buffer),
         'db': db
       };

       // Route the request to the handler specified in the router
       chosenHandler(data, function(statusCode,payload){

         // Use the status code returned from the handler, or set the default status code to 200
         statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

         // Use the payload returned from the handler, or set the default payload to an empty object
         payload = typeof(payload) == 'object'? payload : {};

         // Convert the payload to a string
         let payloadString = JSON.stringify(payload);

         // Return the response
         res.setHeader('Content-Type', 'application/json');
         res.writeHead(statusCode);
         res.end(payloadString);
         console.log(trimmedPath,statusCode);
       });

   });
 };

 // Define the request router
server.router = {
   'ping' : handlers.ping,
   'stocks' : handlers.stocks
 };

 // Init script
server.init = function(){
  // Start the HTTP server
  server.httpServer.listen(config.httpPort,function(){
    console.log('The HTTP server is running on port '+config.httpPort);
  });

  initializeDB().then(function (newDB) {
    console.log('Initialized DB', newDB);
    db = newDB;
  })

};


 // Export the module
 module.exports = server;
