/*
 * Primary file for API
 *
 */

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config');
var fs = require('fs');
var handlers = require('./lib/handlers');
var helpers = require('./lib/helpers');

 // Instantiate the HTTP server
var httpServer = http.createServer(function(req,res){
  unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.httpPort,function(){
  console.log('The HTTP server is running on port '+config.httpPort);
});

// All the server logic for both the http and https server
var unifiedServer = function(req,res){

  // Parse the url
  var parsedUrl = url.parse(req.url, true);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP method
  var method = req.method.toLowerCase();

  //Get the headers as an object
  var headers = req.headers;

  // Get the payload,if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
      buffer += decoder.write(data);
  });
  req.on('end', function() {
      buffer += decoder.end();

      // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
      var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

      // Construct the data object to send to the handler
      var data = {
        'trimmedPath' : trimmedPath,
        'queryStringObject' : queryStringObject,
        'method' : method,
        'headers' : headers,
        'payload' : helpers.parseJsonToObject(buffer)
      };

      // Route the request to the handler specified in the router
      chosenHandler(data,function(statusCode,payload){

        // Use the status code returned from the handler, or set the default status code to 200
        statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

        // Use the payload returned from the handler, or set the default payload to an empty object
        payload = typeof(payload) == 'object'? payload : {};

        // Convert the payload to a string
        var payloadString = JSON.stringify(payload);

        // Return the response
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(payloadString);
        console.log(trimmedPath,statusCode);
      });

  });
};

// Define the request router
var router = {
  'ping' : handlers.ping,
  'users' : handlers.users
};

/*
POST:localhost:3000/stock : agrega el simbolo a la lista de monitoreo, esta en el body el simbolo a agregar 
DEL:localhost:3000/stock/<symbol> : borra el simbolo a la lista de monitoreo localhost:3000/stock/AAPL
GET:localhost:3000/stock/<symbol> : trae un solo simbolo a la lista de monitoreo EG: localhost:3000/stock/AAPL
GET:localhost:3000/stock/<symbol>?update : trae un solo simbolo a la lista de monitoreo pero actualizando el valor usando iexcloud EG: localhost:3000/stock/AAPL?update
GET:localhost:3000/stock : trae todos los simbolos de la lista de monitoreo EG: localhost:3000/stock
GET:localhost:3000/stock/?update ...: trae todos los simbolos de la lista de monitoreo EG: localhost:3000/stock/?update

Las consultas GET deberian soportar el query param ?update para que al estar incluido actualice los valores usando iexcloud


*/
